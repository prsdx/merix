"""Admin/system endpoints (v1: retention sweep only)."""

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.dependencies import get_current_user, get_db
from merix.models.organisation import Organisation
from merix.models.user import User
from merix.services import retention

router = APIRouter()


async def _run_retention_sweep() -> None:
    """Background task: enumerate orgs and hard-delete expired resumes."""
    async with get_db() as db:
        org_ids = list((await db.scalars(select(Organisation.id))).all())
    await retention.sweep_all_orgs(org_ids)


@router.post("/retention-sweep")
async def retention_sweep(
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
) -> dict:
    """Trigger the DPDP retention sweep (runs asynchronously)."""
    background_tasks.add_task(_run_retention_sweep)
    return {"detail": "retention sweep started"}
