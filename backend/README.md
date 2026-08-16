# Checkd Backend API

FastAPI foundation, database layer, User profile model, Supabase JWT Authentication, Health Records Data Layer, ML Analysis Engine, and LLM Explanation Layer for the Checkd Health Track application.

## Overview

This is the backend REST API for Checkd, providing scalable API routing, environment configuration, database connection management, User database models, user-scoped Health Records persistence, ML pipeline execution, LLM-powered educational explanations (OpenAI), Supabase JWT verification, and Alembic migrations.

## Directory Structure

```text
backend/
├── alembic/
│   ├── versions/
│   │   ├── 001_create_users_table.py
│   │   ├── 002_create_health_records_table.py
│   │   ├── 003_create_ml_analysis_table.py
│   │   └── 004_create_llm_explanations_table.py
│   ├── env.py
│   └── script.py.mako
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── users.py
│   │           ├── health_records.py
│   │           ├── ml_analysis.py
│   │           └── llm_explanation.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── health_record.py
│   │   ├── ml_analysis.py
│   │   └── llm_explanation.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── health_record.py
│   │   ├── ml_analysis.py
│   │   └── llm_explanation.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── health_record_service.py
│   │   ├── ml_analysis_service.py
│   │   ├── llm_service.py
│   │   └── llm_explanation_service.py
│   └── utils/
│       ├── __init__.py
│       └── pii_sanitizer.py
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_database.py
│   ├── test_health_records.py
│   ├── test_main.py
│   ├── test_ml_analysis.py
│   ├── test_llm_explanation.py
│   └── test_user_service.py
├── alembic.ini
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```
