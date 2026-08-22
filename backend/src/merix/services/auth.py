"""Auth orchestration: signup (org + auth identity + profile) and login."""

import logging
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.clients.auth import AuthClientError, SupabaseAuthClient
from merix.core.exceptions import AuthenticationError, ConflictError
from merix.models.organisation import Organisation
from merix.models.user import User

logger = logging.getLogger("merix.services.auth")


async def signup(db: AsyncSession, auth: SupabaseAuthClient, org_name: str, email: str, password: str) -> dict[str, Any]:
    """Register a new organisation with its first user; return a session."""
    try:
        auth_user_id = await auth.create_user(email, password)
    except AuthClientError as exc:
        if exc.status_code in (400, 422):  # GoTrue: already registered / invalid
            raise ConflictError(f"cannot register {email}: {exc}") from exc
        raise

    org = Organisation(name=org_name)
    db.add(org)
    await db.flush()  # generate org.id before it is referenced as a FK
    user = User(id=uuid.UUID(auth_user_id), org_id=org.id, email=email)
    db.add(user)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        await auth.delete_user(auth_user_id)  # don't leave an orphan login behind
        raise

    logger.info("signup org_id=%s user_id=%s", org.id, user.id)
    return await login(db, auth, email, password)


async def login(db: AsyncSession, auth: SupabaseAuthClient, email: str, password: str) -> dict[str, Any]:
    """Verify credentials against GoTrue and return the token payload."""
    user = await db.scalar(select(User).where(User.email == email))
    if user is None:
        raise AuthenticationError("invalid email or password")
    try:
        tokens = await auth.login(email, password)
    except AuthClientError as exc:
        raise AuthenticationError("invalid email or password") from exc
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer",
        "expires_in": tokens["expires_in"],
    }
