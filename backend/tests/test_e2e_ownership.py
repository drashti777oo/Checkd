import uuid
import time
import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.base import Base
from app.core.config import settings
from app.core.database import get_db

from ml.inference.predictor import MockPredictor
from app.services.llm_service import MockLLMService

TEST_JWT_SECRET = "test_secret_key_for_jwt_verification_32bytes_long_secret!"


@pytest.fixture(autouse=True)
def setup_test_auth_env(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    monkeypatch.setattr(settings, "SUPABASE_JWT_ISSUER", "https://test.supabase.co/auth/v1")
    monkeypatch.setattr(settings, "SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setattr(settings, "SUPABASE_JWKS_URL", None)

    from app.services import ml_analysis_service, llm_explanation_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())
    monkeypatch.setattr(llm_explanation_service, "default_llm_service", MockLLMService())


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield session
    app.dependency_overrides.clear()
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    return TestClient(app)


def create_token(user_id: str, email: str = "user@example.com") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "iss": "https://test.supabase.co/auth/v1",
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


def test_full_e2e_ownership_isolation_chain(client):
    """
    CRITICAL END-TO-END IDOR REGRESSION TEST:
    Executes complete pipeline for User A (HealthRecord -> MLAnalysis -> LLMExplanation -> Recommendations).
    Verifies User B receives 404 Not Found at EVERY single layer when attempting unauthorized cross-user access.
    """
    user_a_id = str(uuid.uuid4())
    token_a = create_token(user_a_id, "usera_e2e@example.com")

    user_b_id = str(uuid.uuid4())
    token_b = create_token(user_b_id, "userb_e2e@example.com")

    # Step 1: User A creates HealthRecord A
    res_rec_a = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"record_type": "vitals", "data": {"heart_rate": 72, "spo2": 99}},
    )
    assert res_rec_a.status_code == 201
    rec_a_id = res_rec_a.json()["id"]

    # Step 2: User A triggers MLAnalysis A
    res_analysis_a = client.post(
        "/api/v1/analysis/assess",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"health_record_id": rec_a_id},
    )
    assert res_analysis_a.status_code == 201
    analysis_a_id = res_analysis_a.json()["id"]

    # Step 3: User A generates LLMExplanation A
    res_explain_a = client.post(
        "/api/v1/explain/generate",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"analysis_id": analysis_a_id},
    )
    assert res_explain_a.status_code == 201
    explain_a_id = res_explain_a.json()["id"]

    # Step 4: User A generates Recommendations A
    res_recs_a = client.post(
        "/api/v1/recommendations/generate",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"analysis_id": analysis_a_id},
    )
    assert res_recs_a.status_code == 201
    recs_a_items = res_recs_a.json()["items"]
    assert len(recs_a_items) > 0
    rec_item_a_id = recs_a_items[0]["id"]

    # Step 5: User B attempts cross-user access to EVERY resource in User A's chain
    # 5a. User B GET HealthRecord A -> 404
    assert client.get(f"/api/v1/health/records/{rec_a_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 404

    # 5b. User B DELETE HealthRecord A -> 404
    assert client.delete(f"/api/v1/health/records/{rec_a_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 404

    # 5c. User B POST /analysis/assess on HealthRecord A -> 404
    assert client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token_b}"}, json={"health_record_id": rec_a_id}).status_code == 404

    # 5d. User B GET MLAnalysis A -> 404
    assert client.get(f"/api/v1/analysis/{analysis_a_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 404

    # 5e. User B POST /explain/generate on MLAnalysis A -> 404
    assert client.post("/api/v1/explain/generate", headers={"Authorization": f"Bearer {token_b}"}, json={"analysis_id": analysis_a_id}).status_code == 404

    # 5f. User B GET LLMExplanation A -> 404
    assert client.get(f"/api/v1/explain/{explain_a_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 404

    # 5g. User B POST /recommendations/generate on MLAnalysis A -> 404
    assert client.post("/api/v1/recommendations/generate", headers={"Authorization": f"Bearer {token_b}"}, json={"analysis_id": analysis_a_id}).status_code == 404

    # 5h. User B GET Recommendation A -> 404
    assert client.get(f"/api/v1/recommendations/{rec_item_a_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 404

    # 5i. User B PATCH Recommendation A -> 404
    assert client.patch(f"/api/v1/recommendations/{rec_item_a_id}", headers={"Authorization": f"Bearer {token_b}"}, json={"status": "dismissed"}).status_code == 404

    # Step 6: Verify User A can still retrieve all of their own resources cleanly
    assert client.get(f"/api/v1/health/records/{rec_a_id}", headers={"Authorization": f"Bearer {token_a}"}).status_code == 200
    assert client.get(f"/api/v1/analysis/{analysis_a_id}", headers={"Authorization": f"Bearer {token_a}"}).status_code == 200
    assert client.get(f"/api/v1/explain/{explain_a_id}", headers={"Authorization": f"Bearer {token_a}"}).status_code == 200
    assert client.get(f"/api/v1/recommendations/{rec_item_a_id}", headers={"Authorization": f"Bearer {token_a}"}).status_code == 200
