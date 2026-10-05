"""Sending the application (was submission-service.ts).

Two things happen here that can happen nowhere else. The whole form is checked
at once — a job is never created from answers that would not pass. And the job
row is written with the server's own authority, because enqueueing costs money:
a client that could insert one could bill this product at will.
"""

from __future__ import annotations

import logging

from app import rules
from app.db import Database
from app.deps import Session
from app.errors import ApiError, ValidationFailure
from app.services.values import as_uuid, now_ms

logger = logging.getLogger(__name__)


async def submit(application_id: str, session: Session, db: Database) -> None:
    caller = await session.require()
    key = as_uuid(application_id)
    if key is None:
        raise ApiError("errors.notFound.title", 404)

    try:
        async with db.as_user(caller) as connection:
            application = await connection.fetchrow(
                """select id::text, answers, residence_area, destination, purpose, employment,
                          submitted_job_id
                   from public.applications where id = $1::uuid""",
                key,
            )
            if application is None:
                raise ApiError("errors.notFound.title", 404)
            if application["submitted_job_id"] is not None:
                raise ApiError("intake.review.alreadySubmitted", 409)
            stored = application["answers"] or {}

            parsed = rules.parse_intake(stored, now=now_ms())
            if not parsed["ok"]:
                raise ValidationFailure(parsed["issues"])

            # An answer proposed from a document is the applicant's only once
            # they have confirmed it. Until then it is a placeholder.
            sources = await connection.fetch(
                """select path, source, confirmed_at::text from public.answer_sources
                   where application_id = $1::uuid""",
                key,
            )
            placeholders = rules.placeholder_issues(stored, [dict(row) for row in sources])
            if placeholders:
                raise ValidationFailure(placeholders)

            # What the checklist and the job read: only the answers that are asked.
            answers = rules.asked_answers(stored)
            uploads = [
                dict(row)
                for row in await connection.fetch(
                    """select id::text, document, page, status, content_type
                       from public.uploads where application_id = $1::uuid""",
                    key,
                )
            ]
            documents = rules.document_completeness(answers, uploads)
            if not documents["complete"]:
                raise ApiError(
                    "intake.review.documentsMissing", 422, missingDocuments=documents["missing"]
                )
            route = {
                "residenceArea": application["residence_area"],
                "destination": application["destination"],
                "purpose": application["purpose"],
                "employment": application["employment"],
            }
    except (ApiError, ValidationFailure):
        raise
    except Exception as error:
        logger.error("submit.read_failed", extra={"error": type(error).__name__})
        raise ApiError("intake.review.submitFailed", 502) from None

    contract = rules.contract()
    job_input = {
        "route": route,
        "intake": parsed["data"],
        # Which contract the intake was validated against.
        "intakeContract": {"version": contract["version"], "checksum": contract["checksum"]},
        # The documents by reference; never a storage path, which begins with
        # the owner's user id. The payload carries the work, not the account.
        "documents": rules.documents_for_job(answers, uploads),
    }
    try:
        async with db.as_service() as connection:
            # The job and the record of it land together: no job without the
            # application saying so, and no "submitted" without a job.
            job_id = await connection.fetchval(
                """insert into public.jobs
                     (user_id, task_type, executor_kind, idempotency_key, input,
                      deadline_seconds)
                   values ($1::uuid, 'produce_pack', 'hermes', $2, $3, 3600)
                   returning id::text""",
                caller.user_id,
                # One job per application, so a double press bills once.
                f"produce_pack:application:{key}",
                job_input,
            )
            # Nothing is half-typed any more, and the payload is frozen.
            await connection.execute(
                """update public.applications
                   set status = 'submitted', submitted_job_id = $2::uuid,
                       submitted_at = now(), draft_answers = '{}'::jsonb
                   where id = $1::uuid and submitted_job_id is null""",
                key,
                job_id,
            )
    except Exception as error:
        # 23505 on the idempotency key: a second press racing the first.
        if getattr(error, "sqlstate", None) == "23505":
            raise ApiError("intake.review.alreadySubmitted", 409) from None
        logger.error("submit.enqueue_failed", extra={"error": type(error).__name__})
        raise ApiError("intake.review.submitFailed", 502) from None
