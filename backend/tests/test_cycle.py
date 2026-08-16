import uuid
import time
import jwt
import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.base import Base
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

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


def create_token(user_id: str, email: str = "cycleuser@example.com") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "iss": "https://test.supabase.co/auth/v1",
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


def test_female_user_can_log_cycle_and_get_predictions(client, db_session):
    user_id = str(uuid.uuid4())
    token = create_token(user_id)

    # 1. Set user gender to female via PATCH /users/me
    patch_res = client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"gender": "female"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["gender"] == "female"

    # 2. Log period entry
    log_res = client.post(
        "/api/v1/cycle/log",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "start_date": "2026-08-01",
            "end_date": "2026-08-05",
            "flow_intensity": "medium",
            "symptoms": ["Cramps", "Fatigue"],
        },
    )
    assert log_res.status_code == 201
    assert log_res.json()["flow_intensity"] == "medium"

    # 3. Get predictions
    pred_res = client.get(
        "/api/v1/cycle/prediction",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pred_res.status_code == 200
    assert pred_res.json()["next_predicted_start"] == "2026-08-29"


def test_non_female_user_rejected_with_403(client, db_session):
    user_id = str(uuid.uuid4())
    token = create_token(user_id, email="maleuser@example.com")

    # Set user gender to male
    client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"gender": "male"},
    )

    # Attempting cycle log should fail with HTTP 403 Forbidden
    log_res = client.post(
        "/api/v1/cycle/log",
        headers={"Authorization": f"Bearer {token}"},
        json={"start_date": "2026-08-01"},
    )
    assert log_res.status_code == 403
    assert "female" in log_res.json()["detail"].lower()
