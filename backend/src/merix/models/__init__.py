"""SQLAlchemy models."""

from merix.models.base import Base, TimestampMixin
from merix.models.job import EMBEDDING_DIM, JobDescription
from merix.models.match import MatchResult
from merix.models.resume import Resume

__all__ = [
    "Base",
    "TimestampMixin",
    "EMBEDDING_DIM",
    "JobDescription",
    "Resume",
    "MatchResult",
]

