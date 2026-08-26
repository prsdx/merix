"""add interest_signups table for landing-page leads

Revision ID: c41f9a7de208
Revises: d8e4b21c9a57
Create Date: 2026-08-26

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c41f9a7de208'
down_revision: str | None = 'd8e4b21c9a57'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'interest_signups',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('source', sa.String(length=50), nullable=False, server_default='landing_page'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    # Case-insensitive uniqueness so repeat submissions upsert cleanly.
    op.create_index(
        'ux_interest_signups_email',
        'interest_signups',
        [sa.text('lower(email)')],
        unique=True,
    )

    # --- Grants and RLS -----------------------------------------------------
    # Pre-auth public data with no tenant: the app role may INSERT only.
    # No SELECT grant exists, so leads are never readable through the API;
    # reads happen via the Supabase service role / dashboard.
    op.execute("GRANT INSERT ON interest_signups TO merix_app")
    op.execute("ALTER TABLE interest_signups ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE interest_signups FORCE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY insert_any ON interest_signups "
        "FOR INSERT TO merix_app WITH CHECK (true)"
    )


def downgrade() -> None:
    # --- Revert grants and RLS first (table still exists) -------------------
    op.execute("DROP POLICY IF EXISTS insert_any ON interest_signups")
    op.execute("ALTER TABLE interest_signups NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE interest_signups DISABLE ROW LEVEL SECURITY")
    op.execute("REVOKE INSERT ON interest_signups FROM merix_app")

    op.drop_index('ux_interest_signups_email', table_name='interest_signups')
    op.drop_table('interest_signups')
