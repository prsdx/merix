"""End-to-end integration test of the vertical slice.

Overrides the LLM + embedding clients with fakes (no external API keys needed)
but uses the REAL database, exercising: create job -> upload resume -> batch
match -> ranked results, with full explainability persisted.
"""

import io

import pytest
from fastapi.testclient import TestClient

from merix.clients.base import LLMResult
from merix.dependencies import get_embedder, get_llm
from merix.main import app

DIM = 1536


class FakeLLM:
    async def generate(self, prompt, *, system=None, temperature=0.0, max_tokens=1024):
        p = prompt.lower()
        if "job description" in p:
            return LLMResult(
                text='{"required_skills": ["python", "sql"], "preferred_skills": ["aws"], "min_experience_years": 2, "education": "B.Tech"}',
                prompt_tokens=10,
                completion_tokens=5,
            )
        if "resume" in p and "rationale" not in p:
            return LLMResult(
                text='{"skills": [{"skill": "Python", "evidence": "built Python services"}, {"skill": "SQL", "evidence": "optimised SQL"}], "experience_years": 3, "education": "B.Tech"}',
                prompt_tokens=10,
                completion_tokens=5,
            )
        return LLMResult(text="Strong match on Python and SQL.", prompt_tokens=5, completion_tokens=5)


class FakeEmbedder:
    async def embed(self, text: str):
        return [0.01] * DIM

    async def embed_batch(self, texts):
        return [[0.01] * DIM for _ in texts]


def _make_pdf(text: str) -> bytes:
    """Build a minimal valid PDF containing the given text (via pymupdf)."""
    import pymupdf

    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    data = doc.tobytes()
    doc.close()
    return data


@pytest.fixture
def client():
    app.dependency_overrides[get_llm] = lambda: FakeLLM()
    app.dependency_overrides[get_embedder] = lambda: FakeEmbedder()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_vertical_slice_end_to_end(client):
    # 1. create job
    r = client.post("/api/jobs", json={"title": "Backend Engineer", "raw_text": "We need Python and SQL. AWS is a plus. 2+ years."})
    assert r.status_code == 201, r.text
    job = r.json()
    job_id = job["id"]
    assert job["parsed"]["required_skills"] == ["python", "sql"]

    # 2. upload a resume PDF
    pdf = _make_pdf("Jane Doe. Built Python services and optimised SQL for 3 years.")
    r = client.post(
        f"/api/jobs/{job_id}/resumes",
        files={"file": ("jane.pdf", pdf, "application/pdf")},
        params={"candidate_name": "Jane Doe"},
    )
    assert r.status_code == 201, r.text
    resume = r.json()
    assert resume["candidate_name"] == "Jane Doe"

    # 3. run batch match
    r = client.post(f"/api/jobs/{job_id}/match")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["count"] == 1
    result = body["results"][0]
    assert result["score"] > 0
    matched = {m["skill"] for m in result["matched_skills"]}
    assert "Python" in matched and "SQL" in matched
    assert result["rationale"]

    # 4. get ranked shortlist (persisted)
    r = client.get(f"/api/jobs/{job_id}/matches")
    assert r.status_code == 200, r.text
    shortlist = r.json()
    assert shortlist["count"] == 1
    assert shortlist["results"][0]["candidate_name"] == "Jane Doe"

    # 5. get single match by id
    match_id = shortlist["results"][0]["id"]
    r = client.get(f"/api/matches/{match_id}")
    assert r.status_code == 200, r.text
    assert r.json()["id"] == match_id


@pytest.mark.asyncio
async def test_upload_rejects_non_pdf(client):
    r = client.post("/api/jobs", json={"title": "T", "raw_text": "x"})
    job_id = r.json()["id"]
    r = client.post(
        f"/api/jobs/{job_id}/resumes",
        files={"file": ("evil.txt", b"not a pdf", "text/plain")},
    )
    assert r.status_code in (400, 415, 422), r.text


@pytest.mark.asyncio
async def test_match_unknown_job_404(client):
    import uuid

    r = client.post(f"/api/jobs/{uuid.uuid4()}/match")
    assert r.status_code == 404, r.text