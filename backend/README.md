# Checkd Backend API

FastAPI foundation for the Checkd Health Track application.

## Overview

This is the backend REST API for Checkd, providing scalable API routing, environment configuration, and automated health checking.

## Quickstart

### 1. Create and Activate Virtual Environment

```bash
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / MacOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Access Endpoints

- **Root Endpoint**: `GET http://localhost:8000/`
- **Health Check Endpoint**: `GET http://localhost:8000/health`
- **API v1 Base Router**: `http://localhost:8000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Interactive ReDoc**: `http://localhost:8000/redoc`

### 6. Run Unit Tests

```bash
pytest
```

## Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── router.py
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── __init__.py
│   ├── services/
│   │   └── __init__.py
│   └── utils/
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```
