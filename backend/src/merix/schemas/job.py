"""Pydantic schemas for job description API."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    """Request to create a job description."""

    title: str = Field(min_length=1, max_length=255)
    raw_text: str = Field(min_length=1, max_length=50_000)


class JobResponse(BaseModel):
    """A job description as returned by the API."""

    id: uuid.UUID
    title: str
    raw_text: str
    parsed: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
