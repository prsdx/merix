import uuid
from datetime import datetime

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


class AuditEventResponse(BaseModel):
    """Audit log entry visible to organization members."""

    id: uuid.UUID
    event_type: str
    actor_type: str
    actor_user_id: uuid.UUID | None = None
    resume_id: uuid.UUID | None = None
    event_metadata: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
