"""Verify RLS org isolation with the production queue pool enabled.

The integration suite runs with NullPool (dev default), so pooled connection
reuse is not exercised there. Run this against the real Supabase DB with
pooling forced on:

    ENVIRONMENT=production uv run python scripts/verify_pooled_rls.py

It creates two orgs, inserts a job into org A, then performs many
transactions over pooled connections asserting:
  - org B never sees org A's rows (fail-closed)
  - org A always sees its own rows
  - rapid sequential sessions for alternating orgs never leak context

Cleans up both orgs (cascade) afterwards.
"""

import asyncio
import os
import uuid

from sqlalchemy import select

from merix.db import AsyncSessionLocal, scoped_session
from merix.models.job import JobDescription
from merix.models.organisation import Organisation
from merix.models.user import User

ITERATIONS = 30


async def main() -> None:
    assert os.environ.get("ENVIRONMENT") == "production", "set ENVIRONMENT=production to force pooling"
    org_a = org_b = None
    try:
        # Arrange: two orgs + a job that belongs only to org A.
        async with AsyncSessionLocal() as session:
            org_a = Organisation(name=f"PoolRLS A {uuid.uuid4().hex[:8]}")
            org_b = Organisation(name=f"PoolRLS B {uuid.uuid4().hex[:8]}")
            session.add_all([org_a, org_b])
            await session.flush()
            session.add(User(id=uuid.uuid4(), org_id=org_a.id, email=f"{uuid.uuid4().hex[:12]}@example.com"))
            session.add(User(id=uuid.uuid4(), org_id=org_b.id, email=f"{uuid.uuid4().hex[:12]}@example.com"))
            await session.commit()
            org_a_id, org_b_id = org_a.id, org_b.id

        async with scoped_session(org_a_id) as scoped:
            job = JobDescription(org_id=org_a.id, title="Pooled RLS probe", raw_text="probe")
            scoped.add(job)
            await scoped.commit()
            job_id = job.id

        print(f"org A={org_a_id} org B={org_b_id} job={job_id}")
        print(f"running {ITERATIONS} alternating-org transaction rounds...")

        # Act/Assert: alternate orgs across fresh sessions so the pool serves
        # connections that previously ran under the *other* org's context.
        for i in range(ITERATIONS):
            async with scoped_session(org_b_id) as scoped_b:
                seen_by_b = await scoped_b.scalar(select(JobDescription).where(JobDescription.id == job_id))
                if seen_by_b is not None:
                    raise SystemExit(f"FAIL round {i}: org B saw org A's job (RLS leak)")

            async with scoped_session(org_a_id) as scoped_a:
                seen_by_a = await scoped_a.scalar(select(JobDescription).where(JobDescription.id == job_id))
                if seen_by_a is None:
                    raise SystemExit(f"FAIL round {i}: org A cannot see its own job")

        print(f"PASS: {ITERATIONS} rounds x 2 sessions, no RLS leakage across pooled connections")
    finally:
        async with AsyncSessionLocal() as session:
            for org_id in (getattr(org_a, "id", None), getattr(org_b, "id", None)):
                if org_id is not None:
                    org = await session.get(Organisation, org_id)
                    if org is not None:
                        await session.delete(org)
            await session.commit()
        print("cleanup done")


if __name__ == "__main__":
    asyncio.run(main())
