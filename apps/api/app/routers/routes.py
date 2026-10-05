"""The route gate and the waiting list. Neither needs an account."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel

from app.db import Database
from app.deps import Session, get_db, get_session, json_body
from app.services import routes as service

router = APIRouter(tags=["routes"])


class RouteAnswers(BaseModel):
    residenceArea: str
    destination: str
    purpose: str
    employment: str


class Verdict(BaseModel):
    supported: bool
    reasons: list[str] | None = None


class RouteCheck(BaseModel):
    answers: RouteAnswers
    verdict: Verdict


@router.post("/route-checks", response_model=RouteCheck, response_model_exclude_none=True)
async def check(body: dict[str, Any] = Depends(json_body)) -> dict[str, Any]:
    """Whether a route is served, with every failing part as a reason key."""
    return service.check(body)


@router.post("/waitlist", status_code=204, response_class=Response)
async def join_waitlist(
    body: dict[str, Any] = Depends(json_body),
    session: Session = Depends(get_session),
    db: Database = Depends(get_db),
) -> Response:
    await service.join_waitlist(body, session, db)
    return Response(status_code=204)
