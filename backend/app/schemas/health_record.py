import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field, field_validator


class HealthRecordCreate(BaseModel):
    record_type: str = Field(..., min_length=1, max_length=100)
    recorded_at: Optional[datetime] = None
    data: Dict[str, Any] = Field(..., description="Variable JSON health observation payload")

    @field_validator("data")
    @classmethod
    def validate_data_not_empty(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(v, dict) or len(v) == 0:
            raise ValueError("Health record data payload cannot be empty")
        return v


class HealthRecordResponse(BaseModel):
    id: uuid.UUID
    record_type: str
    recorded_at: datetime
    data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HealthRecordListResponse(BaseModel):
    items: List[HealthRecordResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
