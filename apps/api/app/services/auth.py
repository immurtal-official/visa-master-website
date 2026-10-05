"""Signing in and out (was apps/web/src/lib/services/auth-service.ts)."""

from __future__ import annotations

import logging
from typing import Any

from app import rules
from app.auth import Caller
from app.errors import ApiError, ValidationFailure
from app.supabase import Supabase

logger = logging.getLogger(__name__)


def _present(body: dict[str, Any], key: str) -> dict[str, Any]:
    """`{ [key]: body[key] }`, keeping an absent field absent."""
    return {key: body[key]} if key in body else {}


async def request_otp(body: dict[str, Any], supabase: Supabase) -> dict[str, str]:
    """Send a sign-in code."""
    parsed = rules.parse_email(body)
    if not parsed["ok"]:
        raise ValidationFailure(parsed["issues"])
    if not supabase.configured:
        raise ApiError("auth.notConfigured", 503)

    email = parsed["data"]["email"]
    reply = await supabase.send_otp(email)
    if not reply.ok:
        # Asking again too soon is the one failure worth naming precisely: it
        # resolves on its own, and the useful instruction is to wait.
        if reply.status == 429:
            raise ApiError("auth.otp.rateLimited", 429)
        raise ApiError("auth.otp.sendFailed", 502)
    return {"email": email}


SESSION_FIELDS = ("access_token", "refresh_token", "expires_in", "expires_at", "token_type")


async def verify_otp(body: dict[str, Any], supabase: Supabase) -> dict[str, Any]:
    """Check a code and hand back the session it opens.

    A native client keeps these tokens itself; the web's server stores them in
    its own session cookies and tells the browser only that it worked. The
    address is re-checked rather than trusted — on this step it is as much user
    input as the code is.
    """
    email = rules.parse_email(_present(body, "email"))
    if not email["ok"]:
        raise ValidationFailure(email["issues"])
    code = rules.parse_otp_code(_present(body, "code"))
    if not code["ok"]:
        raise ValidationFailure(code["issues"])
    if not supabase.configured:
        raise ApiError("auth.notConfigured", 503)

    reply = await supabase.verify_otp(email["data"]["email"], code["data"]["code"])
    if not reply.ok:
        # A wrong code and an expired one get the same message on purpose:
        # telling someone which it was tells an attacker the same thing. Being
        # unable to check at all is different.
        if reply.status == 429:
            raise ApiError("auth.otp.rateLimited", 429)
        if reply.status == 0 or reply.status >= 500:
            logger.error("auth.verify.unreachable", extra={"status": reply.status})
            raise ApiError("auth.otp.checkFailed", 502)
        raise ApiError("auth.otp.failed", 401)

    session = reply.body if isinstance(reply.body, dict) else {}
    if not session.get("access_token") or not session.get("refresh_token"):
        logger.error("auth.verify.no_session")
        raise ApiError("auth.otp.checkFailed", 502)
    return {"session": {field: session.get(field) for field in SESSION_FIELDS}}


async def sign_out(token: str | None, supabase: Supabase) -> None:
    """End the session. Only report success if it actually ended.

    No session is already signed out. A token the auth service no longer
    recognises belongs to a session that has already ended.
    """
    if token is None or not supabase.configured:
        return
    reply = await supabase.sign_out(token)
    if reply.ok or reply.status in (401, 403, 404):
        return
    logger.error("auth.signout.failed", extra={"status": reply.status})
    raise ApiError("auth.signOutFailed", 502)


def me(caller: Caller) -> dict[str, Any]:
    return {"userId": caller.user_id, "email": caller.email}
