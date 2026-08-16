from pydantic import BaseModel
from typing import Dict, Any, Optional


class HealthRecordCreate(BaseModel):
    record_type: str
    metrics: Dict[str, Any]
    notes: Optional[str] = None


class HealthRecordResponse(BaseModel):
    id: str
    user_id: str
    record_type: str
    metrics: Dict[str, Any]
    notes: Optional[str] = None
    created_at: str
