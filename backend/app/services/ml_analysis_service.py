import sys
import os
import uuid
import math
import logging
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session

# Ensure parent root directory is present in sys.path to locate the monorepo ml module
monorepo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if monorepo_root not in sys.path:
    sys.path.insert(0, monorepo_root)

from app.models.ml_analysis import MLAnalysis
from app.services import health_record_service
from app.core.config import settings

from ml.preprocessing.tabular_cleaner import preprocess_health_data
from ml.feature_extraction.signal_features import extract_features
from ml.inference.predictor import predictor as default_predictor, Predictor

logger = logging.getLogger(__name__)


def create_analysis(
    db: Session,
    user_id: uuid.UUID,
    health_record_id: uuid.UUID,
    custom_predictor: Optional[Predictor] = None,
) -> Optional[MLAnalysis]:
    """
    Executes the ML processing pipeline on a user's HealthRecord:
    1. Verifies HealthRecord ownership by current_user.
    2. Runs input preprocessing & feature extraction.
    3. Runs predictor inference.
    4. Persists structured MLAnalysis record.
    """
    # 1. Retrieve HealthRecord enforcing user ownership (returns None if not owned by user)
    health_record = health_record_service.get_health_record(
        db=db,
        user_id=user_id,
        record_id=health_record_id,
    )
    if not health_record:
        return None

    # 2. Pipeline processing
    preprocessed_data = preprocess_health_data(health_record.data)
    features = extract_features(preprocessed_data)

    # 3. Model prediction
    active_predictor = custom_predictor or default_predictor
    pred_output = active_predictor.predict(features)

    # 4. Save MLAnalysis record
    status_str = pred_output.get("status", "completed")
    version_str = pred_output.get("model_version", settings.ML_MODEL_VERSION)
    result_dict = pred_output.get("result", {})

    analysis = MLAnalysis(
        id=uuid.uuid4(),
        user_id=user_id,
        health_record_id=health_record_id,
        status=status_str,
        model_version=version_str,
        result=result_dict,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    logger.info(
        f"ML analysis created: analysis_id={analysis.id}, "
        f"user_id={user_id}, status={status_str}, model_version={version_str}"
    )
    return analysis


def get_analysis(
    db: Session,
    user_id: uuid.UUID,
    analysis_id: uuid.UUID,
) -> Optional[MLAnalysis]:
    """Retrieves a single ML analysis record enforcing user ownership in query."""
    return (
        db.query(MLAnalysis)
        .filter(
            MLAnalysis.id == analysis_id,
            MLAnalysis.user_id == user_id,
        )
        .first()
    )


def list_analyses(
    db: Session,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[MLAnalysis], int]:
    """Retrieves paginated ML analysis history scoped to the user, ordered by created_at desc."""
    page = max(1, page)
    page_size = max(1, min(page_size, 100))

    query = db.query(MLAnalysis).filter(MLAnalysis.user_id == user_id)
    total = query.count()

    items = (
        query.order_by(MLAnalysis.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return items, total
