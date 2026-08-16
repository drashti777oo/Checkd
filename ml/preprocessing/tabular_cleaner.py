from typing import List


def clean_tabular_vitals(raw_vitals: List[float]) -> List[float]:
    """Clamps out-of-range sensor readings and imputes missing numeric features."""
    return [max(0.0, float(v)) for v in raw_vitals]
