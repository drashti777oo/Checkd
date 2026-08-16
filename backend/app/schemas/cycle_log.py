import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CycleLogCreate(BaseModel):
    start_date: date
    end_date: Optional[date] = None
    flow_intensity: str = "medium"  # light, medium, heavy
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None


class CycleLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    start_date: date
    end_date: Optional[date] = None
    flow_intensity: str
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CycleLogListResponse(BaseModel):
    items: List[CycleLogResponse]
    total: int


class CyclePredictionResponse(BaseModel):
    last_period_start: Optional[date] = None
    next_predicted_start: Optional[date] = None
    next_predicted_end: Optional[date] = None
    predicted_ovulation_date: Optional[date] = None
    average_cycle_length_days: int = 28
    average_period_length_days: int = 5
