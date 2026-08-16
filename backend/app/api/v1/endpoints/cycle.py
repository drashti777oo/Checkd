from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.cycle_log import (
    CycleLogCreate,
    CycleLogResponse,
    CycleLogListResponse,
    CyclePredictionResponse,
)
from app.services import cycle_service

router = APIRouter()


def verify_female_gender_access(current_user: User):
    """
    Enforces gender-specific access control.
    Cycle tracking endpoints return 403 Forbidden for non-female user profiles.
    """
    if not current_user.gender or current_user.gender.lower() != "female":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cycle tracking features are only accessible for user profiles configured with female gender.",
        )


@router.post("/log", response_model=CycleLogResponse, status_code=status.HTTP_201_CREATED)
def log_cycle_entry(
    log_in: CycleLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Log a new period/menstrual cycle entry.
    Requires Bearer token authentication. Restricted to female user profiles.
    """
    verify_female_gender_access(current_user)
    return cycle_service.create_cycle_log(db=db, user_id=current_user.id, log_in=log_in)


@router.get("/logs", response_model=CycleLogListResponse)
def get_cycle_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve user-scoped cycle logs.
    Requires Bearer token authentication. Restricted to female user profiles.
    """
    verify_female_gender_access(current_user)
    items, total = cycle_service.list_cycle_logs(db=db, user_id=current_user.id)
    return {"items": items, "total": total}


@router.get("/prediction", response_model=CyclePredictionResponse)
def get_cycle_prediction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get menstrual cycle predictions (next period start/end date and estimated ovulation window).
    Requires Bearer token authentication. Restricted to female user profiles.
    """
    verify_female_gender_access(current_user)
    return cycle_service.get_cycle_prediction(db=db, user_id=current_user.id)
