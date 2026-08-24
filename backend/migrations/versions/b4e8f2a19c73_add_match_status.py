"""add match_results.status for recruiter disposition

Revision ID: b4e8f2a19c73
Revises: 13aafa45b687
Create Date: 2026-08-24

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b4e8f2a19c73'
down_revision: str | None = '13aafa45b687'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        'match_results',
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'pending'")),
    )


def downgrade() -> None:
    op.drop_column('match_results', 'status')
