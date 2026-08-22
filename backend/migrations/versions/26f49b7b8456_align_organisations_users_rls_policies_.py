"""align organisations/users RLS policies with app role

Revision ID: 26f49b7b8456
Revises: 2072dab8609b
Create Date: 2026-08-22 10:19:01.794405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '26f49b7b8456'
down_revision: Union[str, None] = '2072dab8609b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- organisations / users RLS policies for the app role ---------------
    # The live DB had RLS enabled on these tables out-of-band (Supabase
    # dashboard), with no policy for the app role: fail-closed, which broke
    # signup (org/user inserts) entirely. Keep RLS ENABLED — it also blocks
    # anonymous/authenticated PostgREST access to these tables (no policy
    # exists for those roles) — and grant merix_app explicit full access.
    #
    # Why full access rather than org-scoped WITH CHECK: rows are created
    # during signup, before any app.current_org_id context exists for the
    # new org (chicken-and-egg), and login looks users up by email without
    # a tenant context. Org isolation is enforced in the API layer + RLS on
    # the tenant tables; anon/authenticated stay locked out via PostgREST.
    for table in ("organisations", "users"):
        op.execute(f"DROP POLICY IF EXISTS app_full_access ON {table}")
        op.execute(
            f"CREATE POLICY app_full_access ON {table} FOR ALL TO merix_app "
            "USING (true) WITH CHECK (true)"
        )


def downgrade() -> None:
    for table in ("organisations", "users"):
        op.execute(f"DROP POLICY IF EXISTS app_full_access ON {table}")
