"""FastAPI dependencies."""

from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from merix.clients.auth import SupabaseAuthClient
from merix.clients.base import EmbeddingClient, LLMClient
from merix.clients.embeddings import get_embedding_client
from merix.clients.llm import get_llm_client
from merix.config import settings
from merix.core.exceptions import AuthenticationError
from merix.core.security import verify_access_token
from merix.db import get_db, scoped_session
from merix.models.user import User

__all__ = [
    "get_db",
    "get_llm",
    "get_embedder",
    "get_auth",
    "get_current_user",
    "get_scoped_db",
]

_bearer = HTTPBearer(auto_error=False, description="Supabase Auth access token")


def get_llm() -> LLMClient:
    """LLM client dependency (provider from settings; v1: Groq)."""
    return get_llm_client(api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL)


def get_embedder() -> EmbeddingClient:
    """Embedding client dependency (provider from settings; v1: Google Gemini)."""
    return get_embedding_client(
        provider=settings.EMBEDDING_PROVIDER,
        api_key=settings.EMBEDDING_API_KEY,
        model=settings.EMBEDDING_MODEL,
    )


def get_auth() -> SupabaseAuthClient:
    """Supabase Auth (GoTrue) client dependency."""
    return SupabaseAuthClient(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Authenticate the caller: verify the Supabase JWT, load the profile."""
    if credentials is None:
        raise AuthenticationError("missing bearer token")
    user_id = verify_access_token(credentials.credentials)
    user = await db.get(User, user_id)
    if user is None:
        raise AuthenticationError("no account exists for this token")
    return user


async def get_scoped_db(
    user: User = Depends(get_current_user),
) -> AsyncGenerator[AsyncSession, None]:
    """DB session pinned to the caller's org (RLS context per transaction)."""
    session = scoped_session(user.org_id)
    try:
        yield session
    finally:
        await session.close()
