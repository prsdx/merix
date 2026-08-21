"""Unit tests for the PDF extraction service (validation + PII scrubbing)."""

import pymupdf
import pytest

from merix.core.exceptions import (
    FileTooLargeError,
    UnparseableFileError,
    UnsupportedFileTypeError,
)
from merix.services import extraction


def make_pdf(text: str) -> bytes:
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    data = doc.tobytes()
    doc.close()
    return data


def test_extract_text_happy_path():
    pdf = make_pdf("Jane Doe, Python developer with 5 years of experience in SQL.")
    out = extraction.extract_text_from_pdf(pdf)
    assert "Jane Doe" in out
    assert "Python" in out


def test_rejects_non_pdf():
    with pytest.raises(UnsupportedFileTypeError):
        extraction.extract_text_from_pdf(b"this is not a pdf at all")


def test_rejects_empty_file():
    with pytest.raises(UnparseableFileError):
        extraction.extract_text_from_pdf(b"")


def test_rejects_oversize():
    big = b"%PDF-" + b"0" * (extraction.MAX_FILE_BYTES + 1)
    with pytest.raises(FileTooLargeError):
        extraction.extract_text_from_pdf(big)


def test_rejects_corrupt_pdf():
    with pytest.raises(UnparseableFileError):
        extraction.extract_text_from_pdf(b"%PDF-corrupted-bytes-not-a-real-doc")


def test_rejects_image_only_scanned():
    # A PDF page with no text (below MIN_TEXT_CHARS) is treated as scanned.
    doc = pymupdf.open()
    doc.new_page()
    data = doc.tobytes()
    doc.close()
    with pytest.raises(UnparseableFileError):
        extraction.extract_text_from_pdf(data)


def test_scrub_pii_redacts_email_phone_url():
    text = "Contact jane@example.com or +91-9876543210. See https://linkedin.com/in/jane"
    out = extraction.scrub_pii(text)
    assert "jane@example.com" not in out
    assert "9876543210" not in out
    assert "linkedin.com" not in out