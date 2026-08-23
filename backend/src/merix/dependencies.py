"""FastAPI dependencies."""

import uuid
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
from merix.core.security import decode_access_token
from merix.db import get_db, scoped_session
from merix.models.organisation import Organisation
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
    """Authenticate the caller: verify the Supabase JWT, load or auto-provision the profile."""
    if credentials is None:
        raise AuthenticationError("missing bearer token")
    payload = decode_access_token(credentials.credentials)
    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise AuthenticationError("access token has no valid subject") from exc

    user = await db.get(User, user_id)
    if user is None:
        # Auto-provision user & organisation for OAuth sign-ins (e.g. Google Auth)
        email = payload.get("email") or f"user-{str(user_id)[:8]}@oauth.user"
        metadata = payload.get("user_metadata") or {}
        full_name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0].capitalize()
        org_name = f"{full_name}'s Organisation"

        org = Organisation(name=org_name)
        db.add(org)
        await db.flush()

        user = User(id=user_id, org_id=org.id, email=email)
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
        except Exception:
            await db.rollback()
            raise AuthenticationError("failed to provision user account from oauth token")

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
