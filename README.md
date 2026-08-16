# Checkd - Health & Wellness Platform

Checkd is an AI-powered health and wellness application built for hackathons and scalable production deployments. It provides real-time health data telemetry, machine learning risk assessment, computer vision analysis, and personalized LLM-driven medical insights while upholding strict data privacy standards.

## 🚀 Architecture Overview

```
User (Browser Client)
       │
       ▼
React + Vite Frontend (TypeScript + Tailwind CSS + shadcn/ui)
       │
       ▼ REST API (JWT Authenticated)
FastAPI Backend (Python)
       ├── Auth Gateway (Supabase Auth / JWT Validation)
       ├── Health Data Service (SQLAlchemy ORM + PostgreSQL)
       ├── AI/ML Inference Pipeline (scikit-learn / OpenCV / MediaPipe)
       └── Privacy-Preserving LLM Explanation Layer (OpenAI API + PII Sanitizer)
```

## 📂 Repository Structure

- `frontend/`: React + TypeScript SPA (Vite, Tailwind, Framer Motion, Supabase Auth client)
- `backend/`: FastAPI REST server (SQLAlchemy, Pydantic, Supabase client integration)
- `ml/`: Standalone AI/ML pipeline for feature extraction, signal cleaning, and inference
- `docs/`: System architecture, API specs, security guidelines, and developer quickstart

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui primitives, Framer Motion
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn
- **AI/ML**: Scikit-Learn, OpenCV, MediaPipe, OpenAI API
- **Database & Auth**: PostgreSQL, Supabase Auth & Storage
- **Deployment**: Vercel (Frontend), Render / Railway (Backend)

## ⚡ Quickstart

Refer to [`docs/SETUP.md`](docs/SETUP.md) for detailed local development instructions.
