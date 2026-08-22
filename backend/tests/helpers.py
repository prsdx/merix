"""Shared test helpers: fake provider clients, JWT minting, PDF building.

Integration tests run against the real (dev) database but fake the LLM,
embedding, and GoTrue clients. Tokens are real HS256 JWTs minted locally
and verified by the exact production code path (merix.core.security).
"""

import json
import uuid
from datetime import UTC, datetime, timedelta

import jwt

from merix.clients.base import LLMResult
from merix.config import settings

DIM = 768

# Tokens are verified against settings.SUPABASE_JWT_SECRET; fall back to a
# test-only secret when the real one isn't configured (tests never call
# Supabase, so the value only needs to be consistent within the process).
TEST_JWT_SECRET = (
    settings.SUPABASE_JWT_SECRET or "test-only-jwt-secret-with-at-least-32-bytes"
)
settings.SUPABASE_JWT_SECRET = TEST_JWT_SECRET


class FakeLLM:
    async def generate(self, prompt, *, system=None, temperature=0.0, max_tokens=1024):
        p = prompt.lower()
        if "job description" in p:
            return LLMResult(
                text=json.dumps(
                    {
                        "required_skills": ["python", "sql"],
                        "preferred_skills": ["aws"],
                        "min_experience_years": 2,
                        "education": "B.Tech",
                    }
                ),
                prompt_tokens=10,
                completion_tokens=5,
            )
        if "resume" in p and "rationale" not in p:
            return LLMResult(
                text=json.dumps(
                    {
                        "skills": [
                            {"skill": "Python", "evidence": "built Python services"},
                            {"skill": "SQL", "evidence": "optimised SQL"},
                        ],
                        "experience_years": 3,
                        "education": "B.Tech",
                    }
                ),
                prompt_tokens=10,
                completion_tokens=5,
            )
        return LLMResult(
            text="Strong match on Python and SQL.", prompt_tokens=5, completion_tokens=5
        )


class FakeEmbedder:
    async def embed(self, text: str):
        return [0.01] * DIM

    async def embed_batch(self, texts):
        return [[0.01] * DIM for _ in texts]


def make_token(
    user_id: uuid.UUID | str,
    *,
    expires_in: int = 3600,
    secret: str = TEST_JWT_SECRET,
    audience: str = "authenticated",
) -> str:
    """Mint a GoTrue-shaped access token (HS256, aud=authenticated, sub=user)."""
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "aud": audience,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_in)).timestamp()),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def auth_headers(user_id: uuid.UUID | str) -> dict[str, str]:
    return {"Authorization": f"Bearer {make_token(user_id)}"}


def make_pdf(text: str) -> bytes:
    """Build a minimal valid PDF containing the given text (via pymupdf)."""
    import pymupdf

    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    data = doc.tobytes()
    doc.close()
    return data


def make_multi_page_pdf(pages: int) -> bytes:
    """Build a valid PDF with the given number of pages (for parser-limit tests)."""
    import pymupdf

    doc = pymupdf.open()
    for i in range(pages):
        page = doc.new_page()
        page.insert_text((72, 72), f"Page {i}: Python developer with SQL experience.")
    data = doc.tobytes()
    doc.close()
    return data
