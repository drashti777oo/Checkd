import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class DailyCheckInCreate(BaseModel):
    mood: int = Field(3, ge=1, le=5, description="Mood rating from 1 to 5")
    energy: int = Field(3, ge=1, le=5, description="Energy level from 1 to 5")
    stress: int = Field(3, ge=1, le=5, description="Stress level from 1 to 5")
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    sleep_quality: Optional[str] = None
    exercise_minutes: Optional[int] = Field(None, ge=0)
    water_intake_ml: Optional[int] = Field(None, ge=0)
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None


class DailyCheckInResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    checkin_date: date
    mood: int
    energy: int
    stress: int
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[str] = None
    exercise_minutes: Optional[int] = None
    water_intake_ml: Optional[int] = None
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DailyCheckInListResponse(BaseModel):
    items: List[DailyCheckInResponse]
    total: int
