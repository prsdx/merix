"""Landing-page interest signups (design-partner leads)."""

import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.models.interest import InterestSignup
from merix.schemas.interest import InterestRequest

logger = logging.getLogger("merix.services.interest")


async def submit(db: AsyncSession, body: InterestRequest) -> dict:
    """Upsert a lead by lowercased email; honeypot hits are swallowed.

    Returns the same response shape either way so bots learn nothing.
    """
    if body.website:
        logger.warning("interest_signup: honeypot triggered, discarding")
        return {"status": "received"}

    normalized = body.email.strip().lower()
    existing = await db.scalar(
        select(InterestSignup).where(func.lower(InterestSignup.email) == normalized)
    )
    if existing is None:
        db.add(InterestSignup(email=normalized))
    # Repeat submissions just refresh updated_at via onupdate.
    await db.commit()
    return {"status": "received"}
