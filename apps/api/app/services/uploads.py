"""The applicant's own documents (was upload-service.ts).

Nothing counts as uploaded on a client's word. A row is announced before the
bytes move, the bytes go straight to Storage under the owner's prefix, and only
after this service has found the object does the row say `stored` — a column no
client can write, by grant.
"""

from __future__ import annotations

import logging
import math
import uuid
from typing import Any

from app import rules
from app.config import Settings
from app.db import Database, with_service_authority
from app.deps import Session
from app.errors import ApiError
from app.services.values import as_uuid, js_number, js_string
from app.supabase import Supabase

logger = logging.getLogger(__name__)

BUCKET = "uploads"
ACCEPTED_TYPES = {"image/jpeg", "image/png", "image/heic", "image/heif", "application/pdf"}


def _extension(file_name: str) -> str:
    return file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "bin"


async def list_for_application(
    application_id: str, session: Session, db: Database
) -> dict[str, Any]:
    """Everything the checklist needs, computed from the rules and the rows."""
    caller = await session.require()
    key = as_uuid(application_id)
    if key is None:
        raise ApiError("errors.notFound.title", 404)
    try:
        async with db.as_user(caller) as connection:
            application = await connection.fetchrow(
                "select answers, status from public.applications where id = $1::uuid", key
            )
            if application is None:
                raise ApiError("errors.notFound.title", 404)
            rows = await connection.fetch(
                """select id::text, document, page, original_name, status
                   from public.uploads where application_id = $1::uuid order by page""",
                key,
            )
    except ApiError:
        raise
    except Exception as error:
        logger.error("uploads.list_failed", extra={"error": type(error).__name__})
        raise ApiError("dashboard.loadFailed.title", 502) from None

    # Only what is asked decides the checklist.
    answers = rules.asked_answers(application["answers"] or {})
    uploads = [dict(row) for row in rows]
    return {
        "applicationStatus": application["status"],
        "required": [
            {"id": d["id"], "necessity": d["necessity"], "multiPage": d["multiPage"]}
            for d in rules.documents_for(answers)
        ],
        "uploads": uploads,
        "completeness": rules.document_completeness(answers, uploads),
    }


async def announce(
    application_id: str, body: dict[str, Any], session: Session, db: Database
) -> dict[str, str]:
    """Create the row and hand back where the bytes go. The path's first segment
    is the owner's user id — what the storage policies compare."""
    document = js_string(body.get("document"))
    file_name = js_string(body.get("fileName"))
    content_type = js_string(body.get("contentType"))
    page = js_number(body.get("page", 1))

    if content_type not in ACCEPTED_TYPES:
        raise ApiError("documents.wrongType", 422)

    caller = await session.require()
    key = as_uuid(application_id)
    if key is None or not math.isfinite(page) or not page.is_integer():
        # What the database refused when Next.js passed these through.
        raise ApiError("documents.uploadFailed", 502)

    upload_id = str(uuid.uuid4())
    storage_path = f"{caller.user_id}/{key}/{upload_id}.{_extension(file_name)}"
    try:
        async with db.as_user(caller) as connection:
            await connection.execute(
                """insert into public.uploads
                     (id, application_id, user_id, document, page, storage_path,
                      content_type, original_name)
                   values ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8)""",
                upload_id,
                key,
                caller.user_id,
                document,
                int(page),
                storage_path,
                content_type,
                file_name,
            )
    except ApiError:
        raise
    except Exception as error:
        logger.error("uploads.announce_failed", extra={"error": type(error).__name__})
        raise ApiError("documents.uploadFailed", 502) from None
    return {"uploadId": upload_id, "storagePath": storage_path}


async def confirm(
    application_id: str,
    upload_id: str,
    session: Session,
    db: Database,
    settings: Settings,
) -> None:
    """Confirm an announced upload really arrived: the object is looked up in
    Storage, as the caller — the browser saying the transfer finished is a
    claim, not a fact."""
    caller = await session.require()
    app_key, upload_key = as_uuid(application_id), as_uuid(upload_id)
    if app_key is None or upload_key is None:
        raise ApiError("documents.confirmFailed", 404)
    try:
        async with db.as_user(caller) as connection:
            upload = await connection.fetchrow(
                """select id::text, storage_path, application_id::text, document, page,
                          content_type
                   from public.uploads where id = $1::uuid""",
                upload_key,
            )
            if upload is None or upload["application_id"] != app_key:
                raise ApiError("documents.confirmFailed", 404)
            # Storage's own record of the object, read under Storage's own
            # policies: the caller sees only objects under their own prefix.
            stored = await connection.fetchrow(
                """select metadata from storage.objects
                   where bucket_id = $1 and name = $2""",
                BUCKET,
                upload["storage_path"],
            )
            if stored is None:
                logger.error("uploads.confirm.object_missing", extra={"upload": upload_key})
                raise ApiError("documents.confirmFailed", 409)
            size = (stored["metadata"] or {}).get("size")
            # `stored` is the server's word, written with the server's authority.
            async with with_service_authority(connection):
                await connection.execute(
                    """update public.uploads set status = 'stored', size_bytes = $2
                       where id = $1::uuid""",
                    upload_key,
                    int(size) if isinstance(size, int | float) else None,
                )
    except ApiError:
        raise
    except Exception as error:
        logger.error("uploads.confirm_failed", extra={"error": type(error).__name__})
        raise ApiError("documents.confirmFailed", 502) from None

    await _enqueue_extraction(caller.user_id, dict(upload), db, settings)


async def _enqueue_extraction(
    user_id: str, upload: dict[str, Any], db: Database, settings: Settings
) -> None:
    """Ask for a confirmed document to be read, when extraction is on and the
    document can fill in answers.

    The job carries the document by reference and the answer paths it may fill
    — never a path or the account. Once per upload. A failure is logged and
    swallowed: reading is a convenience on top of an upload that has already
    succeeded, and the applicant can type every answer it would have proposed.
    """
    if not settings.extraction_on:
        return
    fields = rules.extractable_fields(upload["document"])
    if not fields:
        return
    job_input = {
        "documents": [
            {
                "uploadId": upload["id"],
                "document": upload["document"],
                "page": upload["page"],
                "contentType": upload["content_type"],
            }
        ],
        "fields": fields,
    }
    try:
        async with db.as_service() as connection:
            # Already asked for: a repeated confirmation is not a second reading.
            await connection.execute(
                """insert into public.jobs
                     (user_id, task_type, executor_kind, idempotency_key, input,
                      deadline_seconds)
                   values ($1::uuid, 'doc_field_extraction', 'llm_gateway', $2, $3, 300)
                   on conflict (idempotency_key) do nothing""",
                user_id,
                f"doc_field_extraction:upload:{upload['id']}",
                job_input,
            )
    except Exception as error:
        logger.error("uploads.extraction_enqueue_failed", extra={"error": type(error).__name__})


async def remove(
    application_id: str, upload_id: str, session: Session, db: Database, supabase: Supabase
) -> None:
    """Remove a document. The object goes first: a row without an object is a
    document the reader thinks they sent; an object without a row is a file
    nobody will ever delete, and this one holds a passport scan."""
    caller = await session.require()
    app_key, upload_key = as_uuid(application_id), as_uuid(upload_id)
    if app_key is None or upload_key is None:
        return
    async with db.as_user(caller) as connection:
        upload = await connection.fetchrow(
            """select storage_path, application_id::text from public.uploads
               where id = $1::uuid""",
            upload_key,
        )
    if upload is None or upload["application_id"] != app_key:
        return

    reply = await supabase.remove_object(BUCKET, upload["storage_path"], caller.access_token)
    if not reply.ok:
        logger.error("uploads.remove.object_failed", extra={"status": reply.status})
        raise ApiError("documents.confirmFailed", 502)

    async with db.as_user(caller) as connection:
        await connection.execute("delete from public.uploads where id = $1::uuid", upload_key)
