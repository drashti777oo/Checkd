from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Checkd Health API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/checkd_db"
    
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: str = "placeholder_key"
    SUPABASE_SERVICE_ROLE_KEY: str = "placeholder_service_key"
    SUPABASE_JWT_SECRET: str = "placeholder_jwt_secret"

    OPENAI_API_KEY: str = "sk-placeholder"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
