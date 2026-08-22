"""Batch job status endpoint.

Requires authentication and organisation scoping (RLS).
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from merix.core.exceptions import NotFoundError
from merix.dependencies import get_current_user, get_scoped_db
from merix.models.batch_job import BatchJob
from merix.models.user import User
from merix.schemas.batch_job import BatchJobStatus

router = APIRouter()

STALE_THRESHOLD_MINUTES = 10


@router.get("/{batch_job_id}", response_model=BatchJobStatus)
async def get_batch_job_status(
    batch_job_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> BatchJob:
    """Get the status of a batch match job.

    If the job has been 'running' for more than 10 minutes without an
    update, it is treated as stale (server restart / crash) and marked
    as 'failed' on the next poll.
    """
    batch_job = await db.get(BatchJob, batch_job_id)

    if batch_job is None:
        raise NotFoundError("Batch job not found")

    # Stale detection: if the job is still running but hasn't been
    # updated in > STALE_THRESHOLD_MINUTES, the background task is
    # dead (server restart / crash). Mark it failed so the client
    # sees the outcome on the next poll instead of waiting forever.
    if batch_job.status == "running":
        age = datetime.now(timezone.utc) - batch_job.updated_at
        if age.total_seconds() > STALE_THRESHOLD_MINUTES * 60:
            batch_job.status = "failed"
            batch_job.error_message = (
                "Job timed out — server may have restarted during processing"
            )
            await db.commit()
            await db.refresh(batch_job)

    return batch_job