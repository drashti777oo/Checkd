# Checkd API Specification

Base URL: `/api/v1`

## Standard Headers
- `Content-Type: application/json`
- `Authorization: Bearer <SUPABASE_JWT_TOKEN>` (for authenticated endpoints)

---

## Endpoint Index

### Auth Validation
- `GET /api/v1/auth/me`
  - **Auth**: Required
  - **Response**: `UserRead` (User profile & metadata)

### Health Data Records
- `GET /api/v1/health/records`
  - **Auth**: Required
  - **Response**: List of `HealthRecordResponse`
- `POST /api/v1/health/records`
  - **Auth**: Required
  - **Body**: `HealthRecordCreate` schema (vitals, metrics)
  - **Response**: Created `HealthRecordResponse`

### ML Risk Analysis
- `POST /api/v1/analysis/assess`
  - **Auth**: Required
  - **Body**: `MLAnalysisInput` (tabular signals / image feature vectors)
  - **Response**: `MLAnalysisResult` (risk score, predicted category, confidence)

### LLM Explanation
- `POST /api/v1/explain/generate`
  - **Auth**: Required
  - **Body**: `LLMExplanationRequest` (metrics, user question)
  - **Response**: `LLMExplanationResponse` (patient-friendly plain language summary, guidance)
