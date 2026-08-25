"""Match result endpoints (read-side of the vertical slice).

Authenticated and org-scoped like the rest of the API.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.dependencies import get_current_user, get_scoped_db
from merix.models.resume import Resume
from merix.models.user import User
from merix.services import pipeline

router = APIRouter()


@router.get("/{match_id}")
async def get_match(
    match_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> dict:
    """Get a single match result with full explainability."""
    match = await pipeline.get_match_or_404(db, match_id, user.org_id)
    # Column-limited fetch: only the candidate name is needed here, not the
    # resume's raw_text or embedding vector.
    row = await db.execute(select(Resume.candidate_name).where(Resume.id == match.resume_id))
    candidate_name = row.scalar_one_or_none()
    return pipeline.to_match_response(match, candidate_name)
