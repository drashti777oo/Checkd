from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class LLMExplanationRequest(BaseModel):
    metrics: Dict[str, Any]
    query: Optional[str] = None


class LLMExplanationResponse(BaseModel):
    summary: str
    recommendations: List[str]
    disclaimer: str
