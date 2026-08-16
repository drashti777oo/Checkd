# Checkd Backend API

FastAPI foundation, database layer, User profile model, Supabase JWT Authentication, and Health Records Data Layer for the Checkd Health Track application.

## Overview

This is the backend REST API for Checkd, providing scalable API routing, environment configuration, database connection management, User database models, user-scoped Health Records persistence, Supabase JWT verification, and Alembic migrations.

## Data Layer & User Isolation Architecture

- **User-Scoped Queries**: All health record CRUD operations strictly enforce `HealthRecord.user_id == current_user.id` directly in database queries to eliminate IDOR authorization vulnerabilities.
- **Privacy Logging**: Telemetry payloads are excluded from operational log files.
- **Flexible JSON Payload**: `HealthRecord.data` stores arbitrary structured telemetry observations (vitals, symptoms, posture, etc.).

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

Configure Supabase and Database variables in `.env`:

```text
DATABASE_URL=postgresql+psycopg://user:password@host:port/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

### 4. Database Migrations (Alembic)

```bash
# Check current migration version
alembic current

# Apply migrations up to head (002_create_health_records_table)
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

### 5. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Access Endpoints

- **Root Endpoint**: `GET http://localhost:8000/`
- **Health Check Endpoint**: `GET http://localhost:8000/health`
- **Protected User Profile**: `GET http://localhost:8000/api/v1/users/me`
- **Protected Health Records**: `POST/GET/DELETE http://localhost:8000/api/v1/health/records`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

### 7. Run Unit Tests

```bash
pytest
```

## Directory Structure

```text
backend/
├── alembic/
│   ├── versions/
│   │   ├── 001_create_users_table.py
│   │   └── 002_create_health_records_table.py
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
│   │           └── health_records.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   └── health_record.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── health_record.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   └── health_record_service.py
│   └── utils/
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_database.py
│   ├── test_health_records.py
│   ├── test_main.py
│   └── test_user_service.py
├── alembic.ini
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```
