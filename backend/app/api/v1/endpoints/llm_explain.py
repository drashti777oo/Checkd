from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.api.deps import get_current_user
from app.schemas.llm_explain import LLMExplanationRequest, LLMExplanationResponse
from app.services.llm_service import llm_service

router = APIRouter()


@router.post("/generate", response_model=LLMExplanationResponse)
def generate_ai_explanation(
    payload: LLMExplanationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    return llm_service.explain_health_metrics(payload.metrics, payload.query)
