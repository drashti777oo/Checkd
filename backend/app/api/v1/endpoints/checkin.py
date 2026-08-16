from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.daily_checkin import (
    DailyCheckInCreate,
    DailyCheckInResponse,
    DailyCheckInListResponse,
    DailyCheckInStatsResponse,
)
from app.services import checkin_service

router = APIRouter()


@router.post("", response_model=DailyCheckInResponse, status_code=status.HTTP_201_CREATED)
def submit_daily_checkin(
    checkin_in: DailyCheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit today's daily check-in entry (mood, energy, stress, sleep, symptoms).
    Allows one check-in per day per user.
    """
    return checkin_service.create_or_update_daily_checkin(
        db=db,
        user_id=current_user.id,
        checkin_in=checkin_in,
    )


@router.get("/today", response_model=Optional[DailyCheckInResponse])
def get_today_checkin_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Check if the user has already submitted a check-in today.
    """
    return checkin_service.get_today_checkin(db=db, user_id=current_user.id)


@router.get("/stats", response_model=DailyCheckInStatsResponse)
def get_checkin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve user-scoped check-in streak and statistics calculated from database records.
    """
    return checkin_service.calculate_checkin_streak(db=db, user_id=current_user.id)


@router.get("/history", response_model=DailyCheckInListResponse)
def get_checkin_history(
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve user-scoped daily check-in history.
    """
    items, total = checkin_service.list_user_checkins(
        db=db,
        user_id=current_user.id,
        limit=limit,
    )
    return {"items": items, "total": total}
