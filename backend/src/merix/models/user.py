"""User model (profile mapping a Supabase Auth identity to an organisation)."""

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from merix.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """An authenticated recruiter user.

    id is the Supabase Auth (auth.users) UUID — credentials are managed
    entirely by Supabase Auth; we store only the profile + org membership.
    Single role per user for v1 (PRD requires no RBAC).
    """

    __tablename__ = "users"

    # No default: the id always comes from Supabase Auth.
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organisations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
