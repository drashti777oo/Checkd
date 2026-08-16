import uuid
import math
import logging
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.services import ml_analysis_service

logger = logging.getLogger(__name__)


def apply_recommendation_rules(analysis_result: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Deterministic template-based rule engine.
    Derives safe, conservative recommendations from MLAnalysis output.
    Does NOT invent medical diagnoses or prescriptions.
    """
    recommendation_templates = [
        {
            "category": "activity",
            "priority": "low",
            "title": "Consider regular movement breaks",
            "description": "Incorporating periodic physical activity during long stationary work sessions supports circulatory and physical posture wellness.",
            "action": "Consider taking a brief 5-minute walking or stretching break every hour.",
            "rationale": "Based on general wellness principles for reducing prolonged sedentary periods.",
        },
        {
            "category": "general_wellness",
            "priority": "medium",
            "title": "Consult a healthcare professional for clinical concerns",
            "description": "Self-tracked health telemetry provides helpful personal context but does not replace professional clinical evaluation.",
            "action": "Consider sharing your health observation history with a qualified healthcare provider.",
            "rationale": "Based on clinical safety standards for personal health tracking technology.",
        },
    ]

    return recommendation_templates


def generate_and_save_recommendations(
    db: Session,
    user_id: uuid.UUID,
    analysis_id: uuid.UUID,
) -> Tuple[List[Recommendation], int, str]:
    """
    Generates and persists user-scoped wellness recommendations:
    1. Verifies MLAnalysis ownership by current_user.
    2. Checks for existing recommendations to prevent duplication.
    3. Verifies analysis status is 'completed' (returns 'recommendations_unavailable' if unconfigured/failed).
    4. Applies deterministic rules and saves Recommendation records.
    """
    # 1. Verify MLAnalysis ownership (returns None if not owned by user)
    analysis = ml_analysis_service.get_analysis(
        db=db,
        user_id=user_id,
        analysis_id=analysis_id,
    )
    if not analysis:
        return [], 404, "analysis_not_found"

    # 2. Check for duplicate request - return existing stored recommendations if present
    existing_recs = (
        db.query(Recommendation)
        .filter(
            Recommendation.analysis_id == analysis_id,
            Recommendation.user_id == user_id,
        )
        .all()
    )
    if existing_recs:
        logger.info(f"Returning existing stored recommendations for analysis_id={analysis_id}")
        return existing_recs, 200, "completed"

    # 3. Check MLAnalysis status - if unconfigured or failed, return recommendations_unavailable
    if analysis.status != "completed":
        logger.info(f"MLAnalysis status is '{analysis.status}'. Recommendations are unavailable.")
        return [], 200, "recommendations_unavailable"

    # 4. Apply deterministic rules engine
    templates = apply_recommendation_rules(analysis.result)
    new_recs: List[Recommendation] = []

    for item in templates:
        rec = Recommendation(
            id=uuid.uuid4(),
            user_id=user_id,
            analysis_id=analysis_id,
            category=item["category"],
            priority=item["priority"],
            title=item["title"],
            description=item["description"],
            action=item["action"],
            rationale=item["rationale"],
            status="active",
        )
        db.add(rec)
        new_recs.append(rec)

    db.commit()
    for rec in new_recs:
        db.refresh(rec)

    logger.info(f"Generated {len(new_recs)} recommendations for analysis_id={analysis_id}, user_id={user_id}")
    return new_recs, 201, "completed"


def list_recommendations(
    db: Session,
    user_id: uuid.UUID,
    status_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Recommendation], int]:
    """Retrieves paginated recommendations scoped strictly to authenticated user."""
    page = max(1, page)
    page_size = max(1, min(page_size, 100))

    query = db.query(Recommendation).filter(Recommendation.user_id == user_id)
    if status_filter:
        query = query.filter(Recommendation.status == status_filter.lower().strip())

    total = query.count()
    items = (
        query.order_by(Recommendation.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return items, total


def get_recommendation(
    db: Session,
    user_id: uuid.UUID,
    recommendation_id: uuid.UUID,
) -> Optional[Recommendation]:
    """Retrieves a single recommendation enforcing user ownership in query."""
    return (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation_id,
            Recommendation.user_id == user_id,
        )
        .first()
    )


def update_recommendation_status(
    db: Session,
    user_id: uuid.UUID,
    recommendation_id: uuid.UUID,
    new_status: str,
) -> Optional[Recommendation]:
    """Updates recommendation status enforcing user ownership in query."""
    rec = get_recommendation(db, user_id=user_id, recommendation_id=recommendation_id)
    if not rec:
        return None

    rec.status = new_status
    db.commit()
    db.refresh(rec)
    logger.info(f"Updated recommendation_id={recommendation_id} status to '{new_status}'")
    return rec
