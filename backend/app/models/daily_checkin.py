import uuid
from datetime import datetime, timezone, date
from typing import Optional, List
from sqlalchemy import String, Integer, Float, DateTime, Date, ForeignKey, Uuid, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class DailyCheckIn(Base):
    """
    DailyCheckIn database model.
    Stores daily user-reported subjective metrics (mood, energy, stress, sleep, water, symptoms).
    """
    __tablename__ = "daily_checkins"

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
    checkin_date: Mapped[date] = mapped_column(
        Date,
        default=date.today,
        nullable=False,
        index=True,
    )
    mood: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
    )
    energy: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
    )
    stress: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
    )
    sleep_hours: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    sleep_quality: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    exercise_minutes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    water_intake_ml: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
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

    __table_args__ = (
        UniqueConstraint("user_id", "checkin_date", name="uq_user_checkin_date"),
    )

    # Relationships
    user = relationship("User", back_populates="daily_checkins")
