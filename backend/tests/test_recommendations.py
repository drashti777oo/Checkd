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
from app.models.user import User
from app.models.health_record import HealthRecord
from app.models.ml_analysis import MLAnalysis
from app.models.recommendation import Recommendation
from app.core.config import settings
from app.core.database import get_db

from ml.inference.predictor import MockPredictor, Predictor

TEST_JWT_SECRET = "test_secret_key_for_jwt_verification_32bytes_long_secret!"


@pytest.fixture(autouse=True)
def setup_test_auth_env(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    monkeypatch.setattr(settings, "SUPABASE_JWT_ISSUER", "https://test.supabase.co/auth/v1")
    monkeypatch.setattr(settings, "SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setattr(settings, "SUPABASE_JWKS_URL", None)


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


def test_unauthenticated_recommendation_requests(client):
    """Unauthenticated requests to /recommendations endpoints return HTTP 401."""
    res_post = client.post("/api/v1/recommendations/generate", json={"analysis_id": str(uuid.uuid4())})
    assert res_post.status_code == 401

    res_get = client.get("/api/v1/recommendations")
    assert res_get.status_code == 401

    res_get_one = client.get(f"/api/v1/recommendations/{uuid.uuid4()}")
    assert res_get_one.status_code == 401

    res_patch = client.patch(f"/api/v1/recommendations/{uuid.uuid4()}", json={"status": "dismissed"})
    assert res_patch.status_code == 401


def test_idor_ownership_isolation(client, monkeypatch):
    """
    IDOR PROTECTION TEST:
    User A cannot generate recommendations from User B's MLAnalysis record (returns 404 Not Found).
    """
    from app.services import ml_analysis_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())

    user_a_id = str(uuid.uuid4())
    token_a = create_token(user_a_id, "usera@example.com")

    user_b_id = str(uuid.uuid4())
    token_b = create_token(user_b_id, "userb@example.com")

    # User B creates record and analysis
    rec_b = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token_b}"}, json={"record_type": "vitals", "data": {"hr": 70}}).json()["id"]
    analysis_b_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token_b}"}, json={"health_record_id": rec_b}).json()["id"]

    # User A attempts to generate recommendations for User B's analysis -> 404 Not Found
    res_a_rec_b = client.post(
        "/api/v1/recommendations/generate",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"analysis_id": analysis_b_id},
    )
    assert res_a_rec_b.status_code == 404


def test_successful_recommendation_generation(client, monkeypatch):
    """Verifies successful end-to-end deterministic recommendation generation for a completed MLAnalysis."""
    from app.services import ml_analysis_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "recuser@example.com")

    rec_id = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token}"}, json={"record_type": "vitals", "data": {"hr": 75}}).json()["id"]
    analysis_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token}"}, json={"health_record_id": rec_id}).json()["id"]

    res = client.post(
        "/api/v1/recommendations/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={"analysis_id": analysis_id},
    )
    assert res.status_code == 201
    data = res.json()

    assert data["generation_status"] == "completed"
    assert len(data["items"]) > 0

    first_item = data["items"][0]
    assert first_item["analysis_id"] == analysis_id
    assert first_item["status"] == "active"
    assert "movement" in first_item["title"].lower() or "wellness" in first_item["title"].lower()


def test_unconfigured_ml_model_recommendations_unavailable(client, monkeypatch):
    """
    Verifies that when MLAnalysis status is 'model_not_configured', recommendations generation returns
    generation_status='recommendations_unavailable' and an empty list without fabricating health claims.
    """
    from app.services import ml_analysis_service

    unconfigured_predictor = Predictor(model_path="nonexistent.pkl")
    monkeypatch.setattr(ml_analysis_service, "default_predictor", unconfigured_predictor)

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "unconfig_rec@example.com")

    rec_id = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token}"}, json={"record_type": "vitals", "data": {"steps": 500}}).json()["id"]
    analysis_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token}"}, json={"health_record_id": rec_id}).json()["id"]

    rec_res = client.post(
        "/api/v1/recommendations/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={"analysis_id": analysis_id},
    )
    assert rec_res.status_code == 200
    data = rec_res.json()

    assert data["generation_status"] == "recommendations_unavailable"
    assert len(data["items"]) == 0


def test_duplicate_recommendation_request_deduplication(client, monkeypatch):
    """Submitting POST /recommendations/generate twice for the same analysis returns existing record without creating duplicate."""
    from app.services import ml_analysis_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "dedup_rec@example.com")

    rec_id = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token}"}, json={"record_type": "vitals", "data": {"hr": 80}}).json()["id"]
    analysis_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token}"}, json={"health_record_id": rec_id}).json()["id"]

    res1 = client.post("/api/v1/recommendations/generate", headers={"Authorization": f"Bearer {token}"}, json={"analysis_id": analysis_id})
    assert res1.status_code == 201
    items1_ids = [item["id"] for item in res1.json()["items"]]

    res2 = client.post("/api/v1/recommendations/generate", headers={"Authorization": f"Bearer {token}"}, json={"analysis_id": analysis_id})
    assert res2.status_code == 200
    items2_ids = [item["id"] for item in res2.json()["items"]]

    assert items1_ids == items2_ids


def test_recommendation_status_update_and_user_isolation(client, monkeypatch):
    """Verifies that User can PATCH recommendation status to 'dismissed' or 'completed', and User A cannot update User B's recommendation."""
    from app.services import ml_analysis_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())

    user_a_id = str(uuid.uuid4())
    token_a = create_token(user_a_id, "usera_patch@example.com")

    user_b_id = str(uuid.uuid4())
    token_b = create_token(user_b_id, "userb_patch@example.com")

    rec_a = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token_a}"}, json={"record_type": "vitals", "data": {"v": 1}}).json()["id"]
    analysis_a = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token_a}"}, json={"health_record_id": rec_a}).json()["id"]
    recs_a = client.post("/api/v1/recommendations/generate", headers={"Authorization": f"Bearer {token_a}"}, json={"analysis_id": analysis_a}).json()["items"]
    rec_a_id = recs_a[0]["id"]

    # User A updates status to 'completed' -> 200
    patch_res = client.patch(
        f"/api/v1/recommendations/{rec_a_id}",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"status": "completed"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "completed"

    # User B attempts to PATCH User A's recommendation -> 404 Not Found
    res_b_patches_a = client.patch(
        f"/api/v1/recommendations/{rec_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"status": "dismissed"},
    )
    assert res_b_patches_a.status_code == 404


def test_medical_safety_text_validation(client, monkeypatch):
    """Verifies recommendation text contains no unauthorized medical diagnosis or prescription claims."""
    from app.services import ml_analysis_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "safety@example.com")

    rec_id = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token}"}, json={"record_type": "vitals", "data": {"hr": 80}}).json()["id"]
    analysis_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token}"}, json={"health_record_id": rec_id}).json()["id"]

    recs = client.post("/api/v1/recommendations/generate", headers={"Authorization": f"Bearer {token}"}, json={"analysis_id": analysis_id}).json()["items"]

    forbidden_terms = ["diagnose", "prescription", "medication", "dosage", "cure", "disease"]
    for rec in recs:
        full_text = f"{rec['title']} {rec['description']} {rec['action']} {rec['rationale']}".lower()
        for term in forbidden_terms:
            assert term not in full_text
