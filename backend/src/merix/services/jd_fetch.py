"""JD-from-URL ingestion: fetch a job posting safely and extract its text.

SSRF posture (untrusted URLs are a server-side request-forgery surface):
  - http(s) schemes only
  - every hop's hostname is DNS-resolved and ALL resolved IPs must be public
    (loopback / private / link-local / reserved ranges are rejected)
  - redirects are followed manually (max 3) with re-validation per hop
  - 10s timeout, 1 MiB body cap

Domain policy: known career-board hosts are always allowed; any other domain
requires ``settings.JD_FETCH_ALLOW_ANY_DOMAIN``.
"""

from __future__ import annotations

import asyncio
import ipaddress
import logging
from urllib.parse import urljoin, urlparse

import httpx
import trafilatura

from merix.config import settings
from merix.core.exceptions import ValidationError

logger = logging.getLogger("merix.services.jd_fetch")

MAX_BODY_BYTES = 1_048_576  # 1 MiB
MAX_REDIRECTS = 3
FETCH_TIMEOUT_SECONDS = 10.0

# Career boards whose hosts may always be fetched.
BOARD_HOST_SUFFIXES = ("greenhouse.io", "lever.co", "ashbyhq.com")


def _host_allowed_by_policy(host: str) -> bool:
    host = host.lower()
    if settings.JD_FETCH_ALLOW_ANY_DOMAIN:
        return True
    return any(host == s or host.endswith("." + s) for s in BOARD_HOST_SUFFIXES)


def _validate_url(url: str) -> str:
    """Scheme + policy validation; returns the normalised URL."""
    parts = urlparse(url)
    if parts.scheme not in ("http", "https"):
        raise ValidationError(f"Unsupported URL scheme: {parts.scheme!r}")
    host = (parts.hostname or "").lower()
    if not host or "." not in host:
        raise ValidationError(f"Invalid URL host: {url!r}")
    if not _host_allowed_by_policy(host):
        raise ValidationError(
            "Domain not allowed for JD fetching. Use a supported career-board URL "
            f"({', '.join(BOARD_HOST_SUFFIXES)}) or enable JD_FETCH_ALLOW_ANY_DOMAIN."
        )
    return url


async def _assert_public_host(host: str) -> None:
    """DNS-resolve host and reject if ANY resolved address is non-public."""
    loop = asyncio.get_running_loop()
    try:
        infos = await loop.getaddrinfo(host, None)
    except OSError as exc:
        raise ValidationError(f"Could not resolve host {host!r}: {exc}") from exc
    addresses = []
    for info in infos:
        addr = ipaddress.ip_address(info[4][0])
        # Belt and braces: is_global plus explicit exclusion lists.
        safe = addr.is_global and not any(
            (
                addr.is_private,
                addr.is_loopback,
                addr.is_link_local,
                addr.is_multicast,
                addr.is_reserved,
                addr.is_unspecified,
            )
        )
        addresses.append((addr, safe))
    bad = [str(a) for a, ok in addresses if not ok]
    if bad:
        raise ValidationError(f"Host {host!r} resolves to non-public address(es): {', '.join(bad)}")
    if not addresses:
        raise ValidationError(f"Host {host!r} has no resolvable addresses")


def extract_posting(html: str, base_url: str) -> dict:
    """HTML -> plain text + title. Sync CPU work; call via asyncio.to_thread."""
    text = trafilatura.extract(html, include_comments=False, include_tables=True, url=base_url)
    title = None
    metadata = trafilatura.extract_metadata(html)
    if metadata is not None:
        title = metadata.title
    return {"text": (text or "").strip(), "title": (title or "").strip()}


class JDFetcher:
    """Fetches job postings with SSRF guards. Inject an httpx client in tests."""

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self._client = client

    async def _client_get(self, url: str) -> httpx.Response:
        if self._client is not None:
            return await self._client.get(url)
        async with httpx.AsyncClient(follow_redirects=False, timeout=FETCH_TIMEOUT_SECONDS) as client:
            return await client.get(url)

    async def fetch(self, url: str) -> dict:
        """Validate -> fetch (following redirects manually) -> extract text."""
        current = _validate_url(url)
        response: httpx.Response | None = None
        for _hop in range(MAX_REDIRECTS + 1):
            parts = urlparse(current)
            await _assert_public_host(parts.hostname or "")
            response = await self._client_get(current)
            if response.is_redirect:
                location = response.headers.get("location", "")
                if not location:
                    break
                current = _validate_url(urljoin(current, location))
                continue
            break

        assert response is not None  # loop always runs at least once
        if response.status_code >= 400:
            raise ValidationError(f"Job posting fetch failed with HTTP {response.status_code}")
        declared_length = response.headers.get("content-length")
        if declared_length and int(declared_length) > MAX_BODY_BYTES:
            raise ValidationError("Job posting page exceeds the size cap.")
        if len(response.content) > MAX_BODY_BYTES:
            raise ValidationError("Job posting page exceeds the size cap.")

        extracted = await asyncio.to_thread(extract_posting, response.text, str(response.url))

        if len(extracted["text"]) < 50:
            raise ValidationError("Could not extract meaningful job-posting text from that URL.")
        return extracted


default_jd_fetcher = JDFetcher()
