"""Link extraction, normalisation, and classification from resume PDFs.

Resumes carry high-value identity anchors (LinkedIn, GitHub, portfolios), but
``scrub_pii`` deliberately destroys URLs before the LLM call. This module runs
BEFORE that step so links survive as structured data in ``Resume.parsed`` while
the scrubbed text sent to the LLM stays PII-free.

Two extraction sources:
  1. PDF link annotations (page.get_links) — captures the real href even when
     the visible text differs (e.g. the word "GitHub" hyperlinked to a profile).
  2. The text layer — catches scheme-less forms recruiters actually write
     ("linkedin.com/in/jane", "github.com/user/repo").
"""

from __future__ import annotations

import logging
import re
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import pymupdf

from merix.services.extraction import MAX_FILE_BYTES

logger = logging.getLogger("merix.services.links")

# --- Tracking parameters stripped during normalisation ---
_TRACKING_PREFIXES = ("utm_",)
_TRACKING_PARAMS = {"fbclid", "gclid", "msclkid", "mc_cid", "mc_eid", "igshid", "ref_src", "ref_url"}

# --- Text-layer patterns ---
_SCHEMELESS_HOST = r"(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|org|net|io|dev|me|ai|co|app|tech|xyz|so|gg|us|uk)"
_TEXT_URL_RE = re.compile(rf"https?://\S+|www\.\S+|{_SCHEMELESS_HOST}(?:/\S*)?", re.IGNORECASE)

# Strip trailing sentence punctuation that regexes greedily swallow.
_TRAILING_PUNCT_RE = re.compile(r"[.,;:!?]+$")


# --- Host classification ---
_CLASSIFICATION: list[tuple[str, str]] = [
    ("linkedin.com", "linkedin"),
    ("github.com", "github"),
    ("gist.github.com", "github"),
    ("gitlab.com", "gitlab"),
    ("bitbucket.org", "bitbucket"),
    ("dribbble.com", "portfolio"),
    ("behance.net", "portfolio"),
    ("medium.com", "blog"),
    ("dev.to", "blog"),
    ("substack.com", "blog"),
]


def _strip_tracking(url: str) -> str:
    """Remove known click-tracking query parameters."""
    parts = urlparse(url)
    if not parts.query:
        return url
    kept = [
        (k, v)
        for k, v in parse_qsl(parts.query, keep_blank_values=True)
        if k.lower() not in _TRACKING_PARAMS and not k.lower().startswith(_TRACKING_PREFIXES)
    ]
    return urlunparse((parts.scheme, parts.netloc, parts.path, parts.params, urlencode(kept), parts.fragment))


def _trim_greedily(raw: str) -> str:
    """Trim trailing characters the regexes swallow from prose context."""
    out = raw.strip().strip("<>\"'")
    out = _TRAILING_PUNCT_RE.sub("", out)
    # Drop trailing ")" only when it closes prose around the URL, not when
    # the URL itself contains balanced parens (e.g. wikipedia paths).
    while out.endswith(")") and out.count(")") > out.count("("):
        out = out[:-1]
    return out.rstrip("/")


def normalize_link(raw: str) -> str | None:
    """Normalise a raw link string to a canonical https URL, or None if invalid.

    Adds a missing scheme, lowercases scheme/host, strips tracking params,
    trims swallowed trailing punctuation, and validates basic host shape.
    """
    candidate = _trim_greedily(raw)
    if not candidate:
        return None
    if not re.match(r"^https?://", candidate, re.IGNORECASE):
        candidate = "https://" + candidate.removeprefix("//")

    try:
        parts = urlparse(candidate)
    except ValueError:
        return None
    host = (parts.hostname or "").lower()
    # Require a plausible public host: dotted domain with alpha TLD.
    if "." not in host or not re.fullmatch(r"[a-z0-9.-]+", host):
        return None
    tld = host.rsplit(".", 1)[-1]
    if not tld.isalpha():
        return None

    cleaned = urlunparse(("https", host, parts.path or "/", "", parts.query, ""))
    return _strip_tracking(cleaned)


def classify_link(url: str) -> str:
    """Classify a normalised URL into a coarse type for recruiter UI."""
    host = (urlparse(url).hostname or "").lower()
    for suffix, kind in _CLASSIFICATION:
        if host == suffix or host.endswith("." + suffix):
            return kind
    return "other"


def _iter_raw_urls(doc: pymupdf.Document):
    """Yield raw URL strings from an OPEN document: annotations first, then
    each page's text layer. Never raises: link extraction must never fail
    an upload that already passed validation."""
    for page in doc:
        try:
            for link in page.get_links():
                uri = link.get("uri")
                if uri:
                    yield uri
            for match in _TEXT_URL_RE.finditer(page.get_text("text")):
                yield match.group(0)
        except Exception:
            logger.warning("link_extraction_page_failed", exc_info=True)


def _open_pdf_safely(data: bytes) -> pymupdf.Document | None:
    """Open a PDF for link scanning; returns None instead of raising."""
    try:
        return pymupdf.open(stream=data[:MAX_FILE_BYTES], filetype="pdf")
    except Exception:
        logger.warning("link_extraction_open_failed", exc_info=True)
        return None


def extract_raw_urls(data: bytes) -> list[str]:
    """Collect raw URL strings from PDF annotations and the text layer.

    Never raises: link extraction must never fail an upload that already
    passed validation. Returns [] on any internal error.
    """
    doc = _open_pdf_safely(data)
    if doc is None:
        return []
    try:
        return list(_iter_raw_urls(doc))
    finally:
        doc.close()


def collect_links_from_doc(doc: pymupdf.Document) -> list[dict[str, str]]:
    """Extract, normalise, dedupe, and classify links from an OPEN document.

    Companion to ``extraction.extract_resume_payload``'s single-pass parse:
    lets the upload path reuse the document it already opened instead of
    paying a second full PyMuPDF parse per file.
    """
    seen: set[str] = set()
    results: list[dict[str, str]] = []
    for raw in _iter_raw_urls(doc):
        normalized = normalize_link(raw)
        if normalized is None or normalized in seen:
            continue
        seen.add(normalized)
        results.append({"url": normalized, "type": classify_link(normalized)})
    return results


def collect_links(data: bytes) -> list[dict[str, str]]:
    """Extract, normalise, dedupe, and classify all links in a resume PDF.

    Returns a list of ``{"url": ..., "type": ...}`` dicts, annotation-first
    (annotation hrefs are the most authoritative), insertion order preserved.
    """
    doc = _open_pdf_safely(data)
    if doc is None:
        return []
    try:
        return collect_links_from_doc(doc)
    finally:
        doc.close()
