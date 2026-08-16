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


def create_token(user_id: str, email: str = "profileuser@example.com") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "iss": "https://test.supabase.co/auth/v1",
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


def test_get_and_update_health_profile(client):
    user_id = str(uuid.uuid4())
    token = create_token(user_id)

    # 1. Get default health profile
    res = client.get(
        "/api/v1/profile/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["onboarding_completed"] is False

    # 2. Update health profile
    patch_res = client.patch(
        "/api/v1/profile/health",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "height_cm": 175.5,
            "weight_kg": 68.0,
            "health_goals": ["Sleep", "Fitness"],
            "cycle_tracking_enabled": True,
        },
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["height_cm"] == 175.5
    assert patch_res.json()["cycle_tracking_enabled"] is True


def test_complete_onboarding(client):
    user_id = str(uuid.uuid4())
    token = create_token(user_id)

    onboard_res = client.post(
        "/api/v1/profile/health/onboarding/complete",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "gender": "female",
            "height_cm": 165.0,
            "weight_kg": 55.0,
            "health_conditions": ["None"],
            "health_goals": ["General wellness"],
            "cycle_tracking_enabled": True,
        },
    )
    assert onboard_res.status_code == 200
    assert onboard_res.json()["onboarding_completed"] is True
    assert onboard_res.json()["cycle_tracking_enabled"] is True


def test_submit_and_get_daily_checkin(client):
    user_id = str(uuid.uuid4())
    token = create_token(user_id)

    # Submit today's check-in
    res = client.post(
        "/api/v1/checkin",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "mood": 4,
            "energy": 4,
            "stress": 2,
            "sleep_hours": 8.0,
            "symptoms": ["Headache"],
        },
    )
    assert res.status_code == 201
    assert res.json()["mood"] == 4

    # Verify today's checkin status
    today_res = client.get(
        "/api/v1/checkin/today",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert today_res.status_code == 200
    assert today_res.json()["sleep_hours"] == 8.0


def test_health_profile_user_isolation(client):
    user1_id = str(uuid.uuid4())
    user2_id = str(uuid.uuid4())
    token1 = create_token(user1_id, "user1@example.com")
    token2 = create_token(user2_id, "user2@example.com")

    # User 1 sets height 180
    client.patch(
        "/api/v1/profile/health",
        headers={"Authorization": f"Bearer {token1}"},
        json={"height_cm": 180.0},
    )

    # User 2 gets health profile
    res2 = client.get(
        "/api/v1/profile/health",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert res2.json()["height_cm"] is None
