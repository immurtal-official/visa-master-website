"""The intake, one answer at a time (was intake-service.ts).

Saving happens on the way out of every question rather than at the end,
because inside an in-app browser an interrupted session is the median one.
`save_draft` keeps the question actually in hand, unjudged, apart from the
answers and invisible to the whole-form check.
"""

from __future__ import annotations

import logging
from typing import Any

from app import rules
from app.db import Database, with_service_authority
from app.deps import Session
from app.errors import ApiError, ValidationFailure
from app.services.values import as_uuid, js_string, now_ms, utf16_prefix

logger = logging.getLogger(__name__)

NOT_FOUND = ApiError("errors.notFound.title", 404)

#: Long enough for the longest field, short enough that a client cannot grow
#: the row without bound by holding down a key.
MAX_DRAFT_LENGTH = 1000


def _resolve_question(section_id: str, question_id: str) -> dict[str, Any]:
    for section in rules.sections():
        if section["id"] == section_id and section["available"]:
            for question in section["questions"]:
                if question["id"] == question_id:
                    return question
    raise NOT_FOUND


def set_answer(answers: dict[str, Any], path: str, value: Any) -> None:
    """Write a value at a dot-path without disturbing the rest of the answers."""
    *keys, last = path.split(".")
    node = answers
    for key in keys:
        if not isinstance(node.get(key), dict):
            node[key] = {}
        node = node[key]
    node[last] = value


def _fields(body: dict[str, Any]) -> tuple[str, str, str]:
    return (
        js_string(body.get("sectionId")),
        js_string(body.get("questionId")),
        js_string(body.get("value")),
    )


async def _read_draft(connection: Any, application_id: str | None) -> Any:
    if application_id is None:
        return None
    return await connection.fetchrow(
        """select status, answers, draft_answers from public.applications
           where id = $1::uuid for update""",
        application_id,
    )


async def save_answer(
    application_id: str, body: dict[str, Any], session: Session, db: Database
) -> dict[str, Any]:
    section_id, question_id, value = _fields(body)
    question = _resolve_question(section_id, question_id)

    # The same rule the whole form uses, applied to one answer.
    parsed = rules.parse_question(question["path"], value, now=now_ms())
    if not parsed["ok"]:
        raise ValidationFailure(parsed["issues"])

    caller = await session.require()
    contract = rules.contract()
    key = as_uuid(application_id)
    try:
        async with db.as_user(caller) as connection:
            application = await _read_draft(connection, key)
            if application is None:
                raise NOT_FOUND
            # A sent application's answers are frozen in its job.
            if application["status"] != "draft":
                raise ApiError("intake.review.alreadySubmitted", 409)
            stored = application["answers"] or {}
            # A question the earlier answers have closed off is not there to answer.
            if not rules.find_asked_question(section_id, question_id, stored):
                raise NOT_FOUND

            answers = dict(stored)
            set_answer(answers, question["path"], parsed["data"])
            # The draft has served its purpose the moment the answer is confirmed.
            drafts = dict(application["draft_answers"] or {})
            drafts.pop(question["path"], None)
            # Decided on the answers including this one: it may open a branch.
            after = rules.next_question(section_id, question_id, answers)

            await connection.execute(
                """update public.applications
                   set answers = $2, draft_answers = $3, last_step = $4,
                       intake_version = $5, intake_checksum = $6
                   where id = $1::uuid""",
                key,
                answers,
                drafts,
                f"{after['sectionId']}/{after['questionId']}" if after else None,
                contract["version"],
                contract["checksum"],
            )
            # Typed by the applicant, which is its own confirmation, and which
            # replaces any proposal read off a document. On the server's
            # authority, in the same transaction: the answer and the row the
            # submission gate trusts about it land together or not at all.
            async with with_service_authority(connection):
                await connection.execute(
                    """insert into public.answer_sources
                         (application_id, user_id, path, source, document_field_id,
                          confirmed_at, intake_version)
                       values ($1::uuid, $2::uuid, $3, 'applicant', null, now(), $4)
                       on conflict (application_id, path) do update
                         set user_id = excluded.user_id, source = excluded.source,
                             document_field_id = null, confirmed_at = excluded.confirmed_at,
                             intake_version = excluded.intake_version""",
                    key,
                    caller.user_id,
                    question["path"],
                    contract["version"],
                )
    except ApiError:
        raise
    except Exception as error:
        logger.error("intake.save_failed", extra={"error": type(error).__name__})
        raise ApiError("intake.saveFailed", 502) from None
    return {"next": after}


async def save_draft(
    application_id: str, body: dict[str, Any], session: Session, db: Database
) -> None:
    """Keep what is being typed, without judging it: no validation, no
    normalising, and the resume point stays where it is."""
    section_id, question_id, value = _fields(body)
    value = utf16_prefix(value, MAX_DRAFT_LENGTH)
    question = _resolve_question(section_id, question_id)

    caller = await session.require()
    key = as_uuid(application_id)
    try:
        async with db.as_user(caller) as connection:
            application = await _read_draft(connection, key)
            if application is None:
                raise NOT_FOUND
            # Once sent there is nothing left to be in the middle of typing.
            if application["status"] != "draft":
                raise NOT_FOUND
            if not rules.find_asked_question(section_id, question_id, application["answers"] or {}):
                raise NOT_FOUND

            drafts = dict(application["draft_answers"] or {})
            # An empty box is the absence of a draft; keeping it would shadow
            # the saved answer when the page is read back.
            if value:
                drafts[question["path"]] = value
            else:
                drafts.pop(question["path"], None)
            await connection.execute(
                "update public.applications set draft_answers = $2 where id = $1::uuid",
                key,
                drafts,
            )
    except ApiError:
        raise
    except Exception as error:
        logger.error("intake.draft_failed", extra={"error": type(error).__name__})
        raise ApiError("intake.saveFailed", 502) from None
