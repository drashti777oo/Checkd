from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.health_profile import (
    HealthProfileResponse,
    HealthProfileUpdate,
    OnboardingCompleteRequest,
)
from app.services import health_profile_service, user_service

router = APIRouter()


@router.get("/health", response_model=HealthProfileResponse)
def get_user_health_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve authenticated user's health profile.
    Derives user identity from verified Bearer token.
    """
    return health_profile_service.get_or_create_health_profile(db=db, user_id=current_user.id)


@router.patch("/health", response_model=HealthProfileResponse)
def update_user_health_profile(
    profile_in: HealthProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update authenticated user's health profile settings.
    """
    # Keep user.gender synchronized if gender is updated in health profile
    if profile_in.gender is not None:
        current_user.gender = profile_in.gender.lower()
        db.add(current_user)
        db.commit()

    return health_profile_service.update_health_profile(
        db=db,
        user_id=current_user.id,
        profile_in=profile_in,
    )


@router.post("/health/onboarding/complete", response_model=HealthProfileResponse)
def complete_user_onboarding(
    onboarding_in: OnboardingCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Save onboarding responses and mark health onboarding as completed.
    """
    if onboarding_in.gender is not None:
        current_user.gender = onboarding_in.gender.lower()
        db.add(current_user)
        db.commit()

    return health_profile_service.complete_onboarding(
        db=db,
        user_id=current_user.id,
        onboarding_in=onboarding_in,
    )
