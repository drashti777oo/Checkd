# AI/ML Engine & Data Processing Pipelines

This folder contains the machine learning pipelines, signal feature extractors, computer vision tools (MediaPipe / OpenCV), and prediction engine for Checkd.

## ML Pipeline Architecture

```text
HealthRecord (data payload)
       │
       ▼
Preprocessing (ml/preprocessing/tabular_cleaner.py)
       │
       ▼
Feature Extraction (ml/feature_extraction/signal_features.py)
       │
       ▼
Predictor Engine (ml/inference/predictor.py)
       │
       ▼
Persisted Result (MLAnalysis model)
```

## Current Model Configuration & Safety Status

- **Production Model**: NOT CONFIGURED (No model binary checked into Git).
- **Model Version**: `development-placeholder`
- **Safety Policy**: The backend does NOT invent fake disease diagnosis or disease probabilities. When no model binary exists at `ML_MODEL_PATH`, the engine returns `status="model_not_configured"` without claiming clinical validation.

## Development & Training

- `ml/training/train_classifier.py`: Pipeline entrypoint for model training on legitimate datasets.
- `ml/evaluation/evaluate.py`: Evaluation entrypoint for computing accuracy, ROC-AUC, precision, and recall.
