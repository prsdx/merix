"""FastAPI application factory."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import update

from merix.api.router import api_router
from merix.api.v1.health import router as health_router
from merix.config import settings
from merix.core.exceptions import (
    AuthenticationError,
    ConflictError,
    FileTooLargeError,
    MerixError,
    NotFoundError,
    PermissionError,
    UnparseableFileError,
    UnsupportedFileTypeError,
    ValidationError,
)
from merix.core.logging import configure_logging
from merix.core.rate_limit import limiter
from merix.db import AsyncSessionLocal
from merix.models.batch_job import BatchJob

logger = logging.getLogger("merix.main")


async def _cleanup_stale_batch_jobs() -> None:
    """Mark any running BatchJobs as failed on startup.

    If the server restarted or crashed, in-flight background tasks are
    dead and their BatchJobs are stuck as 'running'.  This startup hook
    finds those rows and marks them as failed so clients discover the
    outcome on the next poll.
    """
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                update(BatchJob)
                .where(BatchJob.status == "running")
                .values(
                    status="failed",
                    error_message="Server restarted — job was interrupted",
                )
            )
            await session.commit()
            if result.rowcount:
                logger.warning(
                    "startup_cleanup: marked %d stale batch job(s) as failed",
                    result.rowcount,
                )
    except Exception:
        logger.warning("startup_cleanup: could not reach database, skipping", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown logic."""
    configure_logging()
    await _cleanup_stale_batch_jobs()
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )
    _configure_cors(app)
    app.include_router(health_router, tags=["health"])
    app.include_router(api_router, prefix="/api")
    _register_exception_handlers(app)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    return app


def _configure_cors(app: FastAPI) -> None:
    """Configure CORS with env-configurable allowed origins."""
    origins = settings.ALLOWED_ORIGINS
    allow_origins = ["*"] if origins == "*" else [o.strip() for o in origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def _register_exception_handlers(app: FastAPI) -> None:
    """Map domain exceptions to clean HTTP responses."""

    @app.exception_handler(AuthenticationError)
    async def authentication_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
        return JSONResponse(
            status_code=401,
            content={"detail": str(exc)},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(FileTooLargeError)
    async def too_large_handler(request: Request, exc: FileTooLargeError) -> JSONResponse:
        return JSONResponse(status_code=413, content={"detail": str(exc)})

    @app.exception_handler(UnsupportedFileTypeError)
    async def unsupported_handler(request: Request, exc: UnsupportedFileTypeError) -> JSONResponse:
        return JSONResponse(status_code=415, content={"detail": str(exc)})

    @app.exception_handler(UnparseableFileError)
    async def unparseable_handler(request: Request, exc: UnparseableFileError) -> JSONResponse:
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(PermissionError)
    async def permission_handler(request: Request, exc: PermissionError) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": str(exc)})

    @app.exception_handler(ConflictError)
    async def conflict_handler(request: Request, exc: ConflictError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(ValidationError)
    async def validation_handler(request: Request, exc: ValidationError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(MerixError)
    async def merix_handler(request: Request, exc: MerixError) -> JSONResponse:
        return JSONResponse(status_code=500, content={"detail": "Internal error"})


app = create_app()
