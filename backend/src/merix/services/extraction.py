"""Resume/JD text extraction service.

Primary format for v1 is PDF, extracted with PyMuPDF (fitz) — the standard,
fast, actively-maintained library used by established resume parsers.

Untrusted file uploads are a security surface, so all input is validated
(size, magic bytes, encryption, corruption, and image-only/scanned PDFs)
before any text is returned.
"""

import re

import pymupdf

from merix.core.exceptions import (
    FileTooLargeError,
    UnparseableFileError,
    UnsupportedFileTypeError,
)

# --- Limits (security + cost) ---
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB (confirmed with product owner)
# Cap extracted text sent onward (LLM token cost control, head+tail).
MAX_EXTRACTED_CHARS = 20_000
# Below this many chars of text, a PDF is treated as image-only/scanned.
MIN_TEXT_CHARS = 50
# Resumes are 1-5 pages; reject pathological documents before burning CPU.
MAX_PAGES = 100

_PDF_MAGIC = b"%PDF-"


def validate_pdf(data: bytes) -> None:
    """Validate raw file bytes are an acceptable PDF. Raises on rejection."""
    if not data:
        raise UnparseableFileError("Empty file.")
    if len(data) > MAX_FILE_BYTES:
        raise FileTooLargeError(MAX_FILE_BYTES)
    if not data.startswith(_PDF_MAGIC):
        raise UnsupportedFileTypeError("File is not a PDF (missing %PDF- header).")


def _truncate_head_tail(text: str, max_chars: int = MAX_EXTRACTED_CHARS) -> str:
    """Keep the head and tail of a long document (most resume signal is at the
    top; tail often has education/extras), dropping the middle."""
    if len(text) <= max_chars:
        return text
    half = max_chars // 2
    return text[:half] + "\n...\n" + text[-half:]


def extract_text_from_pdf(data: bytes) -> str:
    """Extract clean text from PDF bytes. Raises a domain error on rejection."""
    validate_pdf(data)

    try:
        doc = pymupdf.open(stream=data, filetype="pdf")
    except Exception as exc:  # corrupt / malformed
        raise UnparseableFileError(f"Could not open PDF: {exc}") from exc

    try:
        if doc.needs_pass or doc.is_encrypted:
            raise UnparseableFileError("PDF is encrypted/password-protected.")
        if doc.page_count > MAX_PAGES:
            raise UnparseableFileError(
                f"PDF has too many pages ({doc.page_count}; max {MAX_PAGES})."
            )

        pages = [page.get_text("text") for page in doc]
    finally:
        doc.close()

    text = "\n".join(pages)
    # Normalise whitespace but preserve line structure.
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    if len(text) < MIN_TEXT_CHARS:
        raise UnparseableFileError(
            "PDF has little or no extractable text (likely a scanned image). "
            "OCR is not supported in v1."
        )

    return _truncate_head_tail(text)


# --- Best-effort PII scrubbing (pre-LLM). ---
# NOTE: regex-based scrubbing is NOT DPDP-grade redaction. It catches common
# contact details but will miss some. A proper NER-based redactor is a later
# hardening task. This exists so we never send obvious PII to an LLM provider.
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
_PHONE_RE = re.compile(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,6}")
_URL_RE = re.compile(r"https?://\S+|www\.\S+")


def scrub_pii(text: str) -> str:
    """Best-effort removal of emails, phone numbers, and URLs before LLM calls."""
    text = _EMAIL_RE.sub("[email]", text)
    text = _URL_RE.sub("[url]", text)
    text = _PHONE_RE.sub("[phone]", text)
    return text

