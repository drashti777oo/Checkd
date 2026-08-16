# Production Deployment Guide — Checkd Backend API

This document provides step-by-step instructions for deploying and verifying the Checkd FastAPI backend service in staging and production environments.

---

## 1. Prerequisites & Environment Setup

Ensure the target host has Python 3.11+ or Docker installed.

### Production Environment Variables Checklist

Create a `.env` file or supply environment variables to your container runner:

```text
# General Application Settings
ENVIRONMENT=production
DEBUG=False
FRONTEND_URL=https://your-production-app.vercel.app

# Database Connection (Supabase PostgreSQL / Cloud Run / RDS)
DATABASE_URL=postgresql+psycopg://postgres:your_secure_password@db_host:5432/checkd_db

# Supabase Auth Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_key
SUPABASE_JWT_ISSUER=https://your-project.supabase.co/auth/v1
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/.well-known/jwks.json

# Optional Model & Provider Configurations
ML_MODEL_PATH=ml/models/classifier.pkl
ML_MODEL_VERSION=development-placeholder
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_SECONDS=15
```

---

## 2. Database Migrations (Alembic)

Run database migrations to apply the complete migration chain (`001` -> `005`):

```bash
# Check current migration revision
alembic current

# Run migrations up to head
alembic upgrade head

# Confirm head revision (005_create_recommendations_table)
alembic heads
```

---

## 3. Docker Deployment

Build and run using Docker:

```bash
# Build production Docker image
docker build -t checkd-backend:latest -f backend/Dockerfile .

# Run container
docker run -d \
  -p 8000:8000 \
  --env-file backend/.env \
  --name checkd_api \
  checkd-backend:latest
```

Alternatively, use `docker-compose`:

```bash
cd backend
docker-compose up -d --build
```

---

## 4. Verification & Smoke Testing

1. **Root Health Check**:
   ```bash
   curl -i http://localhost:8000/health
   ```
   *Expected Response*: `200 OK` `{"status": "healthy"}`

2. **OpenAPI Schema Contract**:
   ```bash
   curl -i http://localhost:8000/openapi.json
   ```
   *Expected Response*: `200 OK` (Valid OpenAPI 3.x JSON)

3. **Interactive Swagger Documentation**:
   Navigate to `http://localhost:8000/docs`.

4. **Authentication Enforcement**:
   ```bash
   curl -i http://localhost:8000/api/v1/users/me
   ```
   *Expected Response*: `401 Unauthorized` `{"detail": "Missing Authorization header"}`
