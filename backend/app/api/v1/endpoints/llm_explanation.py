import uuid
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.llm_explanation import ExplanationRequest, ExplanationResponse
from app.services import llm_explanation_service
from app.services.llm_service import LLMServiceError

router = APIRouter()


@router.post("/generate", response_model=ExplanationResponse, status_code=status.HTTP_201_CREATED)
def generate_explanation_endpoint(
    payload: ExplanationRequest,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate an educational plain-language explanation for an MLAnalysis record.
    Requires Bearer token authentication.
    Returns HTTP 404 if analysis_id does not exist or belongs to another user.
    """
    try:
        explanation, status_code = llm_explanation_service.generate_and_save_explanation(
            db=db,
            user_id=current_user.id,
            analysis_id=payload.analysis_id,
        )
        if not explanation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis record not found",
            )
        response.status_code = status_code
        return explanation
    except LLMServiceError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM explanation provider service is currently unavailable",
        ) from err


@router.get("/{explanation_id}", response_model=ExplanationResponse)
def get_explanation_by_id(
    explanation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a specific LLM explanation result by ID.
    Returns HTTP 404 if explanation does not exist or belongs to another user.
    """
    explanation = llm_explanation_service.get_explanation(
        db=db,
        user_id=current_user.id,
        explanation_id=explanation_id,
    )
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Explanation record not found",
        )
    return explanation
