from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user import UserResponse, UserUpdate
from app.models.user import User
from app.services import user_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def read_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve current authenticated user profile.
    Requires Authorization: Bearer <SUPABASE_ACCESS_TOKEN> header.
    """
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_current_user_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update current authenticated user profile (full_name).
    Requires Authorization: Bearer <SUPABASE_ACCESS_TOKEN> header.
    """
    return user_service.update_user_profile(db, current_user, user_in)
