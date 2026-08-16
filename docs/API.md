# Checkd API Specification

Base URL: `/api/v1`

## Standard Headers
- `Content-Type: application/json`
- `Authorization: Bearer <SUPABASE_JWT_TOKEN>` (for all protected endpoints)

---

## Endpoint Specification

### 1. User Profile

#### GET `/api/v1/users/me`
- **Auth**: Required (`Bearer <token>`)
- **Response 200**: `UserResponse`

#### PATCH `/api/v1/users/me`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**: `{"full_name": "Updated Name"}`
- **Response 200**: `UserResponse`

---

### 2. Health Records & Telemetry Data Layer

#### POST `/api/v1/health/records`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "record_type": "vitals",
    "recorded_at": "2026-08-16T12:00:00Z",
    "data": { "heart_rate": 72, "systolic": 120, "diastolic": 80 }
  }
  ```
- **Response 201 Created**: `HealthRecordResponse`

#### GET `/api/v1/health/records`
- **Auth**: Required (`Bearer <token>`)
- **Query Parameters**: `page` (default: 1), `page_size` (default: 20, max: 100)
- **Response 200 OK**: `HealthRecordListResponse`

#### GET `/api/v1/health/records/{record_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 200 OK**: `HealthRecordResponse`
- **Response 404 Not Found**: If record does not exist or belongs to another user.

#### DELETE `/api/v1/health/records/{record_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 204 No Content**: Successfully deleted.
- **Response 404 Not Found**: If record does not exist or belongs to another user.

---

### 3. ML Analysis Engine

#### POST `/api/v1/analysis/assess`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "health_record_id": "987e6543-e21b-12d3-a456-426614174000"
  }
  ```
- **Response 201 Created**: `MLAnalysisResponse`
- **Response 404 Not Found**: If `health_record_id` does not exist or belongs to another user.

#### GET `/api/v1/analysis/{analysis_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 200 OK**: `MLAnalysisResponse`
- **Response 404 Not Found**: If analysis record does not exist or belongs to another user.

---

### 4. LLM Explanation Layer

#### POST `/api/v1/explain/generate`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "analysis_id": "abc12345-e21b-12d3-a456-426614174000"
  }
  ```
- **Response 201 Created / 200 OK**:
  ```json
  {
    "id": "exp98765-e21b-12d3-a456-426614174000",
    "analysis_id": "abc12345-e21b-12d3-a456-426614174000",
    "status": "completed",
    "model": "gpt-4o-mini",
    "summary": "Your observed vitals show a heart rate of 72 bpm and blood pressure of 120/80 mmHg, which align with general reference ranges.",
    "details": [
      "Heart rate observation: 72 bpm within typical resting range.",
      "Blood pressure reading: 120/80 mmHg."
    ],
    "limitations": [
      "This explanation is for educational purposes only and does not constitute a medical diagnosis.",
      "Please consult a licensed healthcare professional for medical advice."
    ],
    "created_at": "2026-08-16T12:00:00Z",
    "updated_at": "2026-08-16T12:00:00Z"
  }
  ```
- **Response 404 Not Found**: If `analysis_id` does not exist or belongs to another user.
- **Response 502 Bad Gateway**: If external LLM provider service is unavailable.

#### GET `/api/v1/explain/{explanation_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 200 OK**: `ExplanationResponse`
- **Response 404 Not Found**: If explanation record does not exist or belongs to another user.
