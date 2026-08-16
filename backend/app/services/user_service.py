import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserUpdate


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Retrieve a user by their UUID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve a user by their email address."""
    return db.query(User).filter(User.email == email).first()


def create_user(
    db: Session,
    email: str,
    full_name: Optional[str] = None,
    user_id: Optional[uuid.UUID] = None,
    is_active: bool = True,
) -> User:
    """Create a new User record."""
    user = User(
        id=user_id or uuid.uuid4(),
        email=email,
        full_name=full_name,
        is_active=is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_or_create_user_from_supabase_identity(
    db: Session,
    supabase_id: uuid.UUID,
    email: str,
    full_name: Optional[str] = None,
) -> User:
    """
    Finds matching Checkd User by Supabase UUID.
    If the record does not exist, provisions a new application-level User record.
    """
    user = get_user_by_id(db, supabase_id)
    if user:
        return user

    # Fallback email check if user was manually added or imported
    user_by_email = get_user_by_email(db, email)
    if user_by_email:
        return user_by_email

    return create_user(
        db=db,
        email=email,
        full_name=full_name,
        user_id=supabase_id,
    )


def update_user_profile(
    db: Session,
    user: User,
    user_in: UserUpdate,
) -> User:
    """Update profile attributes for an existing User."""
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
