"""Signing in and out, and who is signed in."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel

from app.auth import Caller
from app.deps import Session, get_session, get_supabase, json_body, require_caller
from app.services import auth as service
from app.supabase import Supabase

router = APIRouter(tags=["auth"])


class OtpSent(BaseModel):
    email: str


class SessionTokens(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int | None = None
    expires_at: int | None = None
    token_type: str | None = None


class Verified(BaseModel):
    session: SessionTokens


class Me(BaseModel):
    userId: str
    email: str | None


@router.post("/auth/otp", response_model=OtpSent)
async def request_otp(
    body: dict[str, Any] = Depends(json_body), supabase: Supabase = Depends(get_supabase)
) -> dict[str, str]:
    """Email a sign-in code. 422 issues for a malformed address."""
    return await service.request_otp(body, supabase)


@router.post("/auth/verify", response_model=Verified)
async def verify_otp(
    body: dict[str, Any] = Depends(json_body), supabase: Supabase = Depends(get_supabase)
) -> dict[str, Any]:
    """Check a code; the body is the session it opens, for the client to keep."""
    return await service.verify_otp(body, supabase)


@router.post("/auth/signout", status_code=204, response_class=Response)
async def sign_out(
    session: Session = Depends(get_session), supabase: Supabase = Depends(get_supabase)
) -> Response:
    await service.sign_out(session.token, supabase)
    return Response(status_code=204)


@router.get("/me", response_model=Me)
async def me(caller: Caller = Depends(require_caller)) -> dict[str, Any]:
    return service.me(caller)
