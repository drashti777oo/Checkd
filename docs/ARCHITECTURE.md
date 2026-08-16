# Checkd Architecture Specification

## Monorepo Layout

```
Checkd/
├── frontend/    React + TypeScript SPA (Vite, Tailwind, Supabase Auth)
├── backend/     FastAPI REST API (SQLAlchemy ORM, Pydantic, Supabase JWT Auth)
├── ml/          Standalone Python AI/ML Pipeline (Signal Processing, Vision, Predictor)
└── docs/        Documentation & Security Guidelines
```

## Layer Responsibilities

### 1. Frontend Layer (`frontend/`)
- Pure UI components (`src/components/ui/` primitive, `src/components/health/` domain).
- State flow: `UI Component` -> `Custom Hook` -> `Service (HTTP Client)` -> `Backend API`.
- No inline fetch or axios calls in UI components.
- Client-side PII masking using `src/utils/privacy.ts`.

### 2. API Gateway & Business Logic (`backend/`)
- Endpoint controllers (`app/api/v1/endpoints/`) are lightweight and delegate to service modules (`app/services/`).
- Authentication dependency (`app/api/deps.py`) verifies Supabase JWT bearer tokens on protected endpoints.
- Pydantic models (`app/schemas/`) enforce strict payload structure and type safety.
- SQLAlchemy ORM (`app/models/`) interfaces cleanly with PostgreSQL.

### 3. AI / ML & Explanation Engine (`ml/` & `backend/app/services/`)
- ML feature extraction and inference wrappers live in `ml/inference/predictor.py`.
- LLM interaction is isolated in `backend/app/services/llm_service.py`.
- `backend/app/utils/pii_sanitizer.py` strips all patient names, dates, or identifiers before sending text prompts to OpenAI.

## Security & Data Privacy Boundaries

```
[ Frontend Client ] ──(HTTPS + JWT Bearer)──> [ FastAPI Security Guard ]
                                                      │
                                                      ├── Auth Verified?
                                                      │     │
                                                      │     ├── YES ──> Query User Records (DB RLS)
                                                      │     └── NO  ──> HTTP 401 Unauthorized
                                                      │
                                           [ Sanitization Step ]
                                                      │ (Strip PII)
                                                      ▼
                                           [ LLM / External AI ]
```
