"""Rate-limiting tests (Task 4): brute-force protection on signup/login."""

import uuid

import pytest

from merix.dependencies import get_auth
from merix.main import app
from tests.integration.test_auth import FakeAuthClient


@pytest.fixture
def fake_auth():
    """Override the GoTrue client with an in-memory fake for rate-limit tests."""
    fake = FakeAuthClient()
    app.dependency_overrides[get_auth] = lambda: fake
    yield fake
    app.dependency_overrides.pop(get_auth, None)


def _signup_payload() -> dict:
    return {
        "org_name": "Org",
        "email": f"{uuid.uuid4().hex[:12]}@example.com",
        "password": "password123",
    }


async def test_signup_rate_limited_after_5_per_hour(client, fake_auth):
    """Requests 1-5 pass validation; the 6th from the same IP is 429."""
    codes = [
        client.post("/api/auth/signup", json=_signup_payload()).status_code
        for _ in range(6)
    ]
    assert codes[:5] == [201] * 5 or all(c in (201, 409) for c in codes[:5]), codes
    assert codes[5] == 429, codes


async def test_login_rate_limited_after_10_per_minute(client, fake_auth):
    """The first 10 login attempts reach auth logic (401 for bad creds); #11 is 429."""
    payload = {
        "email": f"{uuid.uuid4().hex[:12]}@example.com",
        "password": "wrong-password",
    }
    codes = [
        client.post(
            "/api/auth/login", json=payload,
        ).status_code
        for _ in range(11)
    ]
    assert codes[:10] == [401] * 10, codes
    assert codes[10] == 429, codes
