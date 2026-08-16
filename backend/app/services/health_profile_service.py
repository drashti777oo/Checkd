import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.health_profile import UserHealthProfile
from app.schemas.health_profile import HealthProfileUpdate, OnboardingCompleteRequest


def get_or_create_health_profile(db: Session, user_id: uuid.UUID) -> UserHealthProfile:
    """Finds or creates a default user health profile."""
    profile = db.query(UserHealthProfile).filter(UserHealthProfile.user_id == user_id).first()
    if not profile:
        profile = UserHealthProfile(
            user_id=user_id,
            cycle_tracking_enabled=False,
            onboarding_completed=False,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_health_profile(
    db: Session,
    user_id: uuid.UUID,
    profile_in: HealthProfileUpdate,
) -> UserHealthProfile:
    """Updates user-scoped health profile attributes."""
    profile = get_or_create_health_profile(db, user_id)
    update_data = profile_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def complete_onboarding(
    db: Session,
    user_id: uuid.UUID,
    onboarding_in: OnboardingCompleteRequest,
) -> UserHealthProfile:
    """Saves user onboarding responses and marks onboarding as completed."""
    profile = get_or_create_health_profile(db, user_id)
    profile.date_of_birth = onboarding_in.date_of_birth
    profile.gender = onboarding_in.gender
    profile.height_cm = onboarding_in.height_cm
    profile.weight_kg = onboarding_in.weight_kg
    profile.health_conditions = onboarding_in.health_conditions
    profile.health_goals = onboarding_in.health_goals
    profile.medications = onboarding_in.medications
    profile.supplements = onboarding_in.supplements
    profile.cycle_tracking_enabled = onboarding_in.cycle_tracking_enabled
    profile.onboarding_completed = True

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
