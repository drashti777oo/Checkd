from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.api.deps import get_current_user
from app.schemas.health_data import HealthRecordCreate, HealthRecordResponse

router = APIRouter()


@router.get("/records", response_model=List[HealthRecordResponse])
def list_health_records(current_user: Dict[str, Any] = Depends(get_current_user)):
    return []


@router.post("/records", response_model=HealthRecordResponse)
def create_health_record(
    payload: HealthRecordCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    return {
        "id": "rec_stub_123",
        "user_id": current_user.get("sub", "anon"),
        "record_type": payload.record_type,
        "metrics": payload.metrics,
        "notes": payload.notes,
        "created_at": "2026-08-16T12:00:00Z",
    }
