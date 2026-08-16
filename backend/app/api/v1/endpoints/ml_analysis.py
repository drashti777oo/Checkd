from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.api.deps import get_current_user
from app.schemas.ml_analysis import MLAnalysisInput, MLAnalysisResult
from app.services.ml_service import ml_service

router = APIRouter()


@router.post("/assess", response_model=MLAnalysisResult)
def run_ml_risk_assessment(
    payload: MLAnalysisInput,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    return ml_service.predict_risk(payload.features)
