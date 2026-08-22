"""Authentication endpoints (backed by Supabase Auth / GoTrue)."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from merix.clients.auth import SupabaseAuthClient
from merix.core.rate_limit import LOGIN_RATE_LIMIT, SIGNUP_RATE_LIMIT, limiter
from merix.dependencies import get_auth, get_current_user, get_db
from merix.models.organisation import Organisation
from merix.models.user import User
from merix.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    SignupRequest,
    TokenResponse,
)
from merix.services import auth as auth_service

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(SIGNUP_RATE_LIMIT)
async def signup(
    request: Request,
    body: SignupRequest,
    db: AsyncSession = Depends(get_db),
    auth: SupabaseAuthClient = Depends(get_auth),
) -> dict:
    """Register a new organisation and its first user; returns a session."""
    return await auth_service.signup(db, auth, body.org_name, body.email, body.password)


@router.post("/login", response_model=TokenResponse)
@limiter.limit(LOGIN_RATE_LIMIT)
async def login(
    request: Request,
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
    auth: SupabaseAuthClient = Depends(get_auth),
) -> dict:
    """Log in with email + password; returns a session."""
    return await auth_service.login(db, auth, body.email, body.password)


@router.get("/me", response_model=CurrentUserResponse)
async def me(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CurrentUserResponse:
    """Return the authenticated user's profile and organisation."""
    org = await db.get(Organisation, user.org_id)
    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        org_id=user.org_id,
        org_name=org.name if org else "",
    )
