"""Pydantic schemas for batch job API."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class BatchJobCreate(BaseModel):
    """Request to create a batch match job."""

    idempotency_key: uuid.UUID | None = None


class BatchJobStatus(BaseModel):
    """Status snapshot of a batch job."""

    id: uuid.UUID
    org_id: uuid.UUID
    job_description_id: uuid.UUID
    status: str
    idempotency_key: uuid.UUID | None = None
    total_resumes: int
    completed_resumes: int
    batch_results: list[dict] | None = None
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BatchJobResult(BaseModel):
    """Wrapper for the batch results shortlist response."""

    job_id: uuid.UUID
    count: int
    results: list[dict]
