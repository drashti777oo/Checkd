import uuid
import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationUpdate,
    RecommendationListResponse,
)
from app.services import recommendation_service

router = APIRouter()


@router.post("/generate", response_model=RecommendationListResponse, status_code=status.HTTP_201_CREATED)
def generate_recommendations_endpoint(
    payload: RecommendationRequest,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate deterministic, user-scoped wellness recommendations for an MLAnalysis record.
    Requires Bearer token authentication.
    Returns HTTP 404 if analysis_id does not exist or belongs to another user.
    """
    items, status_code, gen_status = recommendation_service.generate_and_save_recommendations(
        db=db,
        user_id=current_user.id,
        analysis_id=payload.analysis_id,
    )
    if status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found",
        )

    response.status_code = status_code
    total = len(items)
    return {
        "items": items,
        "total": total,
        "page": 1,
        "page_size": max(1, total),
        "total_pages": 1 if total > 0 else 0,
        "generation_status": gen_status,
    }


@router.get("", response_model=RecommendationListResponse)
def list_user_recommendations(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status ('active', 'dismissed', 'completed')"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve paginated recommendations for current authenticated user.
    """
    items, total = recommendation_service.list_recommendations(
        db=db,
        user_id=current_user.id,
        status_filter=status_filter,
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
        "generation_status": "completed",
    }


@router.get("/{recommendation_id}", response_model=RecommendationResponse)
def get_recommendation_by_id(
    recommendation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a specific recommendation by ID.
    Returns HTTP 404 if recommendation does not exist or belongs to another user.
    """
    rec = recommendation_service.get_recommendation(
        db=db,
        user_id=current_user.id,
        recommendation_id=recommendation_id,
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation record not found",
        )
    return rec


@router.patch("/{recommendation_id}", response_model=RecommendationResponse)
def update_recommendation_status_endpoint(
    recommendation_id: uuid.UUID,
    payload: RecommendationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update recommendation status ('active', 'dismissed', 'completed').
    Returns HTTP 404 if recommendation does not exist or belongs to another user.
    """
    rec = recommendation_service.update_recommendation_status(
        db=db,
        user_id=current_user.id,
        recommendation_id=recommendation_id,
        new_status=payload.status,
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation record not found",
        )
    return rec
