"""Match result endpoints (read-side of the vertical slice)."""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.dependencies import get_db
from merix.models.match import MatchResult
from merix.models.resume import Resume
from merix.services import pipeline

router = APIRouter()


@router.get("/{match_id}")
async def get_match(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> dict:
    """Get a single match result with full explainability."""
    match = await pipeline.get_match_or_404(db, match_id)
    resume = await db.get(Resume, match.resume_id)
    return pipeline.to_match_response(match, resume)