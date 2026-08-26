"""Integration tests for recruiter notes on match results."""

import uuid

import pytest

from merix.db import scoped_session
from merix.services import pipeline
from tests.helpers import FakeEmbedder, FakeLLM, auth_headers


@pytest.fixture
async def seeded_match(make_org_user):
    """An authenticated org user plus one persisted match result to comment on."""
    user_id, org_id = await make_org_user(org_name="Notes Org")
    async with scoped_session(org_id) as session:
        jd = await pipeline.create_job(session, FakeLLM(), FakeEmbedder(), org_id, "Backend Engineer", "We need Python and SQL.")
        resume = await pipeline.add_resume(
            session,
            FakeLLM(),
            FakeEmbedder(),
            jd,
            "Jane Doe. Built Python services.",
            "jane.pdf",
            candidate_name="Jane Doe",
            consent_given=True,
        )
        match = await pipeline.run_match_for_resume(session, FakeLLM(), FakeEmbedder(), jd, resume)
    return auth_headers(user_id), str(match.id)


async def test_create_and_list_notes(client, seeded_match):
    headers, match_id = seeded_match

    r = client.post(f"/api/matches/{match_id}/notes", json={"body": "Strong fit - schedule a call."}, headers=headers)
    assert r.status_code == 201, r.text
    note = r.json()
    assert note["body"] == "Strong fit - schedule a call."
    assert note["match_id"] == match_id
    assert note["author_email"] is not None
    assert note["created_at"] is not None

    r = client.get(f"/api/matches/{match_id}/notes", headers=headers)
    assert r.status_code == 200, r.text
    notes = r.json()
    assert len(notes) == 1
    assert notes[0]["body"] == "Strong fit - schedule a call."
    assert notes[0]["author_id"] is not None


async def test_note_body_validation(client, seeded_match):
    headers, match_id = seeded_match
    r = client.post(f"/api/matches/{match_id}/notes", json={"body": ""}, headers=headers)
    assert r.status_code == 422
    r = client.post(f"/api/matches/{match_id}/notes", json={"body": "x" * 5001}, headers=headers)
    assert r.status_code == 422


async def test_unknown_match_404(client, make_org_user):
    user_id, _org_id = await make_org_user(org_name="Lonely Org")
    headers = auth_headers(user_id)
    r = client.post(f"/api/matches/{uuid.uuid4()}/notes", json={"body": "hi"}, headers=headers)
    assert r.status_code == 404
    r = client.get(f"/api/matches/{uuid.uuid4()}/notes", headers=headers)
    assert r.status_code == 404


async def test_org_isolation_no_existence_leak(client, seeded_match, make_org_user):
    headers_a, match_id = seeded_match
    other_user_id, _org_b = await make_org_user(org_name="Other Org")
    headers_b = auth_headers(other_user_id)

    # Another org can neither read nor annotate this match: 404 either way.
    r = client.get(f"/api/matches/{match_id}/notes", headers=headers_b)
    assert r.status_code == 404
    r = client.post(f"/api/matches/{match_id}/notes", json={"body": "sneaky"}, headers=headers_b)
    assert r.status_code == 404

    # And the blocked write persisted nothing.
    r = client.get(f"/api/matches/{match_id}/notes", headers=headers_a)
    assert r.status_code == 200
    assert len(r.json()) == 0
