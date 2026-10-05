"""The database still decides what a user-scoped request may touch.

Against a real Postgres with the repository's migrations applied: the local
Supabase stack by default, as the conductor's tests use, or TEST_DATABASE_URL.
Reported as skipped — never silently passed — when it cannot be reached.
"""

from __future__ import annotations

import uuid

import asyncpg
import pytest

from app.auth import Caller
from app.config import Settings
from app.db import Database
from tests.database import API_DSN, admin


@pytest.fixture
async def db():
    database = Database()
    await database.connect(Settings(_env_file=None, database_url=API_DSN))
    if not await database.ping():
        pytest.skip(
            f"no database at {API_DSN.split('@')[-1]} — start the local stack (pnpm db:start)"
        )
    yield database
    await database.close()


@pytest.fixture
async def people(db):
    """Two users with one application each; removed afterwards, theirs only.

    Set up as the connecting role, as pgTAP does: auth.users is not something
    even the service role may write.
    """
    async with admin() as connection:
        ids = []
        for _ in range(2):
            user = await connection.fetchval(
                """insert into auth.users (id, email, instance_id)
                   values (gen_random_uuid(), 'api-' || gen_random_uuid() || '@test.local',
                           '00000000-0000-0000-0000-000000000000')
                   returning id::text"""
            )
            application = await connection.fetchval(
                """insert into public.applications (user_id, residence_area, destination)
                   values ($1::uuid, 'sichuan', 'ES') returning id::text""",
                user,
            )
            ids.append((user, application))
    yield ids
    async with admin() as connection:
        await connection.execute(
            "delete from auth.users where id = any($1::uuid[])", [u for u, _ in ids]
        )


def caller(user_id: str) -> Caller:
    claims = {"sub": user_id, "role": "authenticated", "aud": "authenticated"}
    return Caller(user_id=user_id, email=None, claims=claims, access_token="")


async def test_a_user_sees_their_own_rows_and_no_one_elses(db, people) -> None:
    (alice, alice_app), (_, bob_app) = people
    async with db.as_user(caller(alice)) as connection:
        visible = await connection.fetch(
            "select id::text from public.applications where id = any($1::uuid[])",
            [alice_app, bob_app],
        )
    assert [row["id"] for row in visible] == [alice_app]


async def test_a_column_the_user_has_no_grant_on_cannot_be_written(db, people) -> None:
    (alice, alice_app), _ = people
    with pytest.raises(asyncpg.InsufficientPrivilegeError):
        async with db.as_user(caller(alice)) as connection:
            await connection.execute(
                "update public.applications set submitted_at = now() where id = $1::uuid",
                alice_app,
            )


async def test_a_column_the_user_may_write_is_written(db, people) -> None:
    (alice, alice_app), _ = people
    async with db.as_user(caller(alice)) as connection:
        result = await connection.execute(
            "update public.applications set last_step = 'applicant/name' where id = $1::uuid",
            alice_app,
        )
    assert result == "UPDATE 1"


async def test_the_identity_ends_with_the_transaction(db, people) -> None:
    (alice, _), _ = people
    async with db.as_user(caller(alice)):
        pass
    # The pool hands the same connection back out; it must carry no identity.
    async with db._require_pool().acquire() as connection:
        assert await connection.fetchval("select current_user") == "visa_api"
        assert await connection.fetchval("select current_setting('request.jwt.claims', true)") in (
            None,
            "",
        )


async def test_signed_out_reaches_no_application(db, people) -> None:
    with pytest.raises(asyncpg.InsufficientPrivilegeError):
        async with db.as_anonymous() as connection:
            await connection.fetch("select id from public.applications")


async def test_a_deleted_account_is_not_active(db, people) -> None:
    (alice, _), _ = people
    assert await db.account_is_active(alice)
    assert not await db.account_is_active(str(uuid.uuid4()))
    async with admin() as connection:
        await connection.execute(
            "update auth.users set deleted_at = now() where id = $1::uuid", alice
        )
    assert not await db.account_is_active(alice)


async def test_the_login_role_is_nothing_until_it_switches(db) -> None:
    async with db._require_pool().acquire() as connection:
        assert await connection.fetchval("select current_user") == "visa_api"
        for query in (
            "select 1 from public.applications limit 1",
            "select 1 from public.jobs limit 1",
            "select email from auth.users limit 1",
        ):
            with pytest.raises(asyncpg.InsufficientPrivilegeError):
                await connection.fetch(query)


async def test_the_login_role_cannot_become_an_administrator(db) -> None:
    async with db._require_pool().acquire() as connection:
        for role in ("postgres", "supabase_admin", "supabase_auth_admin"):
            with pytest.raises(asyncpg.InsufficientPrivilegeError):
                async with connection.transaction():
                    await connection.execute(f"set local role {role}")


async def test_the_pool_opens_on_the_first_request_without_a_lifespan() -> None:
    """Vercel's Python runtime never sends lifespan events; the first request opens the pool."""
    import httpx

    from app.main import create_app

    try:
        probe = await asyncpg.connect(API_DSN, timeout=5)
    except Exception:
        pytest.skip("no database to connect to — start the local stack (pnpm db:start)")
    await probe.close()

    database = Database()
    application = create_app(
        Settings(_env_file=None, database_url=API_DSN, environment="test"), database=database
    )
    # ASGITransport, like Vercel, does not run the lifespan.
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=application), base_url="http://api.test"
    ) as client:
        assert not database.is_connected
        health = (await client.get("/api/v1/health")).json()
    try:
        assert health["db"] is True
        assert database.is_connected
    finally:
        await database.close()
