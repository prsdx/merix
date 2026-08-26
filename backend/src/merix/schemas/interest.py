"""Pydantic schemas for landing-page interest signups."""

from pydantic import BaseModel, EmailStr, Field


class InterestRequest(BaseModel):
    """One-field signup: email only.

    ``website`` is an invisible honeypot field — humans never fill it,
    bots do. Non-empty means we accept the request but store nothing.
    """

    email: EmailStr
    website: str = Field(default="", max_length=255)


class InterestResponse(BaseModel):
    status: str = "received"
