"""Verifying a Supabase access token (ADR-005).

The API accepts Bearer tokens and nothing else. A token is a JWT signed by the
Supabase project's asymmetric key; the project's JWKS is fetched and cached in
the process, and every request is verified locally.

Three rules carry this module, as in nihao-pet/platform:

1. Only ES256 and RS256. A symmetric algorithm would let anyone who ever saw a
   shared secret mint tokens, and ``none`` needs no secret at all.
2. Every failure is the same failure — ``401 route.sessionExpired``, the key the
   web already shows for a session that is gone. Which check failed is logged,
   never returned.
3. A key rotation does not need a deploy: an unknown ``kid`` forces one
   refresh, at most once a minute.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any, NoReturn

import httpx
import jwt
from jwt import PyJWK

from app.config import Settings
from app.errors import ApiError

logger = logging.getLogger(__name__)

ALLOWED_ALGORITHMS = ("ES256", "RS256")
LEEWAY_SECONDS = 60


@dataclass(frozen=True, slots=True)
class Caller:
    """Who is calling, as far as a verified token says."""

    user_id: str
    email: str | None
    #: The verified claims, which user-scoped database work runs under.
    claims: dict[str, Any]
    #: The token itself, for calls to Supabase made on the caller's behalf.
    access_token: str


class JwksCache:
    """The project's signing keys, cached; injectable so tests need no network."""

    def __init__(
        self, settings: Settings, *, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self._settings = settings
        self._transport = transport
        self._keys: dict[str, dict[str, Any]] = {}
        self._fetched_at = 0.0
        self._last_forced_at = float("-inf")

    async def get_key(self, kid: str | None) -> dict[str, Any] | None:
        now = time.monotonic()
        if not self._keys or now - self._fetched_at >= self._settings.jwks_cache_seconds:
            await self._refresh(now)
        key = self._lookup(kid)
        if key is not None:
            return key
        if now - self._last_forced_at < self._settings.jwks_min_refresh_seconds:
            return None
        self._last_forced_at = now
        await self._refresh(now)
        return self._lookup(kid)

    def _lookup(self, kid: str | None) -> dict[str, Any] | None:
        if kid:
            return self._keys.get(kid)
        return next(iter(self._keys.values())) if len(self._keys) == 1 else None

    async def _refresh(self, now: float) -> None:
        # Availability over freshness: a stale cache keeps serving while the
        # JWKS endpoint is unreachable, since rotations are measured in hours.
        url = self._settings.jwks_url
        if not url:
            logger.error("auth.jwks.misconfigured")
            return
        try:
            async with httpx.AsyncClient(transport=self._transport, timeout=5.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                document = response.json()
        except Exception:
            logger.warning("auth.jwks.fetch_failed", extra={"cached_keys": len(self._keys)})
            return
        keys = {
            k["kid"]: k for k in document.get("keys", []) if isinstance(k, dict) and k.get("kid")
        }
        if keys:
            self._keys = keys
            self._fetched_at = now


def _reject(reason: str) -> NoReturn:
    logger.info("auth.verify_failed", extra={"reason": reason})
    raise ApiError("route.sessionExpired", 401)


async def verify_access_token(token: str, settings: Settings, jwks: JwksCache) -> Caller:
    try:
        header = jwt.get_unverified_header(token)
    except jwt.PyJWTError:
        _reject("malformed")

    algorithm = header.get("alg")
    if algorithm not in ALLOWED_ALGORITHMS:
        _reject(f"algorithm:{algorithm}")

    key = await jwks.get_key(header.get("kid"))
    if key is None:
        _reject("unknown_kid")

    try:
        claims = jwt.decode(
            token,
            PyJWK(key).key,
            algorithms=list(ALLOWED_ALGORITHMS),
            audience=settings.supabase_jwt_audience,
            issuer=settings.jwt_issuer,
            leeway=LEEWAY_SECONDS,
            options={"require": ["exp", "sub", "aud", "iss"]},
        )
    except jwt.PyJWTError as error:
        _reject(type(error).__name__)

    if claims.get("role") != "authenticated":
        _reject("role")

    return Caller(
        user_id=str(claims["sub"]),
        email=claims.get("email"),
        claims=claims,
        access_token=token,
    )


def bearer_token(authorization: str | None) -> str | None:
    """The token from an ``Authorization: Bearer`` header, or None if absent."""
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return None
    return token.strip()
