import datetime
import uuid

from sqlalchemy import Boolean, Date, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StudyDay(Base):
    __tablename__ = "study_days"
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_study_days_user_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    is_finished: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="study_days")  # noqa: F821
    sessions: Mapped[list["Session"]] = relationship(  # noqa: F821
        back_populates="study_day",
        cascade="all, delete-orphan",
        order_by="Session.order_num",
    )
    ai_result: Mapped["AIResult | None"] = relationship(  # noqa: F821
        back_populates="study_day",
        uselist=False,
        cascade="all, delete-orphan",
    )
