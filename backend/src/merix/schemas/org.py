"""Pydantic schemas for organisation API."""

import uuid

from pydantic import BaseModel, Field


class OrgResponse(BaseModel):
    """Organisation details visible to its members."""

    id: uuid.UUID
    name: str
    retention_days: int

    model_config = {"from_attributes": True}


class OrgUpdate(BaseModel):
    """Update the org's DPDP retention policy."""

    retention_days: int = Field(
        ...,
        ge=1,
        le=3650,
        description="Number of days to retain resume data after consent is given.",
    )
