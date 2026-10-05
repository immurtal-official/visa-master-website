"""The two ways the integration tests reach Postgres.

The application connects as `visa_api`, the backend's own login role — the one
it uses in production, which can do nothing until it switches to `anon`,
`authenticated` or `service_role`. Fixtures set up and remove rows as
`postgres`, as pgTAP does: creating a user in auth.users is not something the
backend may do, and the tests must not be able to pass by giving it the power.
"""

from __future__ import annotations

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import asyncpg

from app.db import _init_connection

LOCAL = "127.0.0.1:54322/postgres"
API_DSN = os.environ.get("TEST_DATABASE_URL", f"postgresql://visa_api:visa-api-local@{LOCAL}")
ADMIN_DSN = os.environ.get("TEST_ADMIN_DATABASE_URL", f"postgresql://postgres:postgres@{LOCAL}")


@asynccontextmanager
async def admin() -> AsyncIterator[asyncpg.Connection]:
    """A connection as `postgres`, for fixtures only."""
    connection = await asyncpg.connect(ADMIN_DSN)
    # JSON in and out as Python values, as the application's own pool does.
    await _init_connection(connection)
    try:
        yield connection
    finally:
        await connection.close()
