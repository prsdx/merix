"""DPDP retention/deletion service and audit logging."""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.db import scoped_session
from merix.models.audit import AuditEvent
from merix.models.resume import Resume

if TYPE_CHECKING:
    from collections.abc import Sequence

logger = logging.getLogger("merix.services.retention")


async def log_audit_event(
    db: AsyncSession,
    *,
    org_id: uuid.UUID,
    resume_id: uuid.UUID | None,
    event_type: str,
    actor_type: str,
    actor_user_id: uuid.UUID | None = None,
    event_metadata: dict | None = None,
) -> AuditEvent:
    """Append a DPDP audit record."""
    event = AuditEvent(
        org_id=org_id,
        resume_id=resume_id,
        event_type=event_type,
        actor_type=actor_type,
        actor_user_id=actor_user_id,
        event_metadata=event_metadata or {},
    )
    db.add(event)
    await db.flush()
    return event


async def delete_resume(
    db: AsyncSession,
    resume: Resume,
    *,
    actor_type: str,
    actor_user_id: uuid.UUID | None = None,
    triggered_by: str | None = None,
) -> None:
    """Hard-delete a resume; cascades to MatchResult rows.

    The caller is responsible for committing the session.
    """
    await log_audit_event(
        db,
        org_id=resume.org_id,
        resume_id=resume.id,
        event_type="deletion_requested" if actor_type == "user" else "deletion_scheduled",
        actor_type=actor_type,
        actor_user_id=actor_user_id,
        event_metadata={
            "triggered_by": triggered_by or actor_type,
            "resume_id": str(resume.id),
        },
    )
    await db.delete(resume)
    logger.info(
        "resume_deleted resume_id=%s org_id=%s actor_type=%s",
        resume.id,
        resume.org_id,
        actor_type,
    )


async def sweep_expired_for_org(
    db: AsyncSession,
    org_id: uuid.UUID,
    *,
    now: datetime | None = None,
) -> list[uuid.UUID]:
    """Delete all resumes in one org whose retention period has expired.

    Must run inside a session scoped to the target org so RLS binds.
    """
    now = now or datetime.now(UTC)
    resumes = list(
        (
            await db.scalars(
                select(Resume).where(
                    Resume.retention_expires_at.is_not(None),
                    Resume.retention_expires_at <= now,
                )
            )
        ).all()
    )
    deleted: list[uuid.UUID] = []
    for resume in resumes:
        await delete_resume(
            db,
            resume,
            actor_type="system",
            triggered_by="retention_sweep",
        )
        deleted.append(resume.id)
    if deleted:
        await db.commit()
        logger.info("retention_sweep org_id=%s deleted=%d", org_id, len(deleted))
    return deleted


async def sweep_all_orgs(
    list_org_ids: Sequence[uuid.UUID],
    *,
    now: datetime | None = None,
) -> dict[uuid.UUID, list[uuid.UUID]]:
    """Run the retention sweep across all given orgs.

    Each org is processed in its own scoped session so RLS stays intact and
    audit rows are written with the correct org context.
    """
    now = now or datetime.now(UTC)
    results: dict[uuid.UUID, list[uuid.UUID]] = {}
    for org_id in list_org_ids:
        session = scoped_session(org_id)
        try:
            results[org_id] = await sweep_expired_for_org(session, org_id, now=now)
        finally:
            await session.close()
    return results
