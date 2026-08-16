import uuid
from datetime import datetime, timezone, date
from typing import Optional, List
from sqlalchemy import String, DateTime, Date, ForeignKey, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class CycleLog(Base):
    """
    CycleLog database model.
    Stores user-scoped period and menstrual cycle tracking logs for female user profiles.
    """
    __tablename__ = "cycle_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )
    end_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )
    flow_intensity: Mapped[str] = mapped_column(
        String(50),
        default="medium",
        nullable=False,
    )
    symptoms: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
    )
    notes: Mapped[Optional[str]] = mapped_column(
        String(1000),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="cycle_logs")
