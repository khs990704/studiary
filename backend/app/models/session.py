import datetime
import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        UniqueConstraint("study_day_id", "order_num", name="uq_sessions_day_order"),
        CheckConstraint("type IN ('study', 'rest')", name="ck_sessions_type"),
        CheckConstraint("duration_minutes > 0", name="ck_sessions_duration_positive"),
        CheckConstraint(
            "focus_level IS NULL OR (focus_level >= 0 AND focus_level <= 5)",
            name="ck_sessions_focus_range",
        ),
        CheckConstraint(
            "status IN ('running', 'paused', 'completed')",
            name="ck_sessions_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    study_day_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("study_days.id", ondelete="CASCADE"),
        nullable=False,
    )
    order_num: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    focus_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    distraction: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="running")
    created_at: Mapped[datetime.datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )

    study_day: Mapped["StudyDay"] = relationship(back_populates="sessions")  # noqa: F821
