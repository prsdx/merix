"""Pytest configuration and shared fixtures."""

import uuid
from collections.abc import AsyncGenerator, Awaitable, Callable

import pytest
from fastapi.testclient import TestClient

from merix.db import AsyncSessionLocal
from merix.dependencies import get_embedder, get_llm
from merix.main import app
from merix.models.organisation import Organisation
from merix.models.user import User
from tests.helpers import FakeEmbedder, FakeLLM


@pytest.fixture
def client():
    """TestClient with fake LLM/embedding clients (no external API keys)."""
    app.dependency_overrides[get_llm] = lambda: FakeLLM()
    app.dependency_overrides[get_embedder] = lambda: FakeEmbedder()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
async def make_org_user() -> AsyncGenerator[
    Callable[[str, str | None], Awaitable[tuple[uuid.UUID, uuid.UUID]]], None
]:
    """Factory: create (org, user) rows directly; cascade-clean up after.

    Bypasses the signup endpoint so tests can focus on their own subject;
    signup itself is covered in test_auth.py.
    """
    created_org_ids: list[uuid.UUID] = []

    async def _make(
        org_name: str = "Test Org", email: str | None = None
    ) -> tuple[uuid.UUID, uuid.UUID]:
        async with AsyncSessionLocal() as session:
            org = Organisation(name=org_name)
            session.add(org)
            await session.flush()
            user = User(
                id=uuid.uuid4(),
                org_id=org.id,
                email=email or f"{uuid.uuid4().hex[:12]}@example.com",
            )
            session.add(user)
            await session.commit()
            created_org_ids.append(org.id)
            return user.id, org.id

    yield _make

    # ON DELETE CASCADE removes the user and all tenant data for the org.
    async with AsyncSessionLocal() as session:
        for org_id in created_org_ids:
            org = await session.get(Organisation, org_id)
            if org is not None:
                await session.delete(org)
        await session.commit()
