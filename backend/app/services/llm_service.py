from typing import Dict, Any, Optional
from app.utils.pii_sanitizer import sanitize_health_prompt


class LLMService:
    def explain_health_metrics(self, metrics: Dict[str, Any], query: Optional[str] = None) -> Dict[str, Any]:
        """Sanitizes PII and generates structured LLM health insights."""
        sanitized_prompt = sanitize_health_prompt(str(metrics) + (" " + query if query else ""))
        
        # Open AI API call wrapper stub
        return {
            "summary": f"Based on your metrics ({sanitized_prompt[:40]}...), your vital telemetry appears stable.",
            "recommendations": [
                "Maintain adequate daily hydration",
                "Ensure 7-8 hours of restful sleep",
                "Follow up with a certified healthcare provider for clinical diagnosis"
            ],
            "disclaimer": "This AI explanation is for wellness information only and does not constitute medical advice.",
        }


llm_service = LLMService()
