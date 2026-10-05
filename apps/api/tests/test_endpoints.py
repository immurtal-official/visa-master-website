"""Every /api/v1 endpoint, against a real Postgres with the migrations applied.

The database is real so that row-level security and the column grants are what
they will be in production: these tests would fail if a service ran a query as
the wrong role, wrote a column it has no grant on, or read another user's row.
Supabase Auth and Storage are doubles that record what was asked of them, and
tokens are signed with the test key the JWKS double serves.

Each test creates its own users and removes them, and everything they own,
afterwards. Skipped — never silently passed — without a database.
"""

from __future__ import annotations

import json
import os
import uuid
from collections.abc import AsyncIterator, Callable
from datetime import UTC, date, datetime, timedelta
from typing import Any

import httpx
import pytest

from app import rules
from app.auth import JwksCache
from app.config import Settings
from app.db import Database
from app.main import create_app
from app.supabase import Supabase
from tests.conftest import SUPABASE_URL

DSN = os.environ.get("TEST_DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:54322/postgres")

ROUTE_OK = {
    "residenceArea": "sichuan",
    "destination": "ES",
    "purpose": "tourism",
    "employment": "employed",
}


# --- doubles and fixtures ---------------------------------------------------


class SupabaseDouble:
    """Auth and Storage over HTTP, answered from a table and recorded."""

    def __init__(self) -> None:
        self.calls: list[dict[str, Any]] = []
        self.replies: dict[str, httpx.Response] = {}

    def reply(self, path: str, status: int, body: Any = None) -> None:
        self.replies[path] = httpx.Response(status, json=body)

    def handler(self, request: httpx.Request) -> httpx.Response:
        self.calls.append(
            {
                "method": request.method,
                "path": request.url.path,
                "params": dict(request.url.params),
                "authorization": request.headers.get("authorization"),
                "apikey": request.headers.get("apikey"),
                "json": json.loads(request.content) if request.content else None,
            }
        )
        return self.replies.get(request.url.path, httpx.Response(200, json={}))

    def to(self, path: str) -> list[dict[str, Any]]:
        return [call for call in self.calls if call["path"] == path]


@pytest.fixture
async def db() -> AsyncIterator[Database]:
    database = Database()
    await database.connect(Settings(_env_file=None, database_url=DSN))
    if not await database.ping():
        pytest.skip(f"no database at {DSN.split('@')[-1]} — start the local stack (pnpm db:start)")
    yield database
    await database.close()


@pytest.fixture
def supabase() -> SupabaseDouble:
    return SupabaseDouble()


@pytest.fixture
def api_settings() -> Settings:
    return Settings(
        _env_file=None,
        supabase_url=SUPABASE_URL,
        supabase_publishable_key="publishable-test-key",
        environment="test",
    )


@pytest.fixture
async def api(db, api_settings, jwks_transport, supabase) -> AsyncIterator[httpx.AsyncClient]:
    application = create_app(api_settings, database=db)
    application.state.jwks = JwksCache(api_settings, transport=jwks_transport)
    application.state.supabase = Supabase(
        api_settings, transport=httpx.MockTransport(supabase.handler)
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=application), base_url="http://api.test"
    ) as client:
        yield client


async def sql(db: Database, query: str, *args: Any) -> Any:
    """As the connecting role — fixtures only, as pgTAP sets up its own rows."""
    async with db._require_pool().acquire() as connection:
        return await connection.fetch(query, *args)


@pytest.fixture
async def person(db, make_token) -> AsyncIterator[Callable[..., Any]]:
    """Make users; each comes back as (user id, auth headers). Removed afterwards,
    with every job, object and row of theirs — and nobody else's."""
    made: list[str] = []

    async def make(**claims: Any) -> tuple[str, dict[str, str]]:
        user = str(uuid.uuid4())
        email = f"api-{user}@test.local"
        await sql(
            db,
            """insert into auth.users (id, email, instance_id)
               values ($1::uuid, $2, '00000000-0000-0000-0000-000000000000')""",
            user,
            email,
        )
        made.append(user)
        token = make_token(user, email=email, **claims)
        return user, {"Authorization": f"Bearer {token}"}

    yield make

    async with db._require_pool().acquire() as connection, connection.transaction():
        await connection.execute("set local storage.allow_delete_query = 'true'")
        await connection.execute(
            "delete from storage.objects"
            " where bucket_id = 'uploads' and owner_id = any($1::text[])",
            made,
        )
        # Applications point at their jobs, so they go first.
        await connection.execute(
            "delete from public.applications where user_id = any($1::uuid[])", made
        )
        await connection.execute("delete from public.jobs where user_id = any($1::uuid[])", made)
        await connection.execute(
            "delete from public.waitlist_entries where user_id = any($1::uuid[])", made
        )
        await connection.execute("delete from auth.users where id = any($1::uuid[])", made)


async def create_application(api: httpx.AsyncClient, headers: dict[str, str]) -> str:
    response = await api.post("/api/v1/applications", json=ROUTE_OK, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()["application"]["id"]


def iso(days: int) -> str:
    return (date.today() + timedelta(days=days)).isoformat()


def complete_answers() -> dict[str, Any]:
    return {
        "applicant": {
            "name": "陈静",
            "pinyin": "CHEN JING",
            "birthDate": "1990-05-01",
            "phone": "13800000000",
        },
        "passport": {"number": "E12345678", "issuedAt": "2020-01-01", "expiresAt": iso(900)},
        "residence": {"city": "成都", "address": "武侯区某路 1 号"},
        "employment": {
            "employer": "某公司",
            "position": "工程师",
            "startDate": "2018-03-01",
            "monthlyIncome": "12000",
        },
        "travel": {"departureDate": iso(60), "returnDate": iso(70), "cities": "马德里"},
        "companions": {"travellingWith": "alone", "whoPays": "self"},
        "history": {"schengenBefore": "no", "refused": "no"},
    }


async def store_documents(db: Database, application_id: str, user: str) -> None:
    """The mandatory documents, stored the way the server stores them."""
    needed = [
        d["id"] for d in rules.documents_for(complete_answers()) if d["necessity"] != "recommended"
    ]
    for document in needed:
        await sql(
            db,
            """insert into public.uploads
                 (application_id, user_id, document, storage_path, content_type, status)
               values ($1::uuid, $2::uuid, $3, $2 || '/' || $1 || '/' || $3 || '.jpg',
                       'image/jpeg', 'stored')""",
            application_id,
            user,
            document,
        )


SIGNED_OUT = {"error": {"key": "route.sessionExpired"}}


# --- auth -------------------------------------------------------------------


async def test_a_malformed_address_is_an_issue_and_reaches_no_one(api, supabase) -> None:
    response = await api.post("/api/v1/auth/otp", json={"email": "not-an-email"})
    assert response.status_code == 422
    assert response.json() == {"issues": [{"path": "email", "key": "validation.email.invalid"}]}
    assert supabase.calls == []


async def test_a_code_is_sent_for_the_trimmed_address(api, supabase) -> None:
    response = await api.post("/api/v1/auth/otp", json={"email": "  a@example.com "})
    assert (response.status_code, response.json()) == (200, {"email": "a@example.com"})
    [call] = supabase.to("/auth/v1/otp")
    assert call["json"] == {"email": "a@example.com", "create_user": True}
    assert call["apikey"] == "publishable-test-key"


@pytest.mark.parametrize(
    ("status", "key", "answered"),
    [(429, "auth.otp.rateLimited", 429), (500, "auth.otp.sendFailed", 502)],
)
async def test_a_code_that_could_not_be_sent_says_why(api, supabase, status, key, answered) -> None:
    supabase.reply("/auth/v1/otp", status, {"msg": "no"})
    response = await api.post("/api/v1/auth/otp", json={"email": "a@example.com"})
    assert (response.status_code, response.json()) == (answered, {"error": {"key": key}})


async def test_a_right_code_hands_back_the_session(api, supabase) -> None:
    supabase.reply(
        "/auth/v1/verify",
        200,
        {
            "access_token": "access",
            "refresh_token": "refresh",
            "expires_in": 3600,
            "expires_at": 1_900_000_000,
            "token_type": "bearer",
            "user": {"id": "someone", "email": "a@example.com"},
        },
    )
    response = await api.post(
        "/api/v1/auth/verify", json={"email": "a@example.com", "code": " 123 456 "}
    )
    assert response.status_code == 200
    # The session, and nothing else the auth service said.
    assert response.json() == {
        "session": {
            "access_token": "access",
            "refresh_token": "refresh",
            "expires_in": 3600,
            "expires_at": 1_900_000_000,
            "token_type": "bearer",
        }
    }
    [call] = supabase.to("/auth/v1/verify")
    assert call["json"] == {"type": "email", "email": "a@example.com", "token": "123456"}


@pytest.mark.parametrize(
    ("status", "answered", "key"),
    [
        (403, 401, "auth.otp.failed"),
        (429, 429, "auth.otp.rateLimited"),
        (503, 502, "auth.otp.checkFailed"),
    ],
)
async def test_a_code_that_does_not_open_a_session_says_which_kind(
    api, supabase, status, answered, key
) -> None:
    supabase.reply("/auth/v1/verify", status, {"msg": "no"})
    response = await api.post(
        "/api/v1/auth/verify", json={"email": "a@example.com", "code": "000000"}
    )
    assert (response.status_code, response.json()) == (answered, {"error": {"key": key}})


async def test_a_malformed_code_never_reaches_the_auth_service(api, supabase) -> None:
    response = await api.post("/api/v1/auth/verify", json={"email": "a@example.com", "code": "12"})
    assert response.status_code == 422
    assert response.json()["issues"][0]["key"] == "validation.otp.invalidFormat"
    missing = await api.post("/api/v1/auth/verify", json={})
    assert missing.json()["issues"] == [{"path": "email", "key": "validation.required"}]
    assert supabase.calls == []


async def test_signing_out_ends_that_session_only(api, supabase, person) -> None:
    _, headers = await person()
    response = await api.post("/api/v1/auth/signout", headers=headers)
    assert response.status_code == 204
    [call] = supabase.to("/auth/v1/logout")
    assert call["params"] == {"scope": "local"}
    assert call["authorization"] == headers["Authorization"]


async def test_signing_out_without_a_session_is_already_done(api, supabase) -> None:
    assert (await api.post("/api/v1/auth/signout")).status_code == 204
    assert supabase.calls == []


async def test_a_sign_out_that_did_not_happen_is_not_reported_as_one(api, supabase) -> None:
    supabase.reply("/auth/v1/logout", 500)
    response = await api.post("/api/v1/auth/signout", headers={"Authorization": "Bearer x"})
    assert (response.status_code, response.json()) == (
        502,
        {"error": {"key": "auth.signOutFailed"}},
    )


async def test_me_is_the_caller(api, person) -> None:
    user, headers = await person()
    response = await api.get("/api/v1/me", headers=headers)
    assert response.json() == {"userId": user, "email": f"api-{user}@test.local"}


async def test_a_token_from_a_signed_out_session_is_signed_out(api, db, person) -> None:
    session_id = str(uuid.uuid4())
    user, headers = await person(session_id=session_id)
    await sql(
        db,
        "insert into auth.sessions (id, user_id) values ($1::uuid, $2::uuid)",
        session_id,
        user,
    )
    assert (await api.get("/api/v1/me", headers=headers)).status_code == 200

    await sql(db, "delete from auth.sessions where id = $1::uuid", session_id)
    response = await api.get("/api/v1/me", headers=headers)
    assert (response.status_code, response.json()) == (401, SIGNED_OUT)


async def test_a_token_outliving_its_account_is_signed_out(api, db, person) -> None:
    user, headers = await person()
    await sql(db, "delete from auth.users where id = $1::uuid", user)
    response = await api.get("/api/v1/applications", headers=headers)
    assert (response.status_code, response.json()) == (401, SIGNED_OUT)


# --- the route gate and the waiting list ------------------------------------


async def test_the_gate_names_every_failing_part_without_an_account(api) -> None:
    supported = await api.post("/api/v1/route-checks", json=ROUTE_OK)
    assert supported.json() == {"answers": ROUTE_OK, "verdict": {"supported": True}}

    refused = await api.post(
        "/api/v1/route-checks", json={**ROUTE_OK, "destination": "FR", "employment": "student"}
    )
    assert refused.json()["verdict"] == {
        "supported": False,
        "reasons": ["route.unsupported.reason.destination", "route.unsupported.reason.employment"],
    }

    malformed = await api.post("/api/v1/route-checks", content=b"not json")
    assert malformed.status_code == 422
    assert {i["path"] for i in malformed.json()["issues"]} == set(ROUTE_OK)


async def test_the_waiting_list_counts_the_signed_out_and_the_signed_in(api, db, person) -> None:
    entry = {**ROUTE_OK, "destination": "FR"}
    assert (await api.post("/api/v1/waitlist", json=entry)).status_code == 204
    user, headers = await person()
    assert (await api.post("/api/v1/waitlist", json=entry, headers=headers)).status_code == 204
    # A session that has gone is counted as signed out, not refused.
    stale = {"Authorization": headers["Authorization"] + "x"}
    assert (await api.post("/api/v1/waitlist", json=entry, headers=stale)).status_code == 204

    mine = await sql(db, "select 1 from public.waitlist_entries where user_id = $1::uuid", user)
    assert len(mine) == 1


async def test_the_waiting_list_cannot_be_read_back(db) -> None:
    async with db.as_anonymous() as connection:
        with pytest.raises(Exception, match="permission denied"):
            await connection.fetch("select * from public.waitlist_entries")


# --- applications -----------------------------------------------------------


async def test_signed_out_reads_and_writes_refuse_with_one_key(api) -> None:
    for method, path in [
        ("GET", "/api/v1/me"),
        ("GET", "/api/v1/applications"),
        ("POST", "/api/v1/applications"),
        ("GET", f"/api/v1/applications/{uuid.uuid4()}"),
        ("POST", f"/api/v1/applications/{uuid.uuid4()}/submit"),
        ("GET", f"/api/v1/applications/{uuid.uuid4()}/documents"),
    ]:
        response = await api.request(method, path, json=ROUTE_OK)
        assert (response.status_code, response.json()) == (401, SIGNED_OUT), (method, path)


async def test_an_unserved_route_is_refused_before_anyone_is_asked_who_they_are(api) -> None:
    response = await api.post("/api/v1/applications", json={**ROUTE_OK, "purpose": "business"})
    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "key": "route.unsupported.title",
            "reasons": ["route.unsupported.reason.purpose"],
        }
    }


async def test_a_draft_records_the_contract_it_was_started_under(api, db, person) -> None:
    user, headers = await person()
    application = await create_application(api, headers)
    [row] = await sql(
        db,
        "select user_id::text, intake_version, intake_checksum from public.applications"
        " where id = $1::uuid",
        application,
    )
    contract = rules.contract()
    assert dict(row) == {
        "user_id": user,
        "intake_version": contract["version"],
        "intake_checksum": contract["checksum"],
    }


async def test_each_caller_sees_their_own_applications_and_no_one_elses(api, person) -> None:
    _, alice = await person()
    _, bob = await person()
    mine = await create_application(api, alice)
    theirs = await create_application(api, bob)

    listed = (await api.get("/api/v1/applications", headers=alice)).json()["applications"]
    assert [a["id"] for a in listed] == [mine]
    assert set(listed[0]) == {"id", "destination", "purpose", "status", "created_at"}

    for missing in (theirs, "not-an-id"):
        response = await api.get(f"/api/v1/applications/{missing}", headers=alice)
        assert (response.status_code, response.json()) == (
            404,
            {"error": {"key": "errors.notFound.title"}},
        )

    detail = (await api.get(f"/api/v1/applications/{mine}", headers=alice)).json()
    assert detail["job"] is None and detail["answerSources"] == []
    assert detail["application"]["answers"] == {} and detail["application"]["status"] == "draft"


# --- answers ----------------------------------------------------------------


async def test_an_answer_is_judged_stored_normalised_and_attributed(api, db, person) -> None:
    _, headers = await person()
    application = await create_application(api, headers)
    url = f"/api/v1/applications/{application}"

    bad = await api.post(
        f"{url}/answers",
        json={"sectionId": "applicant", "questionId": "pinyin", "value": "陈静"},
        headers=headers,
    )
    assert bad.status_code == 422
    assert bad.json() == {"issues": [{"path": "", "key": "validation.pinyin.invalid"}]}

    await api.post(
        f"{url}/draft-answers",
        json={"sectionId": "applicant", "questionId": "pinyin", "value": "chen j"},
        headers=headers,
    )
    good = await api.post(
        f"{url}/answers",
        json={"sectionId": "applicant", "questionId": "pinyin", "value": " chen jing "},
        headers=headers,
    )
    assert good.json() == {"next": {"sectionId": "applicant", "questionId": "birthDate"}}

    detail = (await api.get(url, headers=headers)).json()
    assert detail["application"]["answers"] == {"applicant": {"pinyin": "CHEN JING"}}
    # The confirmed answer took the draft's place.
    assert detail["application"]["draft_answers"] == {}
    assert detail["application"]["last_step"] == "applicant/birthDate"
    [source] = detail["answerSources"]
    assert source["path"] == "applicant.pinyin" and source["source"] == "applicant"
    assert source["confirmed_at"] is not None


async def test_a_typed_answer_replaces_a_proposal_read_off_a_document(api, db, person) -> None:
    user, headers = await person()
    application = await create_application(api, headers)
    await sql(
        db,
        """insert into public.answer_sources
             (application_id, user_id, path, source, confirmed_at, intake_version)
           values ($1::uuid, $2::uuid, 'passport.number', 'document', null, 1)""",
        application,
        user,
    )
    await api.post(
        f"/api/v1/applications/{application}/answers",
        json={"sectionId": "passport", "questionId": "number", "value": "e1234 5678"},
        headers=headers,
    )
    [row] = await sql(
        db,
        "select source, confirmed_at is not null as confirmed from public.answer_sources"
        " where application_id = $1::uuid",
        application,
    )
    assert dict(row) == {"source": "applicant", "confirmed": True}


async def test_a_question_that_does_not_exist_is_not_there(api, person) -> None:
    _, headers = await person()
    application = await create_application(api, headers)
    for body in (
        {"sectionId": "applicant", "questionId": "nope", "value": "x"},
        {"sectionId": "review", "questionId": "x", "value": "x"},
        {},
    ):
        for kind in ("answers", "draft-answers"):
            response = await api.post(
                f"/api/v1/applications/{application}/{kind}", json=body, headers=headers
            )
            assert response.status_code == 404, (kind, body)


async def test_someone_elses_application_takes_no_answers(api, person) -> None:
    _, alice = await person()
    _, bob = await person()
    theirs = await create_application(api, bob)
    response = await api.post(
        f"/api/v1/applications/{theirs}/answers",
        json={"sectionId": "applicant", "questionId": "name", "value": "陈静"},
        headers=alice,
    )
    assert response.status_code == 404


async def test_a_draft_is_kept_unjudged_bounded_and_cleared_when_empty(api, person) -> None:
    _, headers = await person()
    application = await create_application(api, headers)
    url = f"/api/v1/applications/{application}"
    question = {"sectionId": "applicant", "questionId": "name"}

    # Half an answer is kept as typed, however it would be judged.
    long = "长" * 999 + "😀"
    response = await api.post(
        f"{url}/draft-answers", json={**question, "value": long}, headers=headers
    )
    assert response.status_code == 204
    drafts = (await api.get(url, headers=headers)).json()["application"]["draft_answers"]
    # 1000 UTF-16 units, and never half of a character.
    assert drafts == {"applicant.name": "长" * 999}

    await api.post(f"{url}/draft-answers", json={**question, "value": ""}, headers=headers)
    drafts = (await api.get(url, headers=headers)).json()["application"]["draft_answers"]
    assert drafts == {}


# --- submission -------------------------------------------------------------


async def test_the_journey_create_answer_gate_submit_only_once(api, db, person) -> None:
    user, headers = await person()
    application = await create_application(api, headers)
    url = f"/api/v1/applications/{application}"

    early = await api.post(f"{url}/submit", headers=headers)
    assert early.status_code == 422
    assert len(early.json()["issues"]) > 3

    answers = complete_answers()
    await sql(
        db, "update public.applications set answers = $2 where id = $1::uuid", application, answers
    )
    no_documents = await api.post(f"{url}/submit", headers=headers)
    assert no_documents.status_code == 422
    assert no_documents.json()["error"]["key"] == "intake.review.documentsMissing"
    assert "passportBio" in no_documents.json()["error"]["missingDocuments"]

    await store_documents(db, application, user)
    assert (await api.post(f"{url}/submit", headers=headers)).status_code == 204

    again = await api.post(f"{url}/submit", headers=headers)
    assert (again.status_code, again.json()) == (
        409,
        {"error": {"key": "intake.review.alreadySubmitted"}},
    )
    late = await api.post(
        f"{url}/answers",
        json={"sectionId": "applicant", "questionId": "name", "value": "陈静"},
        headers=headers,
    )
    assert late.status_code == 409
    late_draft = await api.post(
        f"{url}/draft-answers",
        json={"sectionId": "applicant", "questionId": "name", "value": "陈"},
        headers=headers,
    )
    assert late_draft.status_code == 404

    [job] = await sql(
        db,
        "select id::text, state, input, idempotency_key from public.jobs where user_id = $1::uuid",
        user,
    )
    assert job["state"] == "queued"
    assert job["idempotency_key"] == f"produce_pack:application:{application}"
    detail = (await api.get(url, headers=headers)).json()
    assert detail["application"]["status"] == "submitted"
    assert detail["application"]["submitted_job_id"] == job["id"]
    assert detail["job"] == {"state": "queued"}

    # The payload carries the work, never the account.
    payload = job["input"]
    text = json.dumps(payload)
    assert user not in text and "@" not in text
    assert payload["route"] == ROUTE_OK
    assert payload["intake"] == rules.parse_intake(answers, now=_now())["data"]
    assert payload["intakeContract"] == rules.contract()
    assert [d["document"] for d in payload["documents"]][:2] == ["passportBio", "photo"]
    assert all(
        set(d) == {"uploadId", "document", "page", "contentType"} for d in payload["documents"]
    )


def _now() -> int:
    return int(datetime.now(UTC).timestamp() * 1000)


async def test_an_unconfirmed_proposal_holds_the_submission(api, db, person) -> None:
    user, headers = await person()
    application = await create_application(api, headers)
    await sql(
        db,
        "update public.applications set answers = $2 where id = $1::uuid",
        application,
        complete_answers(),
    )
    await store_documents(db, application, user)
    await sql(
        db,
        """insert into public.answer_sources
             (application_id, user_id, path, source, confirmed_at, intake_version)
           values ($1::uuid, $2::uuid, 'passport.number', 'document', null, 1)""",
        application,
        user,
    )
    response = await api.post(f"/api/v1/applications/{application}/submit", headers=headers)
    assert response.status_code == 422
    assert response.json() == {
        "issues": [{"path": "passport.number", "key": "validation.answer.unconfirmed"}]
    }
    assert await sql(db, "select 1 from public.jobs where user_id = $1::uuid", user) == []


# --- documents --------------------------------------------------------------


async def put_object(db: Database, user: str, path: str, size: int = 2048) -> None:
    """The object as Storage records it once the bytes have arrived."""
    await sql(
        db,
        """insert into storage.objects (bucket_id, name, owner_id, metadata)
           values ('uploads', $1, $2, $3)""",
        path,
        user,
        {"size": size, "mimetype": "image/jpeg"},
    )


async def test_an_upload_counts_only_once_storage_has_it(api, db, person) -> None:
    user, headers = await person()
    application = await create_application(api, headers)
    url = f"/api/v1/applications/{application}"

    wrong = await api.post(
        f"{url}/uploads",
        json={"document": "passportBio", "fileName": "a.gif", "contentType": "image/gif"},
        headers=headers,
    )
    assert (wrong.status_code, wrong.json()) == (422, {"error": {"key": "documents.wrongType"}})

    announced = await api.post(
        f"{url}/uploads",
        json={"document": "passportBio", "fileName": "Scan.JPG", "contentType": "image/jpeg"},
        headers=headers,
    )
    assert announced.status_code == 201
    upload, path = announced.json()["uploadId"], announced.json()["storagePath"]
    # Ownership is a prefix: the storage policies compare the first segment.
    assert path == f"{user}/{application}/{upload}.jpg"

    # The browser's word that the transfer finished is not enough.
    early = await api.post(f"{url}/uploads/{upload}/confirm", headers=headers)
    assert (early.status_code, early.json()) == (409, {"error": {"key": "documents.confirmFailed"}})

    await put_object(db, user, path)
    assert (await api.post(f"{url}/uploads/{upload}/confirm", headers=headers)).status_code == 204
    [row] = await sql(
        db, "select status, size_bytes from public.uploads where id = $1::uuid", upload
    )
    assert dict(row) == {"status": "stored", "size_bytes": 2048}

    view = (await api.get(f"{url}/documents", headers=headers)).json()
    assert view["applicationStatus"] == "draft"
    assert "passportBio" not in view["completeness"]["missing"]
    assert "sponsorProof" not in [d["id"] for d in view["required"]]
    assert view["uploads"] == [
        {
            "id": upload,
            "document": "passportBio",
            "page": 1,
            "original_name": "Scan.JPG",
            "status": "stored",
        }
    ]
    # Extraction is off unless switched on: no reading was asked for.
    assert await sql(db, "select 1 from public.jobs where user_id = $1::uuid", user) == []


async def test_a_client_cannot_mark_its_own_upload_stored(db, person) -> None:
    from tests.test_db_integration import caller

    user, _ = await person()
    [row] = await sql(
        db,
        """insert into public.applications (user_id, residence_area, destination)
           values ($1::uuid, 'sichuan', 'ES') returning id::text""",
        user,
    )
    with pytest.raises(Exception, match="permission denied"):
        async with db.as_user(caller(user)) as connection:
            await connection.execute(
                "update public.uploads set status = 'stored' where application_id = $1::uuid",
                row["id"],
            )


async def test_someone_elses_upload_cannot_be_confirmed_or_removed(api, db, person, supabase):
    bob_id, bob = await person()
    _, alice = await person()
    application = await create_application(api, bob)
    announced = (
        await api.post(
            f"/api/v1/applications/{application}/uploads",
            json={"document": "photo", "fileName": "p.png", "contentType": "image/png"},
            headers=bob,
        )
    ).json()
    await put_object(db, bob_id, announced["storagePath"])
    base = f"/api/v1/applications/{application}/uploads/{announced['uploadId']}"

    confirmed = await api.post(f"{base}/confirm", headers=alice)
    assert confirmed.status_code == 404
    assert (await api.delete(base, headers=alice)).status_code == 204
    assert supabase.to("/storage/v1/object/uploads") == []
    assert (
        len(
            await sql(db, "select 1 from public.uploads where id = $1::uuid", announced["uploadId"])
        )
        == 1
    )


async def test_removing_deletes_the_object_first_as_the_owner(api, db, person, supabase) -> None:
    _, headers = await person()
    application = await create_application(api, headers)
    announced = (
        await api.post(
            f"/api/v1/applications/{application}/uploads",
            json={"document": "photo", "fileName": "p.png", "contentType": "image/png"},
            headers=headers,
        )
    ).json()
    base = f"/api/v1/applications/{application}/uploads/{announced['uploadId']}"

    supabase.reply("/storage/v1/object/uploads", 500, {"error": "no"})
    failed = await api.delete(base, headers=headers)
    assert (failed.status_code, failed.json()) == (
        502,
        {"error": {"key": "documents.confirmFailed"}},
    )
    # The row stays while its object might: a row nobody can see is a file nobody deletes.
    assert (
        len(
            await sql(db, "select 1 from public.uploads where id = $1::uuid", announced["uploadId"])
        )
        == 1
    )

    supabase.reply("/storage/v1/object/uploads", 200, [])
    assert (await api.delete(base, headers=headers)).status_code == 204
    last = supabase.to("/storage/v1/object/uploads")[-1]
    assert last["method"] == "DELETE"
    assert last["json"] == {"prefixes": [announced["storagePath"]]}
    assert last["authorization"] == headers["Authorization"]
    assert (
        await sql(db, "select 1 from public.uploads where id = $1::uuid", announced["uploadId"])
        == []
    )


async def test_with_extraction_on_a_confirmed_passport_is_read_once(
    db, api_settings, jwks_transport, supabase, person
) -> None:
    settings = api_settings.model_copy(update={"document_extraction": "on"})
    application_app = create_app(settings, database=db)
    application_app.state.jwks = JwksCache(settings, transport=jwks_transport)
    application_app.state.supabase = Supabase(
        settings, transport=httpx.MockTransport(supabase.handler)
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=application_app), base_url="http://api.test"
    ) as api:
        user, headers = await person()
        application = await create_application(api, headers)
        for document in ("passportBio", "photo"):
            announced = (
                await api.post(
                    f"/api/v1/applications/{application}/uploads",
                    json={"document": document, "fileName": "a.jpg", "contentType": "image/jpeg"},
                    headers=headers,
                )
            ).json()
            await put_object(db, user, announced["storagePath"])
            for _ in range(2):
                url = f"/api/v1/applications/{application}/uploads/{announced['uploadId']}/confirm"
                assert (await api.post(url, headers=headers)).status_code == 204
            if document == "passportBio":
                passport = announced["uploadId"]

    jobs = await sql(
        db, "select task_type, executor_kind, input from public.jobs where user_id = $1::uuid", user
    )
    # Once for the passport, despite two confirmations; never for the photo,
    # which supplies no answers.
    assert len(jobs) == 1
    job = jobs[0]
    assert (job["task_type"], job["executor_kind"]) == ("doc_field_extraction", "llm_gateway")
    assert job["input"] == {
        "documents": [
            {
                "uploadId": passport,
                "document": "passportBio",
                "page": 1,
                "contentType": "image/jpeg",
            }
        ],
        "fields": rules.extractable_fields("passportBio"),
    }


async def test_an_upload_answers_only_under_its_own_application(api, db, person, supabase) -> None:
    user, headers = await person()
    first = await create_application(api, headers)
    second = await create_application(api, headers)
    announced = (
        await api.post(
            f"/api/v1/applications/{first}/uploads",
            json={"document": "photo", "fileName": "p.png", "contentType": "image/png"},
            headers=headers,
        )
    ).json()
    await put_object(db, user, announced["storagePath"])
    elsewhere = f"/api/v1/applications/{second}/uploads/{announced['uploadId']}"

    assert (await api.post(f"{elsewhere}/confirm", headers=headers)).status_code == 404
    assert (await api.delete(elsewhere, headers=headers)).status_code == 204
    assert supabase.to("/storage/v1/object/uploads") == []
    [row] = await sql(
        db, "select status from public.uploads where id = $1::uuid", announced["uploadId"]
    )
    assert row["status"] == "pending"
