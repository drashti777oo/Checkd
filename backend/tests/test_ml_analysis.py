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


def test_unauthenticated_analysis_request(client):
    """Unauthenticated request to /analysis/assess returns HTTP 401."""
    res = client.post("/api/v1/analysis/assess", json={"health_record_id": str(uuid.uuid4())})
    assert res.status_code == 401


def test_missing_health_record_returns_404(client):
    """Attempting to analyze a non-existent HealthRecord returns HTTP 404."""
    user_id = str(uuid.uuid4())
    token = create_token(user_id)

    res = client.post(
        "/api/v1/analysis/assess",
        headers={"Authorization": f"Bearer {token}"},
        json={"health_record_id": str(uuid.uuid4())},
    )
    assert res.status_code == 404
    assert "Health record not found" in res.json()["detail"]


def test_idor_ownership_isolation(client):
    """
    IDOR PROTECTION TEST:
    User A cannot analyze User B's HealthRecord (returns 404 Not Found).
    """
    user_a_id = str(uuid.uuid4())
    token_a = create_token(user_a_id, "usera@example.com")

    user_b_id = str(uuid.uuid4())
    token_b = create_token(user_b_id, "userb@example.com")

    # User B creates Record B
    res_b = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"record_type": "vitals", "data": {"hr": 75}},
    )
    record_b_id = res_b.json()["id"]

    # User A tries to trigger analysis on User B's Record B -> HTTP 404 Not Found
    res_a_analyzes_b = client.post(
        "/api/v1/analysis/assess",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"health_record_id": record_b_id},
    )
    assert res_a_analyzes_b.status_code == 404


def test_pipeline_execution_with_mock_predictor(client, monkeypatch):
    """Verifies end-to-end pipeline execution with controlled MockPredictor."""
    from app.services import ml_analysis_service

    mock_predictor = MockPredictor(model_version="test-mock-v1")
    monkeypatch.setattr(ml_analysis_service, "default_predictor", mock_predictor)

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "mockuser@example.com")

    # Create HealthRecord
    rec_res = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token}"},
        json={"record_type": "vitals", "data": {"bpm": 72, "spo2": 98}},
    )
    rec_id = rec_res.json()["id"]

    # Trigger analysis
    assess_res = client.post(
        "/api/v1/analysis/assess",
        headers={"Authorization": f"Bearer {token}"},
        json={"health_record_id": rec_id},
    )
    assert assess_res.status_code == 201
    data = assess_res.json()

    assert data["health_record_id"] == rec_id
    assert data["status"] == "completed"
    assert data["model_version"] == "test-mock-v1"
    assert data["result"]["summary"] == "Controlled test prediction"


def test_unconfigured_model_behavior(client, monkeypatch):
    """
    Verifies that when no trained model binary exists, the system returns status='model_not_configured'
    without fabricating fake disease diagnosis or probabilities.
    """
    from app.services import ml_analysis_service

    unconfigured_predictor = Predictor(model_path="nonexistent_model.pkl", model_version="development-placeholder")
    monkeypatch.setattr(ml_analysis_service, "default_predictor", unconfigured_predictor)

    user_id = str(uuid.uuid4())
    token = create_token(user_id, "unconfig@example.com")

    rec_res = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token}"},
        json={"record_type": "vitals", "data": {"steps": 1000}},
    )
    rec_id = rec_res.json()["id"]

    assess_res = client.post(
        "/api/v1/analysis/assess",
        headers={"Authorization": f"Bearer {token}"},
        json={"health_record_id": rec_id},
    )
    assert assess_res.status_code == 201
    data = assess_res.json()

    assert data["status"] == "model_not_configured"
    assert data["model_version"] == "development-placeholder"
    assert "Production ML model is not configured yet" in data["result"]["message"]


def test_analysis_retrieval_and_user_isolation(client, monkeypatch):
    """Verifies that User A cannot retrieve User B's MLAnalysis record."""
    from app.services import ml_analysis_service
    monkeypatch.setattr(ml_analysis_service, "default_predictor", MockPredictor())

    user_a_id = str(uuid.uuid4())
    token_a = create_token(user_a_id, "usera2@example.com")

    user_b_id = str(uuid.uuid4())
    token_b = create_token(user_b_id, "userb2@example.com")

    # User B creates record and triggers analysis
    rec_b = client.post("/api/v1/health/records", headers={"Authorization": f"Bearer {token_b}"}, json={"record_type": "vitals", "data": {"v": 1}}).json()["id"]
    analysis_b = client.post("/api/v1/analysis/assess", headers={"Authorization": f"Bearer {token_b}"}, json={"health_record_id": rec_b}).json()["id"]

    # User A tries GET User B's analysis -> 404 Not Found
    res_a_gets_b = client.get(f"/api/v1/analysis/{analysis_b}", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a_gets_b.status_code == 404
