"""Organisation model."""

import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from merix.models.base import Base, TimestampMixin, uuid_pk


class Organisation(Base, TimestampMixin):
    """A tenant. Every job/resume/match record belongs to exactly one org."""

    __tablename__ = "organisations"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(255), nullable=False)

