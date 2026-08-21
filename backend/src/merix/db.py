"""Database engine and session setup."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from merix.config import settings

# NullPool: open a fresh connection per session and close on release.
# Correct for Supabase's pooler (which does the actual pooling) and avoids
# cross-event-loop connection reuse errors in tests.
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, poolclass=NullPool)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Database session dependency."""
    async with AsyncSessionLocal() as session:
        yield session