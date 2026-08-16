import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class HealthProfileUpdate(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    health_conditions: Optional[List[str]] = None
    health_goals: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    supplements: Optional[List[str]] = None
    cycle_tracking_enabled: Optional[bool] = None
    onboarding_completed: Optional[bool] = None


class OnboardingCompleteRequest(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    health_conditions: Optional[List[str]] = None
    health_goals: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    supplements: Optional[List[str]] = None
    cycle_tracking_enabled: bool = False


class HealthProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    health_conditions: Optional[List[str]] = None
    health_goals: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    supplements: Optional[List[str]] = None
    cycle_tracking_enabled: bool
    onboarding_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
