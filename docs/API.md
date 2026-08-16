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
- **Response 201 Created**: `HealthRecordResponse`

#### GET `/api/v1/health/records`
- **Auth**: Required (`Bearer <token>`)
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
- **Response 201 Created**: `MLAnalysisResponse`

#### GET `/api/v1/analysis/{analysis_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 200 OK**: `MLAnalysisResponse`

---

### 4. LLM Explanation Layer

#### POST `/api/v1/explain/generate`
- **Auth**: Required (`Bearer <token>`)
- **Response 201 Created / 200 OK**: `ExplanationResponse`

#### GET `/api/v1/explain/{explanation_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 200 OK**: `ExplanationResponse`

---

### 5. Personalized Actionable Recommendations Engine

#### POST `/api/v1/recommendations/generate`
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
    "items": [
      {
        "id": "rec11111-e21b-12d3-a456-426614174000",
        "analysis_id": "abc12345-e21b-12d3-a456-426614174000",
        "category": "activity",
        "priority": "low",
        "title": "Consider regular movement breaks",
        "description": "Incorporating periodic physical activity during long stationary work sessions supports circulatory and physical posture wellness.",
        "action": "Consider taking a brief 5-minute walking or stretching break every hour.",
        "rationale": "Based on general wellness principles for reducing prolonged sedentary periods.",
        "status": "active",
        "created_at": "2026-08-16T12:00:00Z",
        "updated_at": "2026-08-16T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 1,
    "total_pages": 1,
    "generation_status": "completed"
  }
  ```

#### GET `/api/v1/recommendations`
- **Auth**: Required (`Bearer <token>`)
- **Query Parameters**: `status` (optional: `active`, `dismissed`, `completed`), `page` (default: 1), `page_size` (default: 20, max: 100)
- **Response 200 OK**: `RecommendationListResponse`

#### GET `/api/v1/recommendations/{recommendation_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 200 OK**: `RecommendationResponse`

#### PATCH `/api/v1/recommendations/{recommendation_id}`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**: `{"status": "dismissed"}`
- **Response 200 OK**: `RecommendationResponse`
