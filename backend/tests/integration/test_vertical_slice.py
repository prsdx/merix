"""End-to-end integration test of the vertical slice.

Overrides the LLM + embedding clients with fakes (no external API keys needed)
but uses the REAL database, exercising: create job -> upload resume -> batch
match -> ranked results, with full explainability persisted — all under an
authenticated, org-scoped session, as in production.
"""

import uuid

import pytest

from tests.helpers import auth_headers, make_pdf


@pytest.fixture
async def org_a(make_org_user):
    """An authenticated Org A user (headers carry a valid access token)."""
    user_id, _org_id = await make_org_user(org_name="Slice Org")
    return auth_headers(user_id)


async def test_vertical_slice_end_to_end(client, org_a):
    # 1. create job
    r = client.post(
        "/api/jobs",
        json={
            "title": "Backend Engineer",
            "raw_text": "We need Python and SQL. AWS is a plus. 2+ years.",
        },
        headers=org_a,
    )
    assert r.status_code == 201, r.text
    job = r.json()
    job_id = job["id"]
    assert job["parsed"]["required_skills"] == ["python", "sql"]

    # 2. upload a resume PDF
    pdf = make_pdf("Jane Doe. Built Python services and optimised SQL for 3 years.")
    r = client.post(
        f"/api/jobs/{job_id}/resumes",
        files={"file": ("jane.pdf", pdf, "application/pdf")},
        data={"candidate_name": "Jane Doe", "consent_given": "true"},
        headers=org_a,
    )
    assert r.status_code == 201, r.text
    resume = r.json()
    assert resume["candidate_name"] == "Jane Doe"
    assert resume["consent_given"] is True
    assert resume["consent_timestamp"] is not None
    assert resume["retention_expires_at"] is not None

    # 3. run batch match
    r = client.post(f"/api/jobs/{job_id}/match", headers=org_a)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["count"] == 1
    result = body["results"][0]
    assert result["score"] > 0
    matched = {m["skill"] for m in result["matched_skills"]}
    assert "Python" in matched and "SQL" in matched
    assert result["rationale"]

    # 4. get ranked shortlist (persisted)
    r = client.get(f"/api/jobs/{job_id}/matches", headers=org_a)
    assert r.status_code == 200, r.text
    shortlist = r.json()
    assert shortlist["count"] == 1
    assert shortlist["results"][0]["candidate_name"] == "Jane Doe"

    # 5. get single match by id
    match_id = shortlist["results"][0]["id"]
    r = client.get(f"/api/matches/{match_id}", headers=org_a)
    assert r.status_code == 200, r.text
    assert r.json()["id"] == match_id


async def test_upload_rejects_non_pdf(client, org_a):
    r = client.post("/api/jobs", json={"title": "T", "raw_text": "x"}, headers=org_a)
    job_id = r.json()["id"]
    r = client.post(
        f"/api/jobs/{job_id}/resumes",
        files={"file": ("evil.txt", b"not a pdf", "text/plain")},
        data={"consent_given": "true"},
        headers=org_a,
    )
    assert r.status_code in (400, 415, 422), r.text


async def test_match_unknown_job_404(client, org_a):
    r = client.post(f"/api/jobs/{uuid.uuid4()}/match", headers=org_a)
    assert r.status_code == 404, r.text
