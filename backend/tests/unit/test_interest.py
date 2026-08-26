"""Unit tests for the interest-signup service (honeypot + upsert logic)."""

from unittest.mock import AsyncMock

import pytest
from pydantic import ValidationError

from merix.models.interest import InterestSignup
from merix.schemas.interest import InterestRequest
from merix.services import interest


def _body(email: str = "Priya@Example.COM ", website: str = "") -> InterestRequest:
    return InterestRequest(email=email, website=website)


async def test_email_is_normalised_and_inserted_when_new():
    db = AsyncMock()
    db.scalar.return_value = None  # no existing lead

    result = await interest.submit(db, _body("Priya@Example.COM "))

    assert result == {"status": "received"}
    added = db.add.call_args[0][0]
    assert isinstance(added, InterestSignup)
    assert added.email == "priya@example.com"
    db.commit.assert_awaited_once()


async def test_repeat_submission_updates_instead_of_duplicating():
    db = AsyncMock()
    existing = InterestSignup(email="priya@example.com")
    db.scalar.return_value = existing

    result = await interest.submit(db, _body("priya@example.com"))

    assert result == {"status": "received"}
    db.add.assert_not_called()
    db.commit.assert_awaited_once()


async def test_honeypot_hit_is_swallowed_without_touching_db():
    db = AsyncMock()

    result = await interest.submit(db, _body(website="http://spam.example"))

    assert result == {"status": "received"}
    db.scalar.assert_not_called()
    db.add.assert_not_called()
    db.commit.assert_not_called()


@pytest.mark.parametrize(
    ("bad_email", "reason"),
    [
        ("not-an-email", "missing @"),
        ("", "empty string"),
        ("a@b", "no TLD"),
        ("x" * 250 + "@example.com", "over 255 chars"),
    ],
)
def test_invalid_emails_rejected(bad_email: str, reason: str):
    with pytest.raises(ValidationError):
        InterestRequest(email=bad_email)


def test_honeypot_field_defaults_to_empty():
    body = InterestRequest(email="a@b.co")
    assert body.website == ""
