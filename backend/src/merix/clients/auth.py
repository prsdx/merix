"""Supabase Auth (GoTrue) client: user creation and login.

Credentials are owned entirely by Supabase Auth — we never see or store
password hashes. Plain httpx against GoTrue's REST API rather than the
supabase-py SDK: we need only two endpoints and httpx is already a dependency.
"""

from typing import Any

import httpx


class AuthClientError(Exception):
    """GoTrue rejected the request (carries its HTTP status code)."""

    def __init__(self, message: str, status_code: int) -> None:
        super().__init__(message)
        self.status_code = status_code


class SupabaseAuthClient:
    """Minimal GoTrue client for the two flows Merix needs."""

    def __init__(self, base_url: str, service_key: str) -> None:
        self._base_url = base_url.rstrip("/") + "/auth/v1"
        self._headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        }

    async def create_user(self, email: str, password: str) -> str:
        """Create a pre-confirmed auth user (admin API); return its UUID."""
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.post(
                f"{self._base_url}/admin/users",
                headers=self._headers,
                json={"email": email, "password": password, "email_confirm": True},
            )
        if resp.status_code >= 400:
            raise AuthClientError(_error_message(resp), resp.status_code)
        return resp.json()["id"]

    async def delete_user(self, user_id: str) -> None:
        """Best-effort cleanup (e.g. after a rolled-back signup)."""
        async with httpx.AsyncClient(timeout=10) as http:
            await http.delete(
                f"{self._base_url}/admin/users/{user_id}", headers=self._headers
            )

    async def login(self, email: str, password: str) -> dict[str, Any]:
        """Password grant; returns GoTrue's token payload (access + refresh)."""
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.post(
                f"{self._base_url}/token?grant_type=password",
                headers=self._headers,
                json={"email": email, "password": password},
            )
        if resp.status_code >= 400:
            raise AuthClientError(_error_message(resp), resp.status_code)
        return resp.json()


def _error_message(resp: httpx.Response) -> str:
    try:
        body = resp.json()
        return (
            body.get("msg")
            or body.get("error_description")
            or body.get("error")
            or resp.text
        )
    except ValueError:
        return resp.text
