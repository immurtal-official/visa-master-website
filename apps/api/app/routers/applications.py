"""Applications, their answers, their documents, and sending them."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel

from app.config import Settings
from app.db import Database
from app.deps import Session, get_db, get_session, get_settings_dep, get_supabase, json_body
from app.services import applications, intake, submission, uploads
from app.supabase import Supabase

router = APIRouter(tags=["applications"])


class ApplicationSummary(BaseModel):
    id: str
    destination: str
    purpose: str
    status: str
    created_at: str


class ApplicationList(BaseModel):
    applications: list[ApplicationSummary]


class ApplicationDetail(ApplicationSummary):
    answers: dict[str, Any]
    draft_answers: dict[str, str]
    last_step: str | None
    submitted_job_id: str | None


class JobState(BaseModel):
    state: str


class AnswerSource(BaseModel):
    path: str
    source: str
    confirmed_at: str | None


class ApplicationView(BaseModel):
    application: ApplicationDetail
    job: JobState | None
    answerSources: list[AnswerSource]


class Created(BaseModel):
    id: str


class CreatedEnvelope(BaseModel):
    application: Created


class Position(BaseModel):
    sectionId: str
    questionId: str


class Saved(BaseModel):
    next: Position | None


class RequiredDocument(BaseModel):
    id: str
    necessity: str
    multiPage: bool


class Upload(BaseModel):
    id: str
    document: str
    page: int
    original_name: str | None
    status: str


class Completeness(BaseModel):
    missing: list[str]
    pending: list[str]
    complete: bool


class DocumentsView(BaseModel):
    applicationStatus: str
    required: list[RequiredDocument]
    uploads: list[Upload]
    completeness: Completeness


class Announced(BaseModel):
    uploadId: str
    storagePath: str


@router.get("/applications", response_model=ApplicationList)
async def list_mine(
    session: Session = Depends(get_session), db: Database = Depends(get_db)
) -> dict[str, Any]:
    return {"applications": await applications.list_mine(session, db)}


@router.post("/applications", status_code=201, response_model=CreatedEnvelope)
async def create(
    body: dict[str, Any] = Depends(json_body),
    session: Session = Depends(get_session),
    db: Database = Depends(get_db),
) -> dict[str, Any]:
    """Create a draft for a served route; 422 `route.unsupported.title` with reasons otherwise."""
    return {"application": await applications.create(body, session, db)}


@router.get("/applications/{application_id}", response_model=ApplicationView)
async def get(
    application_id: str, session: Session = Depends(get_session), db: Database = Depends(get_db)
) -> dict[str, Any]:
    return await applications.get(application_id, session, db)


@router.post("/applications/{application_id}/answers", response_model=Saved)
async def save_answer(
    application_id: str,
    body: dict[str, Any] = Depends(json_body),
    session: Session = Depends(get_session),
    db: Database = Depends(get_db),
) -> dict[str, Any]:
    """Validate and store one answer; the body says which question comes next."""
    return await intake.save_answer(application_id, body, session, db)


@router.post(
    "/applications/{application_id}/draft-answers", status_code=204, response_class=Response
)
async def save_draft(
    application_id: str,
    body: dict[str, Any] = Depends(json_body),
    session: Session = Depends(get_session),
    db: Database = Depends(get_db),
) -> Response:
    await intake.save_draft(application_id, body, session, db)
    return Response(status_code=204)


@router.post("/applications/{application_id}/submit", status_code=204, response_class=Response)
async def submit(
    application_id: str, session: Session = Depends(get_session), db: Database = Depends(get_db)
) -> Response:
    """Check the whole form and its documents, then enqueue the pack — once."""
    await submission.submit(application_id, session, db)
    return Response(status_code=204)


@router.get("/applications/{application_id}/documents", response_model=DocumentsView)
async def documents(
    application_id: str, session: Session = Depends(get_session), db: Database = Depends(get_db)
) -> dict[str, Any]:
    return await uploads.list_for_application(application_id, session, db)


@router.post("/applications/{application_id}/uploads", status_code=201, response_model=Announced)
async def announce(
    application_id: str,
    body: dict[str, Any] = Depends(json_body),
    session: Session = Depends(get_session),
    db: Database = Depends(get_db),
) -> dict[str, str]:
    """Announce an upload; the bytes then go straight to Storage at `storagePath`."""
    return await uploads.announce(application_id, body, session, db)


@router.post(
    "/applications/{application_id}/uploads/{upload_id}/confirm",
    status_code=204,
    response_class=Response,
)
async def confirm(
    application_id: str,
    upload_id: str,
    session: Session = Depends(get_session),
    db: Database = Depends(get_db),
    settings: Settings = Depends(get_settings_dep),
) -> Response:
    await uploads.confirm(application_id, upload_id, session, db, settings)
    return Response(status_code=204)


@router.delete(
    "/applications/{application_id}/uploads/{upload_id}", status_code=204, response_class=Response
)
async def remove(
    application_id: str,
    upload_id: str,
    session: Session = Depends(get_session),
    db: Database = Depends(get_db),
    supabase: Supabase = Depends(get_supabase),
) -> Response:
    await uploads.remove(application_id, upload_id, session, db, supabase)
    return Response(status_code=204)
