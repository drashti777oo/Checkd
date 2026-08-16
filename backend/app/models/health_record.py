from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, JSON, ForeignKey
from app.core.database import Base
from app.models.base import TimestampMixin


class HealthRecord(Base, TimestampMixin):
    __tablename__ = "health_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True, nullable=False)
    record_type: Mapped[str] = mapped_column(String, nullable=False)
    metrics: Mapped[dict] = mapped_column(JSON, nullable=False)
    notes: Mapped[str] = mapped_column(String, nullable=True)
