"""Security utilities: local verification of Supabase Auth access tokens.

GoTrue (Supabase Auth) signs access tokens with the project JWT secret
(HS256). Verifying locally avoids a network round-trip per request. We never
issue tokens or handle password hashes ourselves.
"""

import uuid

import jwt

from merix.config import settings
from merix.core.exceptions import AuthenticationError

# Audience GoTrue puts on user access tokens.
_GOTRUE_AUDIENCE = "authenticated"


def verify_access_token(token: str) -> uuid.UUID:
    """Verify a Supabase Auth access token; return the user id (sub claim)."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience=_GOTRUE_AUDIENCE,
        )
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("access token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthenticationError("invalid access token") from exc
    try:
        return uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise AuthenticationError("access token has no valid subject") from exc

