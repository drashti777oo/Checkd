from typing import Dict, Any, List


def extract_features(processed_data: Dict[str, Any]) -> List[float]:
    """
    Extracts generic numerical features from preprocessed telemetry payload.
    Does not invent disease-specific thresholds or clinical scores.
    """
    features: List[float] = []
    if not processed_data:
        return features

    for val in processed_data.values():
        if isinstance(val, (int, float)):
            features.append(float(val))

    return features
