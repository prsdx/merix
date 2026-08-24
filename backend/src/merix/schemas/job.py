"""Pydantic schemas for job description API."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    """Request to create a job description."""

    title: str = Field(min_length=1, max_length=255)
    raw_text: str = Field(min_length=1, max_length=50_000)


class JobFromURLCreate(BaseModel):
    """Request to create a job description by fetching a posting URL."""

    url: str = Field(min_length=8, max_length=2_048)
    title: str | None = Field(default=None, min_length=1, max_length=255)  # derived from the page if omitted


class JobResponse(BaseModel):
    """A job description as returned by the API."""

    id: uuid.UUID
    title: str
    raw_text: str
    parsed: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JobSummaryResponse(BaseModel):
    """Summary of a job description including candidate and match counts."""

    id: uuid.UUID
    title: str
    created_at: datetime
    resume_count: int = 0
    match_count: int = 0
    parsed: dict | None = None
