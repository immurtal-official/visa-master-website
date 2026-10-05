"""Postgres access, with the database's own authorization still in force.

Before ADR-005 every user-scoped query went through PostgREST under the user's
token, so row-level security and the column grants decided what a request could
touch, underneath the service's own checks. This module keeps that second line:
a user-scoped transaction begins with

    set local role authenticated;
    select set_config('request.jwt.claims', <verified claims>, true);

which is exactly what PostgREST does, so `auth.uid()` in a policy is the
caller, a column without a grant cannot be written, and a query the service
gets wrong is still refused by the database. Paths that act on the product's
authority — enqueueing a job, recording an upload as `stored` — ask for the
service role by name, the way the Next.js services asked for the admin client.

Both settings are `local`: they end with the transaction, so a pooled
connection never carries one request's identity into the next.
"""

from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import asyncpg

from app.auth import Caller
from app.config import Settings
from app.errors import ApiError

logger = logging.getLogger(__name__)


async def _init_connection(connection: asyncpg.Connection) -> None:
    # json and jsonb arrive as Python values and leave as JSON, as they did
    # through PostgREST.
    for kind in ("json", "jsonb"):
        await connection.set_type_codec(
            kind, encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
        )


@asynccontextmanager
async def with_service_authority(connection: asyncpg.Connection) -> AsyncIterator[None]:
    """Inside a user-scoped transaction, act on the product's authority for a moment.

    For a write the caller may cause but not make — the row that says an answer
    was typed, `stored` on an upload — committed in the same transaction as the
    caller's own writes, so neither lands without the other. The caller's role
    is restored before control returns.
    """
    await connection.execute("set local role service_role")
    try:
        yield
    finally:
        await connection.execute("set local role authenticated")


class Database:
    """A lazily created pool that tolerates having no database configured."""

    def __init__(self) -> None:
        self._pool: asyncpg.Pool | None = None

    @property
    def is_connected(self) -> bool:
        return self._pool is not None

    async def connect(self, settings: Settings) -> None:
        # Never raises: a missing or unreachable database must not stop the
        # service booting. /health reports it, and every endpoint that needs
        # the database answers 503 instead of guessing.
        if self._pool is not None or not settings.database_url:
            return
        try:
            self._pool = await asyncpg.create_pool(
                dsn=settings.database_url,
                min_size=settings.db_pool_min_size,
                max_size=settings.db_pool_max_size,
                command_timeout=settings.db_command_timeout_seconds,
                # Supabase's transaction pooler does not support prepared
                # statements across transactions.
                statement_cache_size=0,
                init=_init_connection,
            )
        except Exception:
            logger.exception("db.connect_failed")
            self._pool = None

    async def close(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    async def ping(self) -> bool:
        if self._pool is None:
            return False
        try:
            async with self._pool.acquire() as connection:
                return await connection.fetchval("select 1") == 1
        except Exception:
            return False

    def _require_pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise ApiError("errors.request", 503)
        return self._pool

    @asynccontextmanager
    async def as_user(self, caller: Caller) -> AsyncIterator[asyncpg.Connection]:
        """A transaction that the database treats as the caller."""
        async with self._require_pool().acquire() as connection, connection.transaction():
            await connection.execute("set local role authenticated")
            await connection.execute(
                "select set_config('request.jwt.claims', $1, true)", json.dumps(caller.claims)
            )
            yield connection

    @asynccontextmanager
    async def as_anonymous(self) -> AsyncIterator[asyncpg.Connection]:
        """A transaction for a signed-out caller, under the `anon` role's grants."""
        async with self._require_pool().acquire() as connection, connection.transaction():
            await connection.execute("set local role anon")
            yield connection

    @asynccontextmanager
    async def as_service(self) -> AsyncIterator[asyncpg.Connection]:
        """A transaction on the product's own authority. Ask for this by name."""
        async with self._require_pool().acquire() as connection, connection.transaction():
            await connection.execute("set local role service_role")
            yield connection

    async def account_is_active(self, user_id: str, session_id: str | None = None) -> bool:
        """Whether the account behind a valid token still exists and may sign in.

        A signature proves a token was issued, not that its account survives: a
        deleted or banned user's token stays valid until it expires. Nor that
        its session does: a token from a session that was signed out stays
        valid too, so when the token names its session, the session must still
        exist. Read from auth.users and auth.sessions directly — no round trip
        to the auth service.
        """
        async with self._require_pool().acquire() as connection:
            row = await connection.fetchrow(
                """
                select 1 from auth.users u
                where u.id = $1::uuid
                  and u.deleted_at is null
                  and (u.banned_until is null or u.banned_until <= now())
                  and ($2::uuid is null or exists (
                    select 1 from auth.sessions s
                    where s.id = $2::uuid and s.user_id = u.id
                      and (s.not_after is null or s.not_after > now())
                  ))
                """,
                user_id,
                session_id,
            )
            return row is not None
