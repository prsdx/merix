"""Database engine and session setup."""

import uuid
from collections.abc import AsyncGenerator

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from merix.config import settings

# Production uses SQLAlchemy's async queue pool: connections are established once
# and reused across requests, eliminating the TCP+TLS+asyncpg handshake that
# NullPool paid on every request (measured 3-6s on simple GETs against Supabase).
# pool_pre_ping guards against server-side idle disconnects.
#
# Development/tests keep NullPool: pytest-asyncio runs each test in a fresh event
# loop, and pooled asyncpg connections bound to a dead loop raise on reuse.
# RLS correctness is unaffected by pooling either way: SET ROLE merix_app applies
# for the life of every connection (the connect hook), and the org context GUC is
# transaction-local via set_config(..., true), re-applied by scoped_session's
# after_begin hook on every transaction regardless of which connection serves it.
if settings.ENVIRONMENT == "production":
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
    )
else:
    engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, poolclass=NullPool)


@event.listens_for(engine.sync_engine, "connect")
def _drop_superuser_role(dbapi_connection, _connection_record) -> None:
    """Downgrade every app connection to the non-superuser merix_app role.

    The Supabase `postgres` role is a superuser and BYPASSES row level
    security entirely; SET ROLE makes RLS actually bind. merix_app is NOLOGIN
    (entered only via SET ROLE), and NullPool discards connections on close,
    so the role change never leaks between requests. Alembic builds its own
    engine in migrations/env.py and is unaffected (migrations need postgres).
    """
    cursor = dbapi_connection.cursor()
    cursor.execute("SET ROLE merix_app")
    cursor.close()


AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Database session dependency (no tenant context; for auth lookups).

    Auth endpoints (signup, login) run before an org context exists.
    The organisations/users tables grant merix_app full access via RLS
    policies, so no org context is needed for these operations.
    """
    async with AsyncSessionLocal() as session:
        yield session


def scoped_session(org_id: uuid.UUID) -> AsyncSession:
    """Session that pins app.current_org_id at the start of every transaction.

    RLS policies read this GUC. set_config(..., true) is transaction-local, so
    the after_begin hook re-applies it after every commit — a request that
    commits several times stays scoped to the same org. When unset, policies
    fail closed (no rows visible).
    """
    session = AsyncSessionLocal()

    def _set_org_context(_session, _transaction, connection) -> None:
        connection.execute(
            text("SELECT set_config('app.current_org_id', :org_id, true)"),
            {"org_id": str(org_id)},
        )

    event.listen(session.sync_session, "after_begin", _set_org_context)
    return session
