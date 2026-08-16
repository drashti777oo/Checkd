import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field


class MLAnalysisRequest(BaseModel):
    health_record_id: uuid.UUID = Field(..., description="ID of the HealthRecord to analyze")


class MLAnalysisResponse(BaseModel):
    id: uuid.UUID
    health_record_id: uuid.UUID
    status: str
    model_version: str
    result: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MLAnalysisListResponse(BaseModel):
    items: List[MLAnalysisResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
