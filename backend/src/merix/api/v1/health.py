"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health() -> dict[str, str]:
    """Liveness check."""
    return {"status": "ok", "service": "merix"}


@router.get("/ready")
async def ready() -> dict[str, str]:
    """Readiness check."""
    return {"status": "ready", "service": "merix"}
