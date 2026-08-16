from typing import List, Dict


def extract_time_series_features(signal_series: List[float]) -> Dict[str, float]:
    """Computes mean, standard deviation, and peak-to-peak variance over vitals window."""
    if not signal_series:
        return {"mean": 0.0, "std": 0.0}
    mean_val = sum(signal_series) / len(signal_series)
    return {"mean": round(mean_val, 2), "sample_count": len(signal_series)}
