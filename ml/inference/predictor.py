from typing import List, Dict, Any
from ml.preprocessing.tabular_cleaner import clean_tabular_vitals


class Predictor:
    def __init__(self, model_path: str = "ml/models/classifier.pkl"):
        self.model_path = model_path
        # In actual usage: self.model = joblib.load(model_path)

    def predict(self, raw_features: List[float]) -> Dict[str, Any]:
        cleaned_features = clean_tabular_vitals(raw_features)
        mean_score = sum(cleaned_features) / (len(cleaned_features) or 1)
        
        return {
            "prediction": "stable" if mean_score < 0.7 else "requires_review",
            "score": round(mean_score, 4),
            "features_processed": len(cleaned_features),
        }


if __name__ == "__main__":
    predictor = Predictor()
    result = predictor.predict([0.2, 0.4, 0.6])
    print("Inference Test Output:", result)
