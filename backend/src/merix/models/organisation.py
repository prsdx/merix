"""Organisation model."""

import uuid

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from merix.models.base import Base, TimestampMixin, uuid_pk


class Organisation(Base, TimestampMixin):
    """A tenant. Every job/resume/match record belongs to exactly one org."""

    __tablename__ = "organisations"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # DPDP: org-level configurable data-retention period. 90 days is the v1
    # default (matches PRD and campus-placement cycles; short enough to limit
    # erasure-request exposure under the India DPDP Act).
    retention_days: Mapped[int] = mapped_column(Integer, nullable=False, default=90)
