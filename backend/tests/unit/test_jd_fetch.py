"""Unit tests for SSRF-guarded job-posting fetching."""

import httpx
import pytest

from merix.config import settings
from merix.core.exceptions import ValidationError
from merix.services import jd_fetch


async def _public_ok(host: str) -> None:
    """Stand-in for DNS resolution in unit tests (no network)."""


def _client(handler) -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=httpx.MockTransport(handler), follow_redirects=False)


# --- URL policy ---


def test_rejects_non_http_scheme():
    with pytest.raises(ValidationError):
        jd_fetch._validate_url("ftp://boards.greenhouse.io/job/1")


def test_rejects_disallowed_domain_by_default():
    assert settings.JD_FETCH_ALLOW_ANY_DOMAIN is False
    with pytest.raises(ValidationError):
        jd_fetch._validate_url("https://evil.example.com/posting/123")


def test_allows_known_board_domains():
    for url in [
        "https://boards.greenhouse.io/acme/jobs/123",
        "https://jobs.lever.co/acme/abc-def",
        "https://jobs.ashbyhq.com/acme/id",
    ]:
        assert jd_fetch._validate_url(url) == url


def test_subdomain_trick_is_not_allowed():
    # Suffix match must be boundary-aware: notgreenhouse.io != greenhouse.io
    with pytest.raises(ValidationError):
        jd_fetch._validate_url("https://notgreenhouse.io/job/1")


# --- fetch flow (DNS check stubbed out) ---


async def test_fetch_extracts_text_and_title(monkeypatch):
    monkeypatch.setattr(jd_fetch, "_assert_public_host", _public_ok)
    html = (
        "<html><head><title>Senior Python Engineer</title></head><body>"
        + "<p>We need a Python engineer with FastAPI experience.</p> " * 5
        + "</body></html>"
    )
    fetcher = jd_fetch.JDFetcher(client=_client(lambda request: httpx.Response(200, text=html)))
    got = await fetcher.fetch("https://boards.greenhouse.io/acme/jobs/1")
    assert "Python" in got["text"]
    assert got["title"] == "Senior Python Engineer"


async def test_fetch_follows_redirect_within_allowed_domains(monkeypatch):
    monkeypatch.setattr(jd_fetch, "_assert_public_host", _public_ok)

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "short.lever.co":
            return httpx.Response(302, headers={"location": "https://jobs.lever.co/acme/final"})
        body = "<html><body>" + "<p>Backend role working on distributed systems.</p> " * 5 + "</body></html>"
        return httpx.Response(200, text=body)

    fetcher = jd_fetch.JDFetcher(client=_client(handler))
    got = await fetcher.fetch("https://short.lever.co/x")
    assert "distributed systems" in got["text"]


async def test_fetch_rejects_redirect_to_disallowed_domain(monkeypatch):
    monkeypatch.setattr(jd_fetch, "_assert_public_host", _public_ok)

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(302, headers={"location": "https://evil.example.com/phish"})

    fetcher = jd_fetch.JDFetcher(client=_client(handler))
    with pytest.raises(ValidationError):
        await fetcher.fetch("https://jobs.lever.co/acme/redir")


async def test_fetch_rejects_http_error(monkeypatch):
    monkeypatch.setattr(jd_fetch, "_assert_public_host", _public_ok)
    fetcher = jd_fetch.JDFetcher(client=_client(lambda request: httpx.Response(404)))
    with pytest.raises(ValidationError):
        await fetcher.fetch("https://jobs.lever.co/acme/gone")


async def test_fetch_rejects_non_public_ip(monkeypatch):
    async def private_only(host: str) -> None:
        raise ValidationError(f"Host {host!r} resolves to non-public address(es): 127.0.0.1")

    monkeypatch.setattr(jd_fetch, "_assert_public_host", private_only)
    fetcher = jd_fetch.JDFetcher(client=_client(lambda request: httpx.Response(200, text="<html><body>hi</body></html>")))
    with pytest.raises(ValidationError):
        await fetcher.fetch("https://jobs.lever.co/acme/internal")
