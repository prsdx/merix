"""Organisation endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.dependencies import get_current_user, get_scoped_db
from merix.models.audit import AuditEvent
from merix.models.organisation import Organisation
from merix.models.user import User
from merix.schemas.org import AuditEventResponse, OrgResponse, OrgUpdate

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


@router.get("/audit-logs", response_model=list[AuditEventResponse])
async def list_audit_logs(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
    limit: int = 100,
) -> list[AuditEvent]:
    """Return the DPDP audit trail for the caller's organisation."""
    events = list(
        (
            await db.scalars(
                select(AuditEvent).where(AuditEvent.org_id == user.org_id).order_by(AuditEvent.created_at.desc()).limit(limit)
            )
        ).all()
    )
    return events
