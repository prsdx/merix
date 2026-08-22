"""Resume model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from merix.models.base import Base, TimestampMixin, uuid_pk
from merix.models.job import EMBEDDING_DIM

if TYPE_CHECKING:
    from merix.models.job import JobDescription
    from merix.models.match import MatchResult


class Resume(Base, TimestampMixin):
    """A candidate resume uploaded against a specific job."""

    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = uuid_pk()
    # Denormalised tenant key so RLS policies need no joins.
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_descriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    candidate_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    file_url: Mapped[str | None] = mapped_column(Text, nullable=True)  # storage path/URL
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Structured extraction output: skills[], experience_years, education, evidence{}.
    parsed: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    # Semantic embedding of the resume text (pgvector).
    embedding: Mapped[list[float] | None] = mapped_column(Vector(EMBEDDING_DIM), nullable=True)

    # --- DPDP-relevant fields (schema now; workflow built in a later task) ---
    consent_given: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    consent_timestamp: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    retention_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    job: Mapped["JobDescription"] = relationship(back_populates="resumes")
    matches: Mapped[list["MatchResult"]] = relationship(back_populates="resume", cascade="all, delete-orphan")
