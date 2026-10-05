"""The two Supabase services this API calls over HTTP: Auth and Storage.

Everything else is Postgres, directly (app/db.py). Auth is HTTP because sending
a sign-in code and opening a session are the auth service's own acts; Storage
is HTTP because deleting an object must remove its bytes, not only its row.

Calls made on a user's behalf carry that user's token, so Storage's policies
judge them as they judged the browser's own calls. The transport is injectable
so the tests reach neither service.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import Settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class Reply:
    """What a Supabase call came back with. `status` 0 means it never arrived."""

    status: int
    body: Any = None

    @property
    def ok(self) -> bool:
        return 200 <= self.status < 300


class Supabase:
    def __init__(
        self, settings: Settings, *, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self._settings = settings
        self._transport = transport

    @property
    def configured(self) -> bool:
        return self._settings.supabase_configured

    async def _call(
        self,
        method: str,
        path: str,
        *,
        json: Any = None,
        token: str | None = None,
        params: dict[str, str] | None = None,
    ) -> Reply:
        base = (self._settings.supabase_url or "").rstrip("/")
        headers = {"apikey": self._settings.supabase_publishable_key or ""}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        try:
            async with httpx.AsyncClient(transport=self._transport, timeout=10.0) as client:
                response = await client.request(
                    method, f"{base}{path}", json=json, headers=headers, params=params
                )
        except httpx.HTTPError as error:
            # Which call, never what it carried: an email or a code is personal.
            logger.warning("supabase.unreachable", extra={"path": path, "error": type(error)})
            return Reply(0)
        try:
            body = response.json() if response.content else None
        except ValueError:
            body = None
        return Reply(response.status_code, body)

    # --- Auth -------------------------------------------------------------

    async def send_otp(self, email: str) -> Reply:
        """Email a sign-in code. Signing up and signing in are the same act here."""
        return await self._call("POST", "/auth/v1/otp", json={"email": email, "create_user": True})

    async def verify_otp(self, email: str, code: str) -> Reply:
        """Check a code; on success the body is the new session."""
        return await self._call(
            "POST", "/auth/v1/verify", json={"type": "email", "email": email, "token": code}
        )

    async def sign_out(self, token: str) -> Reply:
        """End the session this token belongs to, and only that one."""
        return await self._call("POST", "/auth/v1/logout", token=token, params={"scope": "local"})

    # --- Storage ----------------------------------------------------------

    async def remove_object(self, bucket: str, path: str, token: str) -> Reply:
        """Delete one object as the caller; Storage's policies decide whether they may."""
        return await self._call(
            "DELETE", f"/storage/v1/object/{bucket}", json={"prefixes": [path]}, token=token
        )
