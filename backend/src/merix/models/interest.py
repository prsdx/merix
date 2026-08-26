"""Interest signup model (pre-auth design-partner leads)."""

import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from merix.models.base import Base, TimestampMixin, uuid_pk


class InterestSignup(Base, TimestampMixin):
    """A pre-auth lead from the landing page's early-access form.

    Deliberately NOT org-scoped: submissions arrive before any account
    exists. The table is INSERT-only for the app role (see its migration),
    so leads are never readable through the API — only via the Supabase
    service role / dashboard.
    """

    __tablename__ = "interest_signups"

    id: Mapped[uuid.UUID] = uuid_pk()
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False, default="landing_page")
