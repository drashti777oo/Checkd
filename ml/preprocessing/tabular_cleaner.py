from typing import Dict, Any


def preprocess_health_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes types, handles missing attributes, and sanitizes input telemetry.
    No medical threshold or disease interpretation is performed here.
    """
    if not isinstance(raw_data, dict):
        return {}

    cleaned = {}
    for key, value in raw_data.items():
        if isinstance(value, (int, float)):
            cleaned[key] = float(value)
        elif isinstance(value, str):
            cleaned[key] = value.strip()
        else:
            cleaned[key] = value

    return cleaned
