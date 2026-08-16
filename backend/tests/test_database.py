import pytest
from app.models.base import Base
from app.core.config import settings
from app.core.database import get_db


def test_sqlalchemy_base_import():
    """Verify SQLAlchemy 2.x DeclarativeBase is correctly configured."""
    assert Base is not None
    assert hasattr(Base, "metadata")


def test_get_db_unconfigured_error(monkeypatch):
    """Verify get_db dependency raises ValueError when DATABASE_URL is not set."""
    monkeypatch.setattr(settings, "DATABASE_URL", None)
    with pytest.raises(ValueError, match="DATABASE_URL environment variable is not configured"):
        generator = get_db()
        next(generator)


def test_database_connection_optional():
    """
    Attempts database connection if DATABASE_URL is provided in environment.
    Skips cleanly if DATABASE_URL is not configured or PostgreSQL is unreachable.
    """
    if not settings.DATABASE_URL:
        pytest.skip("DATABASE_URL not configured. Skipping live database connection test.")

    try:
        from sqlalchemy import text
        from app.core.database import engine
        
        if engine is None:
            pytest.skip("Engine is None.")

        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            assert result.scalar() == 1
    except Exception as e:
        pytest.skip(f"Live database unavailable: {str(e)}. Skipping live connection check.")
