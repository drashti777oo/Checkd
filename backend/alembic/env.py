from logging.config import fileConfig
import os
import sys

from sqlalchemy import engine_from_config, pool, text

from alembic import context

# Append current backend directory to sys.path so app modules can be imported
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.models.base import Base

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name:
    fileConfig(config.config_file_name)

# Set target metadata for autogenerate support
target_metadata = Base.metadata


def get_url():
    url = settings.DATABASE_URL
    if not url:
        raise ValueError(
            "DATABASE_URL is not set. Please set DATABASE_URL in your environment or .env file."
        )
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_num_dim=255,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Pre-ensure alembic_version exists with VARCHAR(255) for PostgreSQL compatibility
        connection.execute(
            text(
                "CREATE TABLE IF NOT EXISTS alembic_version ("
                "version_num VARCHAR(255) NOT NULL, "
                "CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num))"
            )
        )
        connection.execute(
            text("ALTER TABLE alembic_version ALTER COLUMN version_num TYPE VARCHAR(255)")
        )
        connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            version_num_dim=255,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
