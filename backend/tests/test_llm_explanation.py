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
from app.models.llm_explanation import LLMExplanation
from app.core.config import settings
from app.core.database import get_db

from app.utils.pii_sanitizer import sanitize_text, sanitize_dict
from app.services.llm_service import MockLLMService, LLMServiceError
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


def test_pii_sanitizer_scrubbing():
    """Verifies that emails, phones, SSNs, UUIDs, and JWTs are scrubbed from text and dictionaries."""
    raw_text = "Contact john.doe@example.com or call 555-123-4567 (SSN: 123-45-6789, Token: eyJhbGciOiJIUzI1NiJ9.abc.xyz)"
    clean = sanitize_text(raw_text)

    assert "john.doe@example.com" not in clean
    assert "[REDACTED_EMAIL]" in clean
    assert "555-123-4567" not in clean
    assert "[REDACTED_PHONE]" in clean
    assert "123-45-6789" not in clean
    assert "[REDACTED_SSN]" in clean
    assert "eyJhbGciOiJIUzI1NiJ9.abc.xyz" not in clean
    assert "[REDACTED_JWT]" in clean

    raw_dict = {
        "email": "hacker@example.com",
        "full_name": "Alice Hacker",
        "notes": "Patient phone is 555-987-6543",
        "valid_metric": 98.6,
    }
    clean_dict = sanitize_dict(raw_dict)
    assert "email" not in clean_dict
    assert "full_name" not in clean_dict
    assert clean_dict["valid_metric"] == 98.6
    assert "[REDACTED_PHONE]" in clean_dict["notes"]


def test_unauthenticated_explanation_requests(client):
    """Unauthenticated requests to /explain endpoints return HTTP 401."""
    res_post = client.post("/api/v1/explain/generate", json={"analysis_id": str(uuid.uuid4())})
    assert res_post.status_code == 401

    res_get = client.get(f"/api/v1/explain/{uuid.uuid4()}")
    assert res_get.status_code == 401


def test_idor_ownership_isolation(client, monkeypatch):
    """
    IDOR PROTECTION TEST:
    User A cannot generate an explanation for User B's MLAnalysis record (returns 404 Not Found).
    """
    from app.services import ml_analysis_service, llm_explanation_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())
    monkeypatch.setattr(llm_explanation_service, "default_llm_service", MockLLMService())

    user_a_id = str(uuid.uuid4())
    token_a = create_token(user_a_id, "usera@example.com")

    user_b_id = str(uuid.uuid4())
    token_b = create_token(user_b_id, "userb@example.com")

    # User B creates record and analysis
    rec_b = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token_b}"}, json={"record_type": "vitals", "data": {"hr": 70}}).json()["id"]
    analysis_b_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token_b}"}, json={"health_record_id": rec_b}).json()["id"]

    # User A attempts to generate explanation for User B's analysis -> 404 Not Found
    res_a_explains_b = client.post(
        "/api/v1/explain/generate",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"analysis_id": analysis_b_id},
    )
    assert res_a_explains_b.status_code == 404


def test_successful_explanation_generation_with_mock_llm(client, monkeypatch):
    """Verifies successful end-to-end explanation generation using MockLLMService."""
    from app.services import ml_analysis_service, llm_explanation_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())
    monkeypatch.setattr(llm_explanation_service, "default_llm_service", MockLLMService())

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "llmuser@example.com")

    rec_id = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token}"}, json={"record_type": "vitals", "data": {"hr": 72}}).json()["id"]
    analysis_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token}"}, json={"health_record_id": rec_id}).json()["id"]

    res = client.post(
        "/api/v1/explain/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={"analysis_id": analysis_id},
    )
    assert res.status_code == 201
    data = res.json()

    assert data["analysis_id"] == analysis_id
    assert data["status"] == "completed"
    assert "Controlled test explanation" in data["summary"]
    assert len(data["details"]) > 0
    assert len(data["limitations"]) > 0


def test_unconfigured_ml_model_explanation_fallback(client, monkeypatch):
    """
    Verifies that when MLAnalysis status is 'model_not_configured', LLM generation is NOT attempted
    and an unconfigured system explanation notice is returned.
    """
    from app.services import ml_analysis_service, llm_explanation_service

    unconfigured_predictor = Predictor(model_path="nonexistent.pkl")
    monkeypatch.setattr(ml_analysis_service, "default_predictor", unconfigured_predictor)

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "unconfig_llm@example.com")

    rec_id = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token}"}, json={"record_type": "vitals", "data": {"steps": 500}}).json()["id"]
    analysis_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token}"}, json={"health_record_id": rec_id}).json()["id"]

    # Verify analysis status is model_not_configured
    get_analysis_res = client.get(f"/api/v1/analysis/{analysis_id}", headers={"Authorization": f"Bearer {token}"})
    assert get_analysis_res.json()["status"] == "model_not_configured"

    # Generate explanation
    exp_res = client.post(
        "/api/v1/explain/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={"analysis_id": analysis_id},
    )
    assert exp_res.status_code == 201
    data = exp_res.json()

    assert data["status"] == "analysis_unconfigured"
    assert "pending model configuration" in data["summary"]


def test_duplicate_explanation_request_deduplication(client, monkeypatch):
    """Submitting POST /explain/generate twice for the same analysis returns existing record without creating duplicate."""
    from app.services import ml_analysis_service, llm_explanation_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())
    monkeypatch.setattr(llm_explanation_service, "default_llm_service", MockLLMService())

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "dedup@example.com")

    rec_id = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token}"}, json={"record_type": "vitals", "data": {"hr": 80}}).json()["id"]
    analysis_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token}"}, json={"health_record_id": rec_id}).json()["id"]

    res1 = client.post("/api/v1/explain/generate", headers={"Authorization": f"Bearer {token}"}, json={"analysis_id": analysis_id})
    assert res1.status_code == 201
    exp_id_1 = res1.json()["id"]

    res2 = client.post("/api/v1/explain/generate", headers={"Authorization": f"Bearer {token}"}, json={"analysis_id": analysis_id})
    assert res2.status_code == 200
    exp_id_2 = res2.json()["id"]

    assert exp_id_1 == exp_id_2


def test_provider_failure_maps_to_502_bad_gateway(client, monkeypatch):
    """Verifies that an OpenAI API error/timeout is mapped safely to HTTP 502 without leaking secrets."""
    from app.services import ml_analysis_service, llm_explanation_service

    class FailingLLMService:
        def generate_explanation(self, data):
            raise LLMServiceError("OpenAI API request timed out after 15 seconds")

    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())
    monkeypatch.setattr(llm_explanation_service, "default_llm_service", FailingLLMService())

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "fail@example.com")

    rec_id = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token}"}, json={"record_type": "vitals", "data": {"hr": 80}}).json()["id"]
    analysis_id = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token}"}, json={"health_record_id": rec_id}).json()["id"]

    res = client.post("/api/v1/explain/generate", headers={"Authorization": f"Bearer {token}"}, json={"analysis_id": analysis_id})
    assert res.status_code == 502
    assert "LLM explanation provider service is currently unavailable" in res.json()["detail"]


def test_explanation_retrieval_and_user_isolation(client, monkeypatch):
    """Verifies that User A cannot GET User B's LLMExplanation record."""
    from app.services import ml_analysis_service, llm_explanation_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())
    monkeypatch.setattr(llm_explanation_service, "default_llm_service", MockLLMService())

    user_a_id = str(uuid.uuid4())
    token_a = create_token(user_a_id, "usera_iso@example.com")

    user_b_id = str(uuid.uuid4())
    token_b = create_token(user_b_id, "userb_iso@example.com")

    rec_b = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token_b}"}, json={"record_type": "vitals", "data": {"v": 1}}).json()["id"]
    analysis_b = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token_b}"}, json={"health_record_id": rec_b}).json()["id"]
    exp_b = client.post("/api/v1/explain/generate", headers={"Authorization": f"Bearer {token_b}"}, json={"analysis_id": analysis_b}).json()["id"]

    # User A tries GET User B's explanation -> 404 Not Found
    res_a_gets_b = client.get(f"/api/v1/explain/{exp_b}", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a_gets_b.status_code == 404
