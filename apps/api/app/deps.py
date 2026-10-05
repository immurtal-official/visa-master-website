"""Request dependencies: the database, Supabase, the body, and who is calling.

Every route that acts for somebody resolves its caller through `Session`; a
route that never asks is public, and that has to be a deliberate act.
"""

from __future__ import annotations

import json
import uuid
from typing import Any

from fastapi import Header, Request

from app.auth import Caller, JwksCache, bearer_token, verify_access_token
from app.config import Settings
from app.db import Database
from app.errors import ApiError
from app.supabase import Supabase


def get_db(request: Request) -> Database:
    return request.app.state.db


def get_settings_dep(request: Request) -> Settings:
    return request.app.state.settings


def get_supabase(request: Request) -> Supabase:
    return request.app.state.supabase


async def json_body(request: Request) -> dict[str, Any]:
    """The JSON body as an object; anything else — none, malformed, an array — is `{}`.

    The services parse what they need with the shared rules, which name each
    missing or wrong field. Refusing a body here instead would answer with a
    status the rules never chose.
    """
    raw = await request.body()
    try:
        parsed = json.loads(raw) if raw else None
    except ValueError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _session_id(claims: dict[str, Any]) -> str | None:
    value = claims.get("session_id")
    if value is None:
        return None
    try:
        return str(uuid.UUID(str(value)))
    except ValueError:
        # A session id that is not one names no session that exists.
        raise ApiError("route.sessionExpired", 401) from None


class Session:
    """Who is calling, resolved when the service asks — not before.

    The services check what they can check without knowing who is asking (the
    request's own shape, a route the product does not serve) before they ask,
    so a malformed request is told what is malformed whether or not it carries
    a session, as it was when these services ran in Next.js.
    """

    def __init__(self, request: Request, authorization: str | None) -> None:
        self._request = request
        self._token = bearer_token(authorization)
        self._resolved: Caller | None = None

    @property
    def token(self) -> str | None:
        return self._token

    async def require(self) -> Caller:
        """The verified caller, or `401 route.sessionExpired`."""
        if self._resolved is not None:
            return self._resolved
        if self._token is None:
            raise ApiError("route.sessionExpired", 401)
        state = self._request.app.state
        settings: Settings = state.settings
        jwks: JwksCache = state.jwks
        caller = await verify_access_token(self._token, settings, jwks)
        db: Database = state.db
        if not await db.account_is_active(caller.user_id, _session_id(caller.claims)):
            raise ApiError("route.sessionExpired", 401)
        self._resolved = caller
        return caller

    async def optional(self) -> Caller | None:
        """The caller if the session is good; none, or one that is gone, is signed out."""
        if self._token is None:
            return None
        try:
            return await self.require()
        except ApiError as error:
            if error.status == 401:
                return None
            raise


def get_session(request: Request, authorization: str | None = Header(default=None)) -> Session:
    return Session(request, authorization)


async def require_caller(
    request: Request, authorization: str | None = Header(default=None)
) -> Caller:
    """For a route whose every answer depends on the caller."""
    return await Session(request, authorization).require()
