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
    a_user_id, _ = await make_org_user(org_name="Org A")
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
    assert r.status_code == 201, r.text

    r = client.post(f"/api/jobs/{job_id}/match", headers=a)
    assert r.status_code == 200, r.text
    match_id = r.json()["results"][0]["id"]

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
        session.add(
            JobDescription(id=a_job_id, org_id=a_org_id, title="A Job", raw_text="t")
        )
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
        session.add(
            JobDescription(org_id=a_org_id, title="Forged", raw_text="t")
        )
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
