"""Applications: the drafts someone fills in (was application-service.ts).

Every query runs as the caller, so row-level security limits it to their rows —
there is deliberately no ownership filter here, because the policy is the check
and pgTAP asserts it.
"""

from __future__ import annotations

import logging
from typing import Any

from app import rules
from app.db import Database
from app.deps import Session
from app.errors import ApiError
from app.services import routes
from app.services.values import as_uuid

logger = logging.getLogger(__name__)

NOT_FOUND = ApiError("errors.notFound.title", 404)


def _iso(value: Any) -> Any:
    return value.isoformat() if hasattr(value, "isoformat") else value


async def list_mine(session: Session, db: Database) -> list[dict[str, Any]]:
    caller = await session.require()
    try:
        async with db.as_user(caller) as connection:
            rows = await connection.fetch(
                """select id::text, destination, purpose, status, created_at
                   from public.applications order by updated_at desc"""
            )
    except ApiError:
        raise
    except Exception as error:
        logger.error("applications.list_failed", extra={"error": type(error).__name__})
        raise ApiError("dashboard.loadFailed.title", 502) from None
    return [{**dict(row), "created_at": _iso(row["created_at"])} for row in rows]


async def get(application_id: str, session: Session, db: Database) -> dict[str, Any]:
    caller = await session.require()
    # Someone else's application is simply not there — the honest answer is
    # "no such thing", not "you may not". Nor is one whose id is not an id.
    key = as_uuid(application_id)
    if key is None:
        raise NOT_FOUND
    try:
        async with db.as_user(caller) as connection:
            application = await connection.fetchrow(
                """select id::text, destination, purpose, status, answers, draft_answers,
                          last_step, created_at, submitted_job_id::text
                   from public.applications where id = $1::uuid""",
                key,
            )
            if application is None:
                raise NOT_FOUND
            job = None
            if application["submitted_job_id"]:
                job = await connection.fetchrow(
                    "select state from public.jobs where id = $1::uuid",
                    application["submitted_job_id"],
                )
            sources = await connection.fetch(
                """select path, source, confirmed_at from public.answer_sources
                   where application_id = $1::uuid""",
                key,
            )
    except ApiError:
        raise
    except Exception as error:
        logger.error("applications.get_failed", extra={"error": type(error).__name__})
        raise ApiError("dashboard.loadFailed.title", 502) from None

    detail = dict(application)
    detail["created_at"] = _iso(detail["created_at"])
    detail["answers"] = detail["answers"] or {}
    detail["draft_answers"] = detail["draft_answers"] or {}
    return {
        "application": detail,
        "job": {"state": job["state"]} if job else None,
        "answerSources": [
            {**dict(row), "confirmed_at": _iso(row["confirmed_at"])} for row in sources
        ],
    }


async def create(body: dict[str, Any], session: Session, db: Database) -> dict[str, str]:
    """Create the draft. The gate runs again here rather than trusting whatever
    form said it passed — the answers travelled through a client, and this is
    the step that writes something."""
    answers = routes.parse(body)
    verdict = rules.check_route(answers)
    if not verdict["supported"]:
        raise ApiError("route.unsupported.title", 422, reasons=verdict["reasons"])

    caller = await session.require()
    contract = rules.contract()
    try:
        async with db.as_user(caller) as connection:
            created = await connection.fetchval(
                """insert into public.applications
                     (user_id, residence_area, destination, purpose, employment,
                      intake_version, intake_checksum)
                   values ($1::uuid, $2, $3, $4, $5, $6, $7)
                   returning id::text""",
                caller.user_id,
                answers["residenceArea"],
                answers["destination"],
                answers["purpose"],
                answers["employment"],
                contract["version"],
                contract["checksum"],
            )
    except ApiError:
        raise
    except Exception as error:
        logger.error("applications.create_failed", extra={"error": type(error).__name__})
        raise ApiError("route.createFailed", 502) from None
    return {"id": created}
