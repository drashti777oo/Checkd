import uuid
from datetime import datetime, timezone, date
from typing import Optional, List
from sqlalchemy import String, Float, Boolean, DateTime, Date, ForeignKey, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class UserHealthProfile(Base):
    """
    UserHealthProfile database model.
    Stores user-provided health background, metrics, goals, conditions, and personalization preferences.
    """
    __tablename__ = "health_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    date_of_birth: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )
    gender: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    height_cm: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    weight_kg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    health_conditions: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
    )
    health_goals: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
    )
    medications: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
    )
    supplements: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
    )
    cycle_tracking_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    onboarding_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
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
    user = relationship("User", back_populates="health_profile")
