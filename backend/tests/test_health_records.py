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


def create_token(user_id: str, email: str = "user@example.com") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "iss": "https://test.supabase.co/auth/v1",
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


def test_unauthenticated_requests(client):
    """Unauthenticated requests to health record endpoints return HTTP 401."""
    res_post = client.post("/api/v1/health/records", json={"record_type": "vitals", "data": {"hr": 70}})
    assert res_post.status_code == 401

    res_get = client.get("/api/v1/health/records")
    assert res_get.status_code == 401

    res_delete = client.delete(f"/api/v1/health/records/{uuid.uuid4()}")
    assert res_delete.status_code == 401


def test_create_health_record(client, db_session):
    """User A creates a health record. User ID is assigned automatically from verified JWT."""
    user_id = str(uuid.uuid4())
    token = create_token(user_id, "usera@example.com")

    payload = {
        "record_type": "vitals",
        "data": {"metric": "heart_rate", "value": 72, "unit": "bpm"},
    }

    response = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert response.status_code == 201
    data = response.json()

    assert "id" in data
    assert data["record_type"] == "vitals"
    assert data["data"] == payload["data"]
    assert "recorded_at" in data

    # DB verification
    db_record = db_session.query(HealthRecord).filter(HealthRecord.id == uuid.UUID(data["id"])).first()
    assert db_record is not None
    assert str(db_record.user_id) == user_id


def test_list_health_records_and_pagination(client):
    """List endpoint returns user's records ordered by recorded_at DESC with pagination."""
    user_id = str(uuid.uuid4())
    token = create_token(user_id, "listuser@example.com")

    # Create 5 records
    for i in range(5):
        client.post(
            "/api/v1/health/records",
            headers={"Authorization": f"Bearer {token}"},
            json={"record_type": "symptom", "data": {"index": i}},
        )

    response = client.get(
        "/api/v1/health/records?page=1&page_size=3",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 5
    assert len(data["items"]) == 3
    assert data["page"] == 1
    assert data["page_size"] == 3
    assert data["total_pages"] == 2


def test_user_isolation(client):
    """
    MANDATORY USER ISOLATION TEST:
    User A cannot view or delete User B's health record (returns HTTP 404).
    """
    user_a_id = str(uuid.uuid4())
    token_a = create_token(user_a_id, "usera@example.com")

    user_b_id = str(uuid.uuid4())
    token_b = create_token(user_b_id, "userb@example.com")

    # User A creates Record A
    res_a = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"record_type": "vitals", "data": {"user": "A"}},
    )
    record_a_id = res_a.json()["id"]

    # User B creates Record B
    res_b = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"record_type": "vitals", "data": {"user": "B"}},
    )
    record_b_id = res_b.json()["id"]

    # User A GET Record A -> 200
    assert client.get(f"/api/v1/health/records/{record_a_id}", headers={"Authorization": f"Bearer {token_a}"}).status_code == 200

    # User B GET Record B -> 200
    assert client.get(f"/api/v1/health/records/{record_b_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 200

    # User A GET Record B -> 404 Not Found (Isolation enforced)
    res_a_gets_b = client.get(f"/api/v1/health/records/{record_b_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a_gets_b.status_code == 404

    # User B GET Record A -> 404 Not Found (Isolation enforced)
    res_b_gets_a = client.get(f"/api/v1/health/records/{record_a_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert res_b_gets_a.status_code == 404

    # User A DELETE Record B -> 404 Not Found
    res_a_del_b = client.delete(f"/api/v1/health/records/{record_b_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a_del_b.status_code == 404

    # Verify Record B was NOT deleted
    assert client.get(f"/api/v1/health/records/{record_b_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 200


def test_delete_health_record(client):
    """User can delete their own health record."""
    user_id = str(uuid.uuid4())
    token = create_token(user_id, "del@example.com")

    res = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token}"},
        json={"record_type": "vitals", "data": {"metric": "temp"}},
    )
    rec_id = res.json()["id"]

    del_res = client.delete(f"/api/v1/health/records/{rec_id}", headers={"Authorization": f"Bearer {token}"})
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/health/records/{rec_id}", headers={"Authorization": f"Bearer {token}"})
    assert get_res.status_code == 404


def test_input_validation(client):
    """Empty or malformed payload returns HTTP 422 Unprocessable Entity."""
    user_id = str(uuid.uuid4())
    token = create_token(user_id, "valid@example.com")

    # Empty payload dictionary
    res_empty_data = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token}"},
        json={"record_type": "vitals", "data": {}},
    )
    assert res_empty_data.status_code == 422

    # Missing record_type
    res_missing_type = client.post(
        "/api/v1/health/records",
        headers={"Authorization": f"Bearer {token}"},
        json={"data": {"val": 10}},
    )
    assert res_missing_type.status_code == 422
