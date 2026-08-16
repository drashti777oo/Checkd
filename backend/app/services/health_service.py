from typing import Dict, Any


class HealthService:
    def create_record(self, user_id: str, record_type: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": "rec_123",
            "user_id": user_id,
            "record_type": record_type,
            "metrics": metrics,
        }


health_service = HealthService()
