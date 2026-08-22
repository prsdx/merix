"""Health check endpoints."""

import logging
from typing import Any

from fastapi import APIRouter
from sqlalchemy import text

from merix.db import AsyncSessionLocal

logger = logging.getLogger("merix.api.health")
router = APIRouter()


@router.get("/health")
async def health() -> dict[str, Any]:
    """Liveness & database readiness check."""
    db_status = "ok"
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception as exc:
        logger.warning("health_check_db_failed: %s", exc)
        db_status = "unreachable"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "service": "merix",
        "database": db_status,
    }


@router.get("/ready")
async def ready() -> dict[str, str]:
    """Readiness check."""
    return {"status": "ready", "service": "merix"}
