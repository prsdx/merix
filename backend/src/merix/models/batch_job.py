"""BatchJob model — tracks batch match job lifecycle."""

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from merix.models.base import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from merix.models.job import JobDescription


class BatchJob(Base, TimestampMixin):
    """Tracks the lifecycle of a batch match job.

    Created when a client initiates batch match for a job description.
    The actual match work is done asynchronously via BackgroundTasks;
    this table tracks status and per-resume results in a JSONB column.
    """

    __tablename__ = "batch_jobs"

    id: Mapped[uuid.UUID] = uuid_pk()

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    job_description_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_descriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Lifecycle: queued → running → completed | failed
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued")

    # Optional client-supplied key for idempotent submission.
    idempotency_key: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), unique=True, nullable=True)

    total_resumes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_resumes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # JSONB array of per-resume disposition:
    # [{"resume_id": "uuid", "status": "completed"|"failed", "error": null|"msg"}]
    batch_results: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    job_description: Mapped["JobDescription"] = relationship()
