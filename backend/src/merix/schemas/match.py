"""Pydantic schemas for resume + match API."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    """A resume as returned by the API (PII-minimal)."""

    id: uuid.UUID
    job_id: uuid.UUID
    candidate_name: str | None = None
    original_filename: str
    parsed: dict | None = None
    consent_given: bool
    consent_timestamp: datetime | None = None
    retention_expires_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MatchedSkill(BaseModel):
    skill: str
    required: bool
    evidence: str = ""


class MissingSkill(BaseModel):
    skill: str
    required: bool = True


class MatchResponse(BaseModel):
    """An explainable match result."""

    id: uuid.UUID
    job_id: uuid.UUID
    resume_id: uuid.UUID
    candidate_name: str | None = None
    score: float
    matched_skills: list[MatchedSkill]
    missing_skills: list[MissingSkill]
    rationale: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}