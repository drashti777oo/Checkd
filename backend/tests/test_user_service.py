import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from app.models.base import Base
from app.models.user import User
from app.schemas.user import UserUpdate
from app.services import user_service


@pytest.fixture
def db_session():
    """Fixture providing an isolated in-memory SQLite database session for unit tests."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def test_user_model_defaults_and_constraints(db_session):
    """Verify User model UUID generation, timestamp creation, and defaults."""
    user = User(email="test@example.com", full_name="Jane Doe")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert isinstance(user.id, uuid.UUID)
    assert user.email == "test@example.com"
    assert user.full_name == "Jane Doe"
    assert user.is_active is True
    assert user.created_at is not None
    assert user.updated_at is not None


def test_user_email_uniqueness(db_session):
    """Verify that duplicate email addresses trigger an IntegrityError at the DB level."""
    u1 = User(email="duplicate@example.com")
    db_session.add(u1)
    db_session.commit()

    u2 = User(email="duplicate@example.com")
    db_session.add(u2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_create_and_get_user_service(db_session):
    """Verify user_service create_user, get_user_by_id, and get_user_by_email."""
    custom_uuid = uuid.uuid4()
    user = user_service.create_user(
        db=db_session,
        email="service@example.com",
        full_name="Service User",
        user_id=custom_uuid,
    )

    assert user.id == custom_uuid
    assert user.email == "service@example.com"

    by_id = user_service.get_user_by_id(db_session, custom_uuid)
    assert by_id is not None
    assert by_id.email == "service@example.com"

    by_email = user_service.get_user_by_email(db_session, "service@example.com")
    assert by_email is not None
    assert by_email.id == custom_uuid


def test_update_user_profile_service(db_session):
    """Verify user_service update_user_profile."""
    user = user_service.create_user(
        db=db_session,
        email="update@example.com",
        full_name="Original Name",
    )

    updated = user_service.update_user_profile(
        db=db_session,
        user=user,
        user_in=UserUpdate(full_name="Updated Name"),
    )

    assert updated.full_name == "Updated Name"
