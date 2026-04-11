"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("nickname", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # study_days
    op.create_table(
        "study_days",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("is_finished", sa.Boolean, default=False, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("user_id", "date", name="uq_study_days_user_date"),
    )
    op.create_index("ix_study_days_user_id", "study_days", ["user_id"])
    op.create_index("ix_study_days_date", "study_days", ["date"])

    # sessions
    op.create_table(
        "sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "study_day_id",
            UUID(as_uuid=True),
            sa.ForeignKey("study_days.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("order_num", sa.Integer, nullable=False),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("duration_minutes", sa.Integer, nullable=False),
        sa.Column("focus_level", sa.Integer, nullable=True),
        sa.Column("distraction", sa.String(100), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="running"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("study_day_id", "order_num", name="uq_sessions_day_order"),
        sa.CheckConstraint("type IN ('study', 'rest')", name="ck_sessions_type"),
        sa.CheckConstraint("duration_minutes > 0", name="ck_sessions_duration_positive"),
        sa.CheckConstraint(
            "focus_level IS NULL OR (focus_level >= 1 AND focus_level <= 5)",
            name="ck_sessions_focus_range",
        ),
        sa.CheckConstraint(
            "status IN ('running', 'paused', 'completed')",
            name="ck_sessions_status",
        ),
    )
    op.create_index("ix_sessions_study_day_id", "sessions", ["study_day_id"])

    # ai_results
    op.create_table(
        "ai_results",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "study_day_id",
            UUID(as_uuid=True),
            sa.ForeignKey("study_days.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("summary", sa.Text, nullable=True),
        sa.Column("feedback", sa.Text, nullable=True),
        sa.Column("model_used", sa.String(100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_ai_results_study_day_id", "ai_results", ["study_day_id"], unique=True)


def downgrade() -> None:
    op.drop_table("ai_results")
    op.drop_table("sessions")
    op.drop_table("study_days")
    op.drop_table("users")
