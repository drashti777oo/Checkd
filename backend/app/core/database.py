from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

engine = None
SessionLocal = None

if settings.DATABASE_URL:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
    )
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a database session.
    Fails clearly if DATABASE_URL is not configured.
    """
    if not settings.DATABASE_URL or SessionLocal is None:
        raise ValueError(
            "DATABASE_URL environment variable is not configured. "
            "Please set DATABASE_URL in your environment or .env file."
        )
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
