import uuid
import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.health_record import (
    HealthRecordCreate,
    HealthRecordResponse,
    HealthRecordListResponse,
)
from app.services import health_record_service

router = APIRouter()


@router.post("", response_model=HealthRecordResponse, status_code=status.HTTP_201_CREATED)
def create_new_health_record(
    record_in: HealthRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a new user-scoped health record observation.
    Requires Bearer token authentication. User ID is derived automatically from JWT.
    """
    return health_record_service.create_health_record(
        db=db,
        user_id=current_user.id,
        record_in=record_in,
    )


@router.get("", response_model=HealthRecordListResponse)
def list_user_health_records(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve paginated health history for the authenticated user, ordered by recorded_at DESC.
    """
    items, total = health_record_service.list_health_records(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{record_id}", response_model=HealthRecordResponse)
def get_user_health_record_by_id(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a specific health record.
    Returns 404 if the record does not exist or belongs to another user.
    """
    record = health_record_service.get_health_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health record not found",
        )
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_health_record(
    record_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a specific health record.
    Returns 404 if the record does not exist or belongs to another user.
    """
    deleted = health_record_service.delete_health_record(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health record not found",
        )
    return None
