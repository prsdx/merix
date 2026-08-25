"""MatchNote model: timestamped, author-attributed recruiter comments."""

import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from merix.models.base import Base, TimestampMixin, uuid_pk


class MatchNote(Base, TimestampMixin):
    """A recruiter comment on one match result, visible to the whole org.

    Notes are collaboration metadata only: they never affect scoring, and
    they cascade-delete with their match result.
    """

    __tablename__ = "match_notes"

    id: Mapped[uuid.UUID] = uuid_pk()
    # Denormalised tenant key so RLS policies need no joins.
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    match_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("match_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # SET NULL keeps the discussion if the author's account is removed;
    # attribution degrades gracefully ("former member").
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    body: Mapped[str] = mapped_column(Text, nullable=False)
