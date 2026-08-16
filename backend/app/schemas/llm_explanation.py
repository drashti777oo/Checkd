import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field


class ExplanationRequest(BaseModel):
    analysis_id: uuid.UUID = Field(..., description="ID of the MLAnalysis record to explain")


class ExplanationResponse(BaseModel):
    id: uuid.UUID
    analysis_id: uuid.UUID
    status: str
    model: str
    summary: str
    details: List[str]
    limitations: List[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
