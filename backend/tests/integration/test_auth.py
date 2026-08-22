"""Authentication tests: token failure paths, /me, and signup/login flows.

Signup/login run against a fake in-memory GoTrue client (no Supabase
credentials needed); the access tokens it returns are real HS256 JWTs, so
the full verify -> load-profile -> authorise path is exercised for real.
"""

import uuid

import pytest
from sqlalchemy import select

from merix.clients.auth import AuthClientError
from merix.db import AsyncSessionLocal
from merix.dependencies import get_auth
from merix.main import app
from merix.models.organisation import Organisation
from merix.models.user import User
from tests.helpers import auth_headers, make_token


class FakeAuthClient:
    """In-memory Supabase Auth (GoTrue) stand-in."""

    def __init__(self) -> None:
        self.users: dict[str, tuple[str, str]] = {}  # email -> (user_id, password)

    async def create_user(self, email: str, password: str) -> str:
        if email in self.users:
            raise AuthClientError("User already registered", 422)
        user_id = str(uuid.uuid4())
        self.users[email] = (user_id, password)
        return user_id

    async def delete_user(self, user_id: str) -> None:
        for email, (uid, _pw) in list(self.users.items()):
            if uid == user_id:
                del self.users[email]

    async def login(self, email: str, password: str) -> dict:
        if email not in self.users or self.users[email][1] != password:
            raise AuthClientError("Invalid login credentials", 400)
        user_id = self.users[email][0]
        return {
            "access_token": make_token(user_id),
            "refresh_token": "fake-refresh",
            "expires_in": 3600,
        }


@pytest.fixture
def fake_auth(client):
    """Override the GoTrue client with an in-memory fake."""
    fake = FakeAuthClient()
    app.dependency_overrides[get_auth] = lambda: fake
    yield fake
    app.dependency_overrides.pop(get_auth, None)


async def _delete_org_by_email(email: str) -> None:
    """Cleanup helper: remove org (cascades to user) created via signup."""
    async with AsyncSessionLocal() as session:
        user = await session.scalar(select(User).where(User.email == email))
        if user is not None:
            org = await session.get(Organisation, user.org_id)
            if org is not None:
                await session.delete(org)
            await session.commit()


# --- Token failure paths ----------------------------------------------------


async def test_missing_token_returns_401(client):
    r = client.get(f"/api/jobs/{uuid.uuid4()}")
    assert r.status_code == 401, r.text
    assert r.headers.get("www-authenticate") == "Bearer"
    assert "missing bearer token" in r.json()["detail"]


async def test_malformed_token_returns_401(client):
    r = client.get(
        f"/api/jobs/{uuid.uuid4()}",
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert r.status_code == 401, r.text
    assert "invalid access token" in r.json()["detail"]


async def test_expired_token_returns_401(client, make_org_user):
    user_id, _ = await make_org_user()
    token = make_token(user_id, expires_in=-60)  # expired a minute ago
    r = client.get(f"/api/jobs/{uuid.uuid4()}", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401, r.text
    assert "expired" in r.json()["detail"]


async def test_wrong_signature_returns_401(client, make_org_user):
    user_id, _ = await make_org_user()
    token = make_token(user_id, secret="a-different-but-still-32-bytes-long-secret!")
    r = client.get(f"/api/jobs/{uuid.uuid4()}", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401, r.text


async def test_wrong_audience_returns_401(client, make_org_user):
    user_id, _ = await make_org_user()
    token = make_token(user_id, audience="service_role")
    r = client.get(f"/api/jobs/{uuid.uuid4()}", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401, r.text


async def test_token_for_unknown_user_returns_401(client):
    # Validly signed token, but no such user profile exists.
    r = client.get(f"/api/jobs/{uuid.uuid4()}", headers=auth_headers(uuid.uuid4()))
    assert r.status_code == 401, r.text
    assert "no account" in r.json()["detail"]


# --- Authenticated happy path -----------------------------------------------


async def test_me_returns_profile_and_org(client, make_org_user):
    email = f"{uuid.uuid4().hex[:12]}@example.com"
    user_id, org_id = await make_org_user(org_name="Acme Recruiting", email=email)
    r = client.get("/api/auth/me", headers=auth_headers(user_id))
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["id"] == str(user_id)
    assert body["email"] == email
    assert body["org_id"] == str(org_id)
    assert body["org_name"] == "Acme Recruiting"


# --- Signup / login (fake GoTrue) -------------------------------------------


async def test_signup_creates_org_user_and_session(client, fake_auth):
    email = f"{uuid.uuid4().hex[:12]}@example.com"
    try:
        r = client.post(
            "/api/auth/signup",
            json={"org_name": "New Org", "email": email, "password": "password123"},
        )
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["access_token"]
        assert body["token_type"] == "bearer"

        # The returned session token works against the real verify path.
        r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
        assert r.status_code == 200, r.text
        assert r.json()["email"] == email
        assert r.json()["org_name"] == "New Org"
    finally:
        await _delete_org_by_email(email)


async def test_signup_duplicate_email_returns_409(client, fake_auth):
    email = f"{uuid.uuid4().hex[:12]}@example.com"
    payload = {"org_name": "Org", "email": email, "password": "password123"}
    try:
        assert client.post("/api/auth/signup", json=payload).status_code == 201
        r = client.post("/api/auth/signup", json=payload)
        assert r.status_code == 409, r.text
    finally:
        await _delete_org_by_email(email)


async def test_login_success_returns_session(client, fake_auth):
    email = f"{uuid.uuid4().hex[:12]}@example.com"
    try:
        client.post(
            "/api/auth/signup",
            json={"org_name": "Org", "email": email, "password": "password123"},
        )
        r = client.post("/api/auth/login", json={"email": email, "password": "password123"})
        assert r.status_code == 200, r.text
        assert r.json()["access_token"]
    finally:
        await _delete_org_by_email(email)


async def test_login_wrong_password_returns_401(client, fake_auth):
    email = f"{uuid.uuid4().hex[:12]}@example.com"
    try:
        client.post(
            "/api/auth/signup",
            json={"org_name": "Org", "email": email, "password": "password123"},
        )
        r = client.post("/api/auth/login", json={"email": email, "password": "wrong"})
        assert r.status_code == 401, r.text
        assert "invalid email or password" in r.json()["detail"]
    finally:
        await _delete_org_by_email(email)


async def test_login_unknown_email_returns_401(client, fake_auth):
    r = client.post(
        "/api/auth/login",
        json={"email": f"{uuid.uuid4().hex[:12]}@example.com", "password": "x"},
    )
    assert r.status_code == 401, r.text
    assert "invalid email or password" in r.json()["detail"]
