# AI/ML Engine & Data Processing Pipelines

This folder contains the machine learning pipelines, signal feature extractors, computer vision tools (MediaPipe / OpenCV), and prediction engine for Checkd.

## Components

- `preprocessing/`: Tabular normalization and image frame preprocessing.
- `feature_extraction/`: Facial landmark and vital sign feature extraction.
- `inference/predictor.py`: Unified inference class consumed by FastAPI backend.
- `training/`: Training scripts to generate models locally.
- `evaluation/`: Accuracy, precision, recall, and ROC-AUC metrics evaluator.

> [!IMPORTANT]
> **Data Security**: Datasets containing sensitive patient records or image dumps must NEVER be committed. Store local training files under a `.gitignore` ignored `data/` directory.
