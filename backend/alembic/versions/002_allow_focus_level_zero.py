"""Allow focus_level 0

Revision ID: 002
Revises: 001
Create Date: 2026-04-11

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("ck_sessions_focus_range", "sessions")
    op.create_check_constraint(
        "ck_sessions_focus_range",
        "sessions",
        "focus_level IS NULL OR (focus_level >= 0 AND focus_level <= 5)",
    )


def downgrade() -> None:
    op.drop_constraint("ck_sessions_focus_range", "sessions")
    op.create_check_constraint(
        "ck_sessions_focus_range",
        "sessions",
        "focus_level IS NULL OR (focus_level >= 1 AND focus_level <= 5)",
    )
