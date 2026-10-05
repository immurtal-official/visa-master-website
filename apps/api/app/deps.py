"""Request dependencies: the database, and who is calling.

Every route that acts for somebody depends on `require_caller`; a route with no
caller dependency is public, and that has to be a deliberate act.
"""

from __future__ import annotations

from fastapi import Header, Request

from app.auth import Caller, JwksCache, bearer_token, verify_access_token
from app.config import Settings
from app.db import Database
from app.errors import ApiError


def get_db(request: Request) -> Database:
    return request.app.state.db


def get_settings_dep(request: Request) -> Settings:
    return request.app.state.settings


async def _caller_from(request: Request, authorization: str | None) -> Caller | None:
    token = bearer_token(authorization)
    if token is None:
        return None
    settings: Settings = request.app.state.settings
    jwks: JwksCache = request.app.state.jwks
    caller = await verify_access_token(token, settings, jwks)
    db: Database = request.app.state.db
    if not await db.account_is_active(caller.user_id):
        raise ApiError("route.sessionExpired", 401)
    return caller


async def require_caller(
    request: Request, authorization: str | None = Header(default=None)
) -> Caller:
    """The verified caller, or 401 — the key the web shows for a session that is gone."""
    caller = await _caller_from(request, authorization)
    if caller is None:
        raise ApiError("route.sessionExpired", 401)
    return caller


async def optional_caller(
    request: Request, authorization: str | None = Header(default=None)
) -> Caller | None:
    """The verified caller if there is one; signed out is a state, not a failure."""
    if bearer_token(authorization) is None:
        return None
    return await _caller_from(request, authorization)
