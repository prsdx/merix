"""Integration tests for DPDP consent, retention, and erasure workflow.

Runs against the real database with fake LLM/embedder clients.
"""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select

from merix.db import scoped_session
from merix.models.audit import AuditEvent
from merix.models.job import JobDescription
from merix.models.match import MatchResult
from merix.models.resume import Resume
from merix.services import retention
from tests.helpers import auth_headers, make_pdf


@pytest.fixture
async def org_user(make_org_user):
    """Authenticated user + pre-created job for resume tests."""
    user_id, org_id = await make_org_user(org_name="Consent Org")
    async with scoped_session(org_id) as session:
        job = JobDescription(org_id=org_id, title="Test", raw_text="Need Python.")
        session.add(job)
        await session.commit()
        await session.refresh(job)
        job_id = job.id
    yield auth_headers(user_id), org_id, job_id


async def _upload_resume(client, headers, job_id, consent_given: bool = True):
    pdf = make_pdf("Candidate Name. Built Python services and optimised SQL queries for 3 years at ACME Corp.")
    r = client.post(
        f"/api/jobs/{job_id}/resumes",
        files={"file": ("candidate.pdf", pdf, "application/pdf")},
        data={"candidate_name": "Candidate", "consent_given": str(consent_given).lower()},
        headers=headers,
    )
    return r


async def _upload_and_get_resume_id(client, headers, job_id) -> str:
    """Upload via the API and return the persisted resume id.

    Upload is async (202 + BatchJobStatus); the background processor has run
    by the time TestClient returns, so the batch job can be polled for the
    created resume's id via the public status contract.
    """
    r = await _upload_resume(client, headers, job_id, consent_given=True)
    assert r.status_code == 202, r.text
    batch_job_id = r.json()["id"]
    body = client.get(f"/api/batch-jobs/{batch_job_id}", headers=headers).json()
    assert body["status"] == "completed", body
    return body["batch_results"][0]["resume_id"]


async def test_upload_without_consent_is_rejected(client, org_user):
    headers, _org_id, job_id = org_user
    r = await _upload_resume(client, headers, job_id, consent_given=False)
    assert r.status_code == 400, r.text
    assert "consent" in r.json()["detail"].lower()


async def test_upload_with_consent_records_timestamp_and_expiry(client, org_user):
    headers, org_id, job_id = org_user
    r = await _upload_resume(client, headers, job_id, consent_given=True)
    assert r.status_code == 202, r.text

    # The 202 response is a BatchJobStatus now; consent fields are verified on
    # the persisted resume row instead of the upload response payload.
    async with scoped_session(org_id) as session:
        resumes = (await session.scalars(select(Resume).where(Resume.job_id == job_id))).all()
        assert len(resumes) == 1
        resume = resumes[0]
        assert resume.consent_given is True
        assert resume.consent_timestamp is not None
        assert resume.retention_expires_at == resume.consent_timestamp + timedelta(days=90)


async def test_manual_deletion_removes_resume_and_matches(client, org_user):
    headers, org_id, job_id = org_user

    # Upload and match
    resume_id = await _upload_and_get_resume_id(client, headers, job_id)
    client.post(f"/api/jobs/{job_id}/match", headers=headers)

    async with scoped_session(org_id) as session:
        matches_before = list((await session.scalars(select(MatchResult).where(MatchResult.resume_id == resume_id))).all())
        assert len(matches_before) == 1

    # Delete
    r = client.delete(f"/api/candidates/{resume_id}", headers=headers)
    assert r.status_code == 204, r.text

    async with scoped_session(org_id) as session:
        resume = await session.get(Resume, uuid.UUID(resume_id))
        assert resume is None
        matches_after = list((await session.scalars(select(MatchResult).where(MatchResult.resume_id == resume_id))).all())
        assert len(matches_after) == 0

        audit = list(
            (
                await session.scalars(
                    select(AuditEvent).where(
                        AuditEvent.org_id == org_id,
                        AuditEvent.event_type == "deletion_requested",
                    )
                )
            ).all()
        )
        assert len(audit) == 1
        assert audit[0].actor_type == "user"
        assert audit[0].event_metadata["resume_id"] == resume_id


async def test_retention_sweep_deletes_expired_resumes(client, org_user):
    headers, org_id, job_id = org_user

    resume_id = await _upload_and_get_resume_id(client, headers, job_id)
    client.post(f"/api/jobs/{job_id}/match", headers=headers)

    # Force expiration
    async with scoped_session(org_id) as session:
        resume = await session.get(Resume, uuid.UUID(resume_id))
        resume.retention_expires_at = datetime.now(UTC) - timedelta(days=1)
        await session.commit()

    # Run sweep directly (scheduled job path)
    await retention.sweep_all_orgs([org_id])

    async with scoped_session(org_id) as session:
        resume = await session.get(Resume, uuid.UUID(resume_id))
        assert resume is None
        matches = list((await session.scalars(select(MatchResult).where(MatchResult.resume_id == resume_id))).all())
        assert len(matches) == 0

        audit = list(
            (
                await session.scalars(
                    select(AuditEvent).where(
                        AuditEvent.org_id == org_id,
                        AuditEvent.event_type == "deletion_scheduled",
                    )
                )
            ).all()
        )
        assert len(audit) == 1
        assert audit[0].actor_type == "system"
        assert audit[0].event_metadata["resume_id"] == resume_id


async def test_org_can_update_retention_policy(client, org_user):
    headers, org_id, _job_id = org_user
    r = client.patch("/api/orgs/me", json={"retention_days": 30}, headers=headers)
    assert r.status_code == 200, r.text
    assert r.json()["retention_days"] == 30

    async with scoped_session(org_id) as session:
        from merix.models.organisation import Organisation

        org = await session.get(Organisation, org_id)
        assert org.retention_days == 30
