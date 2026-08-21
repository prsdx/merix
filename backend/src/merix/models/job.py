"""JobDescription model."""

import uuid
from typing import TYPE_CHECKING, Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from merix.models.base import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from merix.models.match import MatchResult
    from merix.models.resume import Resume

# Embedding dimension for the confirmed default model (all-MiniLM-L6-v2).
EMBEDDING_DIM = 1536


class JobDescription(Base, TimestampMixin):
    """A job description that resumes are matched against."""

    __tablename__ = "job_descriptions"

    id: Mapped[uuid.UUID] = uuid_pk()
    # Multi-tenant-ready: nullable until auth/orgs land (later task), but the
    # column exists now so we never need a migration to add it.
    org_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Structured extraction output: required_skills, preferred_skills,
    # min_experience_years, education, etc.
    parsed: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    # Semantic embedding of the JD text (pgvector).
    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(EMBEDDING_DIM), nullable=True
    )

    resumes: Mapped[list["Resume"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )
    matches: Mapped[list["MatchResult"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )
