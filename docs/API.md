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
- **Response 200**:
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "is_active": true,
    "created_at": "2026-08-16T12:00:00Z",
    "updated_at": "2026-08-16T12:00:00Z"
  }
  ```

#### PATCH `/api/v1/users/me`
- **Auth**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "full_name": "Updated Name"
  }
  ```
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
    "data": {
      "heart_rate": 72,
      "systolic": 120,
      "diastolic": 80
    }
  }
  ```
- **Response 201 Created**:
  ```json
  {
    "id": "987e6543-e21b-12d3-a456-426614174000",
    "record_type": "vitals",
    "recorded_at": "2026-08-16T12:00:00Z",
    "data": {
      "heart_rate": 72,
      "systolic": 120,
      "diastolic": 80
    },
    "created_at": "2026-08-16T12:00:00Z",
    "updated_at": "2026-08-16T12:00:00Z"
  }
  ```

#### GET `/api/v1/health/records`
- **Auth**: Required (`Bearer <token>`)
- **Query Parameters**:
  - `page` (default: 1)
  - `page_size` (default: 20, max: 100)
- **Response 200 OK**:
  ```json
  {
    "items": [
      {
        "id": "987e6543-e21b-12d3-a456-426614174000",
        "record_type": "vitals",
        "recorded_at": "2026-08-16T12:00:00Z",
        "data": { "heart_rate": 72 },
        "created_at": "2026-08-16T12:00:00Z",
        "updated_at": "2026-08-16T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20,
    "total_pages": 1
  }
  ```

#### GET `/api/v1/health/records/{record_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 200 OK**: `HealthRecordResponse`
- **Response 404 Not Found**: If record does not exist or belongs to another user (user isolation enforced).

#### DELETE `/api/v1/health/records/{record_id}`
- **Auth**: Required (`Bearer <token>`)
- **Response 204 No Content**: Successfully deleted.
- **Response 404 Not Found**: If record does not exist or belongs to another user.
