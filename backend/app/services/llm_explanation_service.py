import uuid
import logging
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.models.llm_explanation import LLMExplanation
from app.services import ml_analysis_service
from app.services.llm_service import llm_service as default_llm_service, LLMService, LLMServiceError
from app.core.config import settings

logger = logging.getLogger(__name__)


def generate_and_save_explanation(
    db: Session,
    user_id: uuid.UUID,
    analysis_id: uuid.UUID,
    custom_llm_service: Optional[LLMService] = None,
) -> Tuple[Optional[LLMExplanation], int]:
    """
    Generates and persists an educational explanation for an MLAnalysis record:
    1. Verifies MLAnalysis ownership by user_id (returns 404 if not owned by user).
    2. Checks for existing explanation to prevent duplicate LLM calls.
    3. Handles 'model_not_configured' status gracefully.
    4. Calls LLM service with sanitized inputs and persists result.
    """
    # 1. Verify MLAnalysis ownership (returns None if not owned by user)
    analysis = ml_analysis_service.get_analysis(
        db=db,
        user_id=user_id,
        analysis_id=analysis_id,
    )
    if not analysis:
        return None, 404

    # 2. Check for duplicate request - return existing stored explanation if present
    existing_explanation = (
        db.query(LLMExplanation)
        .filter(
            LLMExplanation.analysis_id == analysis_id,
            LLMExplanation.user_id == user_id,
        )
        .first()
    )
    if existing_explanation:
        logger.info(f"Returning existing stored explanation for analysis_id={analysis_id}")
        return existing_explanation, 200

    # 3. Handle unconfigured ML model state without calling LLM
    if analysis.status == "model_not_configured":
        explanation = LLMExplanation(
            id=uuid.uuid4(),
            user_id=user_id,
            analysis_id=analysis_id,
            status="analysis_unconfigured",
            model="system-notice",
            summary="The ML analysis engine is pending model configuration. Telemetry observations were recorded safely.",
            details=["Raw telemetry features extracted successfully.", "No ML inference was run."],
            limitations=["This system does not diagnose diseases or provide medical predictions."],
        )
        db.add(explanation)
        db.commit()
        db.refresh(explanation)
        return explanation, 201

    # 4. Generate LLM explanation
    analysis_payload = {
        "status": analysis.status,
        "model_version": analysis.model_version,
        "result": analysis.result,
    }

    active_llm = custom_llm_service or default_llm_service
    res = active_llm.generate_explanation(analysis_payload)

    explanation = LLMExplanation(
        id=uuid.uuid4(),
        user_id=user_id,
        analysis_id=analysis_id,
        status=res.get("status", "completed"),
        model=res.get("model", settings.OPENAI_MODEL),
        summary=res.get("summary", "Analysis summary generated."),
        details=res.get("details", []),
        limitations=res.get("limitations", []),
    )

    db.add(explanation)
    db.commit()
    db.refresh(explanation)

    logger.info(f"LLM explanation created: explanation_id={explanation.id}, user_id={user_id}")
    return explanation, 201


def get_explanation(
    db: Session,
    user_id: uuid.UUID,
    explanation_id: uuid.UUID,
) -> Optional[LLMExplanation]:
    """Retrieves a single LLM explanation enforcing user ownership in query."""
    return (
        db.query(LLMExplanation)
        .filter(
            LLMExplanation.id == explanation_id,
            LLMExplanation.user_id == user_id,
        )
        .first()
    )
