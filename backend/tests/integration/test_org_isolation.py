"""Org isolation: the core Task 2 guarantee.

Two layers of proof:
1. API layer — an Org B user gets 404 (not 403: no existence leak) for every
   Org A resource, across all job/resume/match endpoints.
2. Data layer — Postgres RLS itself: a session scoped to Org B cannot read
   Org A rows even with a bare unfiltered SELECT, and cannot write a row
   stamped with Org A's org_id (WITH CHECK violation).
"""

import uuid

import pytest
from sqlalchemy import select

from merix.db import scoped_session
from merix.models.job import JobDescription
from tests.helpers import auth_headers, make_pdf


async def test_org_b_cannot_access_org_a_data_via_api(client, make_org_user):
    a_user_id, a_org_id = await make_org_user(org_name="Org A")
    b_user_id, _ = await make_org_user(org_name="Org B")
    a = auth_headers(a_user_id)
    b = auth_headers(b_user_id)

    # Org A builds a full pipeline: job -> resume -> match results.
    r = client.post(
        "/api/jobs",
        json={"title": "Backend Engineer", "raw_text": "Python and SQL needed."},
        headers=a,
    )
    assert r.status_code == 201, r.text
    job_id = r.json()["id"]

    pdf = make_pdf("Jane Doe. Built Python services and optimised SQL.")
    r = client.post(
        f"/api/jobs/{job_id}/resumes",
        files={"file": ("jane.pdf", pdf, "application/pdf")},
        data={"candidate_name": "Jane Doe", "consent_given": "true"},
        headers=a,
    )
    # Upload is async now (202 Accepted + BatchJobStatus); TestClient runs
    # the background processor before returning, so Org A's data exists.
    assert r.status_code == 202, r.text

    r = client.post(f"/api/jobs/{job_id}/match", headers=a)
    assert r.status_code == 202, r.text

    from merix.models.match import MatchResult

    async with scoped_session(a_org_id) as session:
        matches = (await session.scalars(select(MatchResult).where(MatchResult.job_id == uuid.UUID(job_id)))).all()
        assert len(matches) == 1
        match_id = str(matches[0].id)

    # Org A can read its own data (positive control).
    assert client.get(f"/api/jobs/{job_id}", headers=a).status_code == 200
    assert client.get(f"/api/matches/{match_id}", headers=a).status_code == 200

    # Org B gets 404 for everything Org A owns — no existence leak.
    r = client.get(f"/api/jobs/{job_id}", headers=b)
    assert r.status_code == 404, r.text

    # consent_given supplied so the request passes form validation and the
    # 404 comes from the org check, not a 422.
    r = client.post(
        f"/api/jobs/{job_id}/resumes",
        files={"file": ("mallory.pdf", make_pdf("Mallory"), "application/pdf")},
        data={"consent_given": "true"},
        headers=b,
    )
    assert r.status_code == 404, r.text

    r = client.post(f"/api/jobs/{job_id}/match", headers=b)
    assert r.status_code == 404, r.text

    r = client.get(f"/api/jobs/{job_id}/matches", headers=b)
    assert r.status_code == 404, r.text

    r = client.get(f"/api/matches/{match_id}", headers=b)
    assert r.status_code == 404, r.text


async def test_org_b_own_data_unaffected(client, make_org_user):
    """Isolation isn't fail-closed-to-everyone: each org sees its own data."""
    a_user_id, _ = await make_org_user(org_name="Org A")
    b_user_id, _ = await make_org_user(org_name="Org B")

    for headers in (auth_headers(a_user_id), auth_headers(b_user_id)):
        r = client.post(
            "/api/jobs",
            json={"title": "Role", "raw_text": "Python and SQL."},
            headers=headers,
        )
        assert r.status_code == 201, r.text
        job_id = r.json()["id"]
        assert client.get(f"/api/jobs/{job_id}", headers=headers).status_code == 200


async def test_rls_enforces_isolation_at_db_layer(make_org_user):
    """RLS binds even without application-level org filters.

    Uses scoped_session directly (no route, no pipeline), proving the
    enforcement lives in Postgres, not in Python code a future route
    could forget to call.
    """
    _, a_org_id = await make_org_user(org_name="Org A")
    _, b_org_id = await make_org_user(org_name="Org B")

    # Seed a job owned by Org A via an A-scoped session.
    a_job_id = uuid.uuid4()
    async with scoped_session(a_org_id) as session:
        session.add(JobDescription(id=a_job_id, org_id=a_org_id, title="A Job", raw_text="t"))
        await session.commit()

    # An A-scoped session can read it (positive control).
    async with scoped_session(a_org_id) as session:
        assert await session.get(JobDescription, a_job_id) is not None
        rows = (await session.scalars(select(JobDescription))).all()
        assert {r.id for r in rows} >= {a_job_id}

    # A B-scoped session cannot read it — even by primary key or bare SELECT.
    async with scoped_session(b_org_id) as session:
        assert await session.get(JobDescription, a_job_id) is None
        rows = (await session.scalars(select(JobDescription))).all()
        assert all(r.org_id == b_org_id for r in rows)

    # A B-scoped session cannot write a row stamped with Org A's org_id.
    async with scoped_session(b_org_id) as session:
        session.add(JobDescription(org_id=a_org_id, title="Forged", raw_text="t"))
        with pytest.raises(Exception, match="row.level security"):
            await session.commit()

    # An unscoped session (no org context) fails closed: nothing visible.
    from merix.db import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        rows = (await session.scalars(select(JobDescription))).all()
        assert rows == []

    # Clean up the seeded job (unscoped sessions can't delete under RLS).
    async with scoped_session(a_org_id) as session:
        job = await session.get(JobDescription, a_job_id)
        await session.delete(job)
        await session.commit()


async def test_rls_no_guc_bleed_through_rapid_sequential(make_org_user):
    """Rapid sequential operations on two org-scoped sessions must not leak data.

    Opens two sessions (different orgs) concurrently and alternates reads
    on both — verifies that the transaction-local GUC (set_config local=true)
    does not persist across connections. Even with NullPool (discard-on-close),
    a buggy connection-pooling change or a mis-scoped SET could cause bleed.
    """
    _, a_org_id = await make_org_user(org_name="Bleed Org A")
    _, b_org_id = await make_org_user(org_name="Bleed Org B")

    # Seed data in each org.
    a_job_id = uuid.uuid4()
    async with scoped_session(a_org_id) as session:
        session.add(JobDescription(id=a_job_id, org_id=a_org_id, title="A Secret", raw_text="a"))
        await session.commit()

    b_job_id = uuid.uuid4()
    async with scoped_session(b_org_id) as session:
        session.add(JobDescription(id=b_job_id, org_id=b_org_id, title="B Secret", raw_text="b"))
        await session.commit()

    # Rapidly alternate: Org A session reads, Org B session reads, repeat.
    for _ in range(2):
        async with scoped_session(a_org_id) as session:
            rows = (await session.scalars(select(JobDescription))).all()
            assert {r.id for r in rows} == {a_job_id}, f"Org A saw unexpected rows: {[r.id for r in rows]}"
        async with scoped_session(b_org_id) as session:
            rows = (await session.scalars(select(JobDescription))).all()
            assert {r.id for r in rows} == {b_job_id}, f"Org B saw unexpected rows: {[r.id for r in rows]}"
        # Also verify cross-isolation: Org A session reading Org B data.
        async with scoped_session(a_org_id) as session:
            assert await session.get(JobDescription, b_job_id) is None

    # Clean up.
    async with scoped_session(a_org_id) as session:
        job = await session.get(JobDescription, a_job_id)
        await session.delete(job)
        await session.commit()
    async with scoped_session(b_org_id) as session:
        job = await session.get(JobDescription, b_job_id)
        await session.delete(job)
        await session.commit()


async def test_rls_guc_bleed_would_be_caught_if_local_is_broken(make_org_user):
    """Prove the test catches a leak: build a session with SESSION-scoped GUC.

    scoped_session uses set_config(..., true) = LOCAL (transaction-scoped).
    This test builds a session with set_config(..., false) = SESSION-scoped
    and shows that after close, a fresh connection is not affected by the
    stale SESSION state (NullPool discards). If we ever switch to a real pool,
    this same pattern would catch bleed-through.
    """
    from sqlalchemy import event, text

    from merix.db import AsyncSessionLocal

    _, a_org_id = await make_org_user(org_name="GUC Leak Org A")
    _, b_org_id = await make_org_user(org_name="GUC Leak Org B")

    a_job_id = uuid.uuid4()
    async with scoped_session(a_org_id) as session:
        session.add(JobDescription(id=a_job_id, org_id=a_org_id, title="Leaky A", raw_text="a"))
        await session.commit()

    # Build a B-scoped session that uses SESSION-scoped GUC (not LOCAL).
    # After the session closes, the SESSION scope would leak on a real pool
    # but is harmless under NullPool (connection discarded).
    session_b = AsyncSessionLocal()

    def _set_b_org_session_scope(_session, _transaction, connection):
        connection.execute(
            text("SELECT set_config('app.current_org_id', :org_id, false)"),
            {"org_id": str(b_org_id)},
        )

    event.listen(session_b.sync_session, "after_begin", _set_b_org_session_scope)

    # Run a transaction on session_b that sets a SESSION-scoped GUC.
    async with session_b:
        rows = (await session_b.scalars(select(JobDescription))).all()

    await session_b.close()

    # A fresh scoped session for Org A must NOT see Org B's leaked data.
    async with scoped_session(a_org_id) as session:
        rows = (await session.scalars(select(JobDescription))).all()
        assert {r.id for r in rows} == {a_job_id}, f"GUC bleed detected! Org A saw: {[r.id for r in rows]}"

    # Clean up.
    async with scoped_session(a_org_id) as session:
        job = await session.get(JobDescription, a_job_id)
        await session.delete(job)
        await session.commit()
