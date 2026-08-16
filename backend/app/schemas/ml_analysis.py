from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class MLAnalysisInput(BaseModel):
    features: List[float]
    category: Optional[str] = "vitals"


class MLAnalysisResult(BaseModel):
    risk_score: float
    risk_category: str
    confidence: float
    metadata: Optional[Dict[str, Any]] = None
