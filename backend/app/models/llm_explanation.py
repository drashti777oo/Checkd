import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy import String, Text, DateTime, JSON, ForeignKey, Index, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class LLMExplanation(Base):
    """
    LLMExplanation database model.
    Stores user-scoped, educational plain-language explanations of MLAnalysis results.
    """
    __tablename__ = "llm_explanations"

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
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("ml_analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="completed",
        index=True,
    )
    model: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="gpt-4o-mini",
    )
    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    details: Mapped[List[Any]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    limitations: Mapped[List[Any]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
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
    user = relationship("User", back_populates="llm_explanations")
    analysis = relationship("MLAnalysis", back_populates="llm_explanations")

    __table_args__ = (
        Index("ix_llm_explanations_user_created", "user_id", "created_at"),
        Index("ix_llm_explanations_user_analysis", "user_id", "analysis_id"),
    )
