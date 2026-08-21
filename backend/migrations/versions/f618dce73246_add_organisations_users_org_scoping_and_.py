"""add organisations users org scoping and row level security

Revision ID: f618dce73246
Revises: f202db2b9003
Create Date: 2026-08-21 18:41:32.464944

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f618dce73246'
down_revision: Union[str, None] = 'f202db2b9003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Tables whose rows are owned by an organisation and must be isolated by RLS.
TENANT_TABLES = ("job_descriptions", "resumes", "match_results")


def upgrade() -> None:
    # Task 1 data is disposable test data with NULL org_id (confirmed with the
    # team); it cannot satisfy the new NOT NULL org scoping, so remove it.
    op.execute("DELETE FROM match_results")
    op.execute("DELETE FROM resumes")
    op.execute("DELETE FROM job_descriptions")

    op.create_table('organisations',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('org_id', sa.UUID(), nullable=False),
    sa.Column('email', sa.String(length=320), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['org_id'], ['organisations.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_org_id'), 'users', ['org_id'], unique=False)
    op.alter_column('job_descriptions', 'org_id',
               existing_type=sa.UUID(),
               nullable=False)
    op.create_index(op.f('ix_job_descriptions_org_id'), 'job_descriptions', ['org_id'], unique=False)
    op.create_foreign_key(None, 'job_descriptions', 'organisations', ['org_id'], ['id'], ondelete='CASCADE')
    op.add_column('match_results', sa.Column('org_id', sa.UUID(), nullable=False))
    op.create_index(op.f('ix_match_results_org_id'), 'match_results', ['org_id'], unique=False)
    op.create_foreign_key(None, 'match_results', 'organisations', ['org_id'], ['id'], ondelete='CASCADE')
    op.add_column('resumes', sa.Column('org_id', sa.UUID(), nullable=False))
    op.create_index(op.f('ix_resumes_org_id'), 'resumes', ['org_id'], unique=False)
    op.create_foreign_key(None, 'resumes', 'organisations', ['org_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###

    # --- Dedicated application role -------------------------------------
    # The app connects as the Supabase `postgres` superuser, which BYPASSES
    # row level security entirely. To make RLS actually bind, the app engine
    # issues `SET ROLE merix_app` on every new connection (see db.py), dropping
    # superuser privileges for the session. NOLOGIN: only ever entered via
    # SET ROLE, so there is no password to manage or leak.
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'merix_app') THEN
                CREATE ROLE merix_app NOLOGIN;
            END IF;
        END
        $$;
        """
    )
    op.execute("GRANT USAGE ON SCHEMA public TO merix_app")
    op.execute(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON "
        "organisations, users, job_descriptions, resumes, match_results "
        "TO merix_app"
    )
    # Future tables created by the migrator (postgres) are usable by the app.
    op.execute(
        "ALTER DEFAULT PRIVILEGES IN SCHEMA public "
        "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO merix_app"
    )

    # --- Row level security on tenant-owned tables -----------------------
    # Fail closed: when app.current_org_id is unset, current_setting(..., true)
    # returns NULL and no rows are visible or writable.
    for table in TENANT_TABLES:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        op.execute(
            f"CREATE POLICY org_isolation ON {table} "
            "USING (org_id = current_setting('app.current_org_id', true)::uuid) "
            "WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid)"
        )


def downgrade() -> None:
    for table in TENANT_TABLES:
        op.execute(f"DROP POLICY IF EXISTS org_isolation ON {table}")
        op.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")
    op.execute(
        "ALTER DEFAULT PRIVILEGES IN SCHEMA public "
        "REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM merix_app"
    )
    op.execute(
        "REVOKE SELECT, INSERT, UPDATE, DELETE ON "
        "organisations, users, job_descriptions, resumes, match_results "
        "FROM merix_app"
    )
    op.execute("REVOKE USAGE ON SCHEMA public FROM merix_app")
    op.execute("DROP ROLE IF EXISTS merix_app")

    op.drop_constraint(None, 'resumes', type_='foreignkey')
    op.drop_index(op.f('ix_resumes_org_id'), table_name='resumes')
    op.drop_column('resumes', 'org_id')
    op.drop_constraint(None, 'match_results', type_='foreignkey')
    op.drop_index(op.f('ix_match_results_org_id'), table_name='match_results')
    op.drop_column('match_results', 'org_id')
    op.drop_constraint(None, 'job_descriptions', type_='foreignkey')
    op.drop_index(op.f('ix_job_descriptions_org_id'), table_name='job_descriptions')
    op.alter_column('job_descriptions', 'org_id',
               existing_type=sa.UUID(),
               nullable=True)
    op.drop_index(op.f('ix_users_org_id'), table_name='users')
    op.drop_table('users')
    op.drop_table('organisations')
    # ### end Alembic commands ###
