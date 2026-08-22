"""Organisation endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from merix.dependencies import get_current_user, get_scoped_db
from merix.models.organisation import Organisation
from merix.models.user import User
from merix.schemas.org import OrgResponse, OrgUpdate

router = APIRouter()


@router.get("/me", response_model=OrgResponse)
async def get_my_org(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> Organisation:
    """Return the caller's organisation details, including retention policy."""
    org = await db.get(Organisation, user.org_id)
    if org is None:
        from merix.core.exceptions import NotFoundError

        raise NotFoundError("organisation not found")
    return org


@router.patch("/me", response_model=OrgResponse)
async def update_my_org(
    body: OrgUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> Organisation:
    """Update the org's DPDP retention policy."""
    org = await db.get(Organisation, user.org_id)
    if org is None:
        from merix.core.exceptions import NotFoundError

        raise NotFoundError("organisation not found")
    org.retention_days = body.retention_days
    await db.commit()
    await db.refresh(org)
    return org
