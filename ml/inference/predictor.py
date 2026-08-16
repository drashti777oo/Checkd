import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

try:
    import joblib
except ImportError:
    joblib = None


class Predictor:
    """
    ML model predictor abstraction.
    Loads model binary if available, or returns an explicit model_not_configured status.
    """
    def __init__(
        self,
        model_path: Optional[str] = "ml/models/classifier.pkl",
        model_version: str = "development-placeholder",
    ):
        self.model_path = model_path
        self.model_version = model_version
        self.model = None

        if self.model_path and os.path.exists(self.model_path) and joblib:
            try:
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded ML model from {self.model_path}")
            except Exception as e:
                logger.warning(f"Failed to load model from {self.model_path}: {e}")

    def predict(self, features: List[float]) -> Dict[str, Any]:
        """
        Runs model inference if model is loaded.
        Returns explicit status='model_not_configured' if no trained model binary exists.
        """
        if self.model is not None:
            try:
                output = self.model.predict([features])
                return {
                    "status": "completed",
                    "model_version": self.model_version,
                    "result": {
                        "model_output": output[0] if hasattr(output, "__getitem__") else str(output),
                        "feature_count": len(features),
                    },
                }
            except Exception as err:
                logger.error(f"Inference execution failed: {err}")
                return {
                    "status": "failed",
                    "model_version": self.model_version,
                    "result": {"error": "Inference execution error"},
                }

        # Model binary not present / unconfigured state
        return {
            "status": "model_not_configured",
            "model_version": self.model_version,
            "result": {
                "message": "Production ML model is not configured yet. Raw features extracted successfully.",
                "feature_count": len(features),
            },
        }


class MockPredictor(Predictor):
    """
    TEST ONLY: Controlled mock predictor for testing workflow integration.
    Never used as a production medical model.
    """
    def __init__(self, model_version: str = "test-mock-v1"):
        super().__init__(model_path=None, model_version=model_version)

    def predict(self, features: List[float]) -> Dict[str, Any]:
        return {
            "status": "completed",
            "model_version": self.model_version,
            "result": {
                "summary": "Controlled test prediction",
                "features_processed": len(features),
            },
        }


predictor = Predictor()
