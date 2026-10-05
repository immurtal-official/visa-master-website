"""The route gate and the waiting list (was route-service.ts).

The gate itself is a rule in packages/core; this only parses what arrived and
applies it. An unsupported combination never creates an application.
"""

from __future__ import annotations

import logging
from typing import Any

from app import rules
from app.db import Database
from app.deps import Session
from app.errors import ApiError, ValidationFailure

logger = logging.getLogger(__name__)


def parse(body: dict[str, Any]) -> dict[str, str]:
    parsed = rules.parse_route_check(body)
    if not parsed["ok"]:
        raise ValidationFailure(parsed["issues"])
    return parsed["data"]


def check(body: dict[str, Any]) -> dict[str, Any]:
    answers = parse(body)
    return {"answers": answers, "verdict": rules.check_route(answers)}


async def join_waitlist(body: dict[str, Any], session: Session, db: Database) -> None:
    """Record that someone needed a route we do not serve.

    Signing in is not required to be counted, and the list cannot be read back
    by anyone — the signed-out insert runs as `anon`, under its grant alone.
    """
    answers = parse(body)
    caller = await session.optional()
    insert = """
        insert into public.waitlist_entries
          (user_id, residence_area, destination, purpose, employment)
        values ($1::uuid, $2, $3, $4, $5)
    """
    values = (
        caller.user_id if caller else None,
        answers["residenceArea"],
        answers["destination"],
        answers["purpose"],
        answers["employment"],
    )
    try:
        scope = db.as_user(caller) if caller else db.as_anonymous()
        async with scope as connection:
            await connection.execute(insert, *values)
    except ApiError:
        raise
    except Exception as error:
        logger.error("waitlist.insert_failed", extra={"error": type(error).__name__})
        raise ApiError("route.waitlistFailed", 502) from None
