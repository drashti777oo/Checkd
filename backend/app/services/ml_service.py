from typing import List, Dict, Any


class MLService:
    def predict_risk(self, features: List[float]) -> Dict[str, Any]:
        """Wrapper invoking inference pipeline from the ml/ engine module."""
        # Baseline heuristic/mock prediction for initial setup
        score = sum(features) / (len(features) or 1)
        risk_category = "low" if score < 0.5 else "moderate" if score < 0.8 else "high"
        return {
            "risk_score": round(score, 2),
            "risk_category": risk_category,
            "confidence": 0.92,
            "metadata": {"extracted_feature_count": len(features)},
        }


ml_service = MLService()
