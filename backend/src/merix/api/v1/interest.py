"""Public interest-signup endpoint (no auth — pre-signup leads)."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from merix.core.rate_limit import INTEREST_RATE_LIMIT, limiter
from merix.dependencies import get_db
from merix.schemas.interest import InterestRequest, InterestResponse
from merix.services import interest as interest_service

router = APIRouter()


@router.post("", response_model=InterestResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(INTEREST_RATE_LIMIT)
async def submit_interest(
    request: Request,
    body: InterestRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Record a design-partner interest signup (email only)."""
    return await interest_service.submit(db, body)
