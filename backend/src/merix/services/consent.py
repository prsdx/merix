"""DPDP consent helpers."""

from datetime import UTC, datetime, timedelta

from merix.core.exceptions import ValidationError
from merix.models.organisation import Organisation
from merix.models.resume import Resume


def require_consent(consent_given: bool) -> None:
    """Reject the request if explicit consent was not provided."""
    if not consent_given:
        raise ValidationError(
            "Resume processing requires explicit candidate consent. "
            "Pass consent_given=true to confirm you have consent."
        )


def record_consent(resume: Resume, org: Organisation) -> None:
    """Stamp server-side consent metadata on a resume.

    The caller must already have validated consent_given=True. The timestamp is
    generated server-side to prevent client spoofing.
    """
    now = datetime.now(UTC)
    resume.consent_given = True
    resume.consent_timestamp = now
    resume.retention_expires_at = now + timedelta(days=org.retention_days)

