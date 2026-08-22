"""Audit log model for DPDP compliance events."""

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from merix.models.base import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    pass


class AuditEvent(Base, TimestampMixin):
    """Append-only record of consent and deletion events.

    The resume FK is nullable + SET NULL so the audit trail survives the
    deletion of the record it refers to.
    """

    __tablename__ = "audit_events"

    id: Mapped[uuid.UUID] = uuid_pk()
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resume_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # consent_given | deletion_requested | deletion_scheduled
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # 'user' for human actions, 'system' for scheduled sweep
    actor_type: Mapped[str] = mapped_column(String(20), nullable=False)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Free-form context (e.g. retention_days, filename, triggered_by).
    event_metadata: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
