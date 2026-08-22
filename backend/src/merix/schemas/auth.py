"""Pydantic schemas for authentication."""

import uuid

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """Register a new organisation and its first user."""

    org_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    """A GoTrue session (access token is the bearer credential)."""

    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int


class CurrentUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    org_id: uuid.UUID
    org_name: str
