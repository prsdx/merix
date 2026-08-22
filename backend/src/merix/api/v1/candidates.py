"""Candidate / resume endpoints.

- DELETE /candidates/{resume_id} - Delete candidate data (DPDP right to erasure)
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.dependencies import get_current_user, get_scoped_db
from merix.models.resume import Resume
from merix.models.user import User
from merix.services import retention

router = APIRouter()


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    resume_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> None:
    """Hard-delete a resume and its match results (data-principal erasure right)."""
    resume = await db.scalar(select(Resume).where(Resume.id == resume_id, Resume.org_id == user.org_id))
    if resume is None:
        from merix.core.exceptions import NotFoundError

        raise NotFoundError(f"resume {resume_id} not found")
    await retention.delete_resume(
        db,
        resume,
        actor_type="user",
        actor_user_id=user.id,
        triggered_by="data_principal_request",
    )
    await db.commit()
