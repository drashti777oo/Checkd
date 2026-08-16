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
from app.core.config import settings
from app.core.database import get_db

TEST_JWT_SECRET = "test_secret_key_for_jwt_verification_32bytes_long_secret!"


@pytest.fixture(autouse=True)
def setup_test_auth_env(monkeypatch):
    """Overrides Supabase settings with controlled test credentials during pytest."""
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    monkeypatch.setattr(settings, "SUPABASE_JWT_ISSUER", "https://test.supabase.co/auth/v1")
    monkeypatch.setattr(settings, "SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setattr(settings, "SUPABASE_JWKS_URL", None)


@pytest.fixture
def db_session():
    """In-memory SQLite database session fixture using StaticPool to share connection."""
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


def create_test_token(
    sub: str,
    email: str = "test@example.com",
    full_name: str = "Test User",
    aud: str = "authenticated",
    iss: str = "https://test.supabase.co/auth/v1",
    exp_delta: int = 3600,
    secret: str = TEST_JWT_SECRET,
) -> str:
    """Helper creating signed JWT tokens for testing."""
    payload = {
        "sub": sub,
        "email": email,
        "aud": aud,
        "iss": iss,
        "exp": int(time.time()) + exp_delta,
        "user_metadata": {"full_name": full_name},
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def test_missing_authorization_header(client):
    """1. Missing Authorization header returns HTTP 401."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    assert "Missing Authorization header" in response.json()["detail"]


def test_malformed_authorization_header(client):
    """2. Malformed token format (not 'Bearer <token>') returns HTTP 401."""
    response = client.get("/api/v1/users/me", headers={"Authorization": "Token 12345"})
    assert response.status_code == 401

    response2 = client.get("/api/v1/users/me", headers={"Authorization": "InvalidHeaderFormat"})
    assert response2.status_code == 401


def test_invalid_jwt_signature(client):
    """3. Invalid / corrupt JWT payload returns HTTP 401."""
    response = client.get("/api/v1/users/me", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert response.status_code == 401


def test_forged_jwt_secret(client):
    """4. Forged JWT signed with wrong secret key returns HTTP 401."""
    user_id = str(uuid.uuid4())
    forged_token = create_test_token(sub=user_id, secret="wrong_secret_key_32bytes_long_secret!!")
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {forged_token}"})
    assert response.status_code == 401


def test_expired_jwt(client):
    """5. Expired JWT returns HTTP 401."""
    user_id = str(uuid.uuid4())
    expired_token = create_test_token(sub=user_id, exp_delta=-3600)
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401


def test_wrong_audience_jwt(client):
    """6. JWT with incorrect audience (aud != 'authenticated') returns HTTP 401."""
    user_id = str(uuid.uuid4())
    wrong_aud_token = create_test_token(sub=user_id, aud="anon")
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {wrong_aud_token}"})
    assert response.status_code == 401


def test_wrong_issuer_jwt(client):
    """7. JWT with incorrect issuer returns HTTP 401."""
    user_id = str(uuid.uuid4())
    wrong_iss_token = create_test_token(sub=user_id, iss="https://untrusted-issuer.com/auth/v1")
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {wrong_iss_token}"})
    assert response.status_code == 401


def test_valid_jwt_and_automatic_user_provisioning(client, db_session):
    """8 & 9. Valid JWT authenticates user and auto-provisions missing Checkd User record."""
    user_id = str(uuid.uuid4())
    token = create_test_token(sub=user_id, email="newuser@example.com", full_name="New User")

    # Verify user does not exist prior to call
    db_user_before = db_session.query(User).filter(User.id == uuid.UUID(user_id)).first()
    assert db_user_before is None

    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == user_id
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert data["is_active"] is True

    # Verify User record was auto-provisioned in database
    db_user_after = db_session.query(User).filter(User.id == uuid.UUID(user_id)).first()
    assert db_user_after is not None


def test_existing_user_no_duplicates(client, db_session):
    """10. Existing user is retrieved without creating duplicate records."""
    user_id = uuid.uuid4()
    existing_user = User(id=user_id, email="existing@example.com", full_name="Existing User")
    db_session.add(existing_user)
    db_session.commit()

    token = create_test_token(sub=str(user_id), email="existing@example.com", full_name="Existing User")
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    user_count = db_session.query(User).filter(User.id == user_id).count()
    assert user_count == 1


def test_inactive_user_rejection(client, db_session):
    """11. Deactivated Checkd user (is_active=False) returns HTTP 403 Forbidden."""
    user_id = uuid.uuid4()
    inactive_user = User(id=user_id, email="inactive@example.com", is_active=False)
    db_session.add(inactive_user)
    db_session.commit()

    token = create_test_token(sub=str(user_id), email="inactive@example.com")
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert "User account is deactivated" in response.json()["detail"]


def test_profile_isolation(client):
    """12. Profile isolation: User A's token returns User A profile, User B's token returns User B profile."""
    user_a_id = str(uuid.uuid4())
    token_a = create_test_token(sub=user_a_id, email="usera@example.com", full_name="User A")

    user_b_id = str(uuid.uuid4())
    token_b = create_test_token(sub=user_b_id, email="userb@example.com", full_name="User B")

    res_a = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a.status_code == 200
    assert res_a.json()["id"] == user_a_id
    assert res_a.json()["email"] == "usera@example.com"

    res_b = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token_b}"})
    assert res_b.status_code == 200
    assert res_b.json()["id"] == user_b_id
    assert res_b.json()["email"] == "userb@example.com"


def test_patch_users_me_profile_update(client):
    """13. Profile update: PATCH /users/me updates allowed full_name, preventing modification of protected fields."""
    user_id = str(uuid.uuid4())
    token = create_test_token(sub=user_id, email="patch@example.com", full_name="Original Name")

    # Initial get to provision user
    client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})

    # Patch profile
    patch_res = client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Updated Name", "email": "hacked@example.com", "is_active": False},
    )
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["full_name"] == "Updated Name"
    # Verify email and is_active protected fields remained untouched
    assert data["email"] == "patch@example.com"
    assert data["is_active"] is True
