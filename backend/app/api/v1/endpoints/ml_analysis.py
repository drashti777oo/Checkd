import uuid
import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.ml_analysis import (
    MLAnalysisRequest,
    MLAnalysisResponse,
    MLAnalysisListResponse,
)
from app.services import ml_analysis_service

router = APIRouter()


@router.post("/assess", response_model=MLAnalysisResponse, status_code=status.HTTP_201_CREATED)
def assess_health_record(
    payload: MLAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger ML analysis pipeline on a user's HealthRecord.
    Requires Bearer token authentication.
    Returns HTTP 404 if health_record_id does not exist or belongs to another user.
    """
    analysis = ml_analysis_service.create_analysis(
        db=db,
        user_id=current_user.id,
        health_record_id=payload.health_record_id,
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health record not found",
        )
    return analysis


@router.get("", response_model=MLAnalysisListResponse)
def list_user_analyses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve paginated ML analysis history for current authenticated user.
    """
    items, total = ml_analysis_service.list_analyses(
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


@router.get("/{analysis_id}", response_model=MLAnalysisResponse)
def get_analysis_by_id(
    analysis_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a specific ML analysis result by ID.
    Returns HTTP 404 if analysis does not exist or belongs to another user.
    """
    analysis = ml_analysis_service.get_analysis(
        db=db,
        user_id=current_user.id,
        analysis_id=analysis_id,
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found",
        )
    return analysis
