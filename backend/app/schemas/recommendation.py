import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator


class RecommendationRequest(BaseModel):
    analysis_id: uuid.UUID = Field(..., description="ID of the MLAnalysis record to derive recommendations from")


class RecommendationResponse(BaseModel):
    id: uuid.UUID
    analysis_id: uuid.UUID
    category: str
    priority: str
    title: str
    description: str
    action: str
    rationale: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendationUpdate(BaseModel):
    status: str = Field(..., description="Updated status ('active', 'dismissed', 'completed')")

    @field_validator("status")
    @classmethod
    def validate_status_enum(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in {"active", "dismissed", "completed"}:
            raise ValueError("Status must be one of 'active', 'dismissed', or 'completed'")
        return v


class RecommendationListResponse(BaseModel):
    items: List[RecommendationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    generation_status: str = "completed"
