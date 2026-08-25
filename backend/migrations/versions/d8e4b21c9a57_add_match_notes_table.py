"""add match_notes table for recruiter comments on matches

Revision ID: d8e4b21c9a57
Revises: b4e8f2a19c73
Create Date: 2026-08-25

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'd8e4b21c9a57'
down_revision: str | None = 'b4e8f2a19c73'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'match_notes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('match_id', sa.UUID(), nullable=False),
        sa.Column('author_id', sa.UUID(), nullable=True),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['match_id'], ['match_results.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['org_id'], ['organisations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_match_notes_org_id'), 'match_notes', ['org_id'], unique=False)
    op.create_index(op.f('ix_match_notes_match_id'), 'match_notes', ['match_id'], unique=False)

    # --- Grants and RLS ----------------------------------------------------
    # Tenant-owned like the other data tables; the app role needs CRUD and
    # RLS must enforce org isolation.
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON match_notes TO merix_app")
    org_ctx = "NULLIF(current_setting('app.current_org_id', true), '')::uuid"
    op.execute("ALTER TABLE match_notes ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE match_notes FORCE ROW LEVEL SECURITY")
    op.execute(
        f"CREATE POLICY org_isolation ON match_notes "
        f"USING (org_id = {org_ctx}) "
        f"WITH CHECK (org_id = {org_ctx})"
    )


def downgrade() -> None:
    # --- Revert grants and RLS first (table still exists) -------------------
    op.execute("DROP POLICY IF EXISTS org_isolation ON match_notes")
    op.execute("ALTER TABLE match_notes NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE match_notes DISABLE ROW LEVEL SECURITY")
    op.execute("REVOKE SELECT, INSERT, UPDATE, DELETE ON match_notes FROM merix_app")

    op.drop_index(op.f('ix_match_notes_match_id'), table_name='match_notes')
    op.drop_index(op.f('ix_match_notes_org_id'), table_name='match_notes')
    op.drop_table('match_notes')