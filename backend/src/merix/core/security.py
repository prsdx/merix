"""Security utilities: local verification of Supabase Auth access tokens.

GoTrue (Supabase Auth) signs access tokens with the project JWT secret
(HS256). Verifying locally avoids a network round-trip per request. We never
issue tokens or handle password hashes ourselves.
"""

import uuid

import jwt
from jwt import PyJWKClient

from merix.config import settings
from merix.core.exceptions import AuthenticationError

# Audience GoTrue puts on user access tokens.
_GOTRUE_AUDIENCE = "authenticated"

_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(url)
    return _jwks_client


def verify_access_token(token: str) -> uuid.UUID:
    """Verify a Supabase Auth access token; return the user id (sub claim)."""
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", settings.JWT_ALGORITHM)

        if alg == "ES256":
            signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
            key = signing_key.key
        else:
            key = settings.SUPABASE_JWT_SECRET

        payload = jwt.decode(
            token,
            key,
            algorithms=[alg],
            audience=_GOTRUE_AUDIENCE,
        )
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("access token has expired") from exc
    except jwt.PyJWKClientError as exc:
        raise AuthenticationError("failed to fetch jwks") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthenticationError("invalid access token") from exc
    try:
        return uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise AuthenticationError("access token has no valid subject") from exc
