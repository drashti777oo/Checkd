# Health Data Security & Privacy Rules

## Core Principles

1. **Zero Secret Hardcoding**: Secrets, API keys, database credentials, and auth tokens MUST NEVER be committed to version control. Use `.env` locally and platform environment variables in production.
2. **Strict PII Separation**: Personally Identifiable Information (Names, SSNs, Email, DOB) MUST be kept strictly isolated from raw health telemetry and machine learning datasets.
3. **Third-Party Sanitization**: All data dispatched to external LLM providers (e.g. OpenAI) MUST pass through `backend/app/utils/pii_sanitizer.py` to scrub identifiers before dispatch.
4. **Row Level Security (RLS)**: PostgreSQL database tables store `user_id` as foreign key referencing Supabase Auth users, enabling Row Level Security policies.
5. **No Synthetic/Real Patient Data Commits**: Never check in real patient data, medical images, or CSV logs. Data files in `ml/data/` are gitignored.

## Verification Checklist Before Demo

- [ ] All `.env` files are in `.gitignore`.
- [ ] No API keys in `frontend/src/` or `backend/app/`.
- [ ] Protected endpoints verify authorization tokens via `deps.get_current_user`.
- [ ] PII sanitization tested on LLM request payloads.
