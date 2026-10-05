"""The application: configuration, the database, token verification, the
/api/v1 routers, and the two failure shapes the wire carries."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.auth import JwksCache
from app.config import Settings, get_settings
from app.db import Database
from app.errors import ApiError, ValidationFailure
from app.routers import applications, auth, health, routes
from app.supabase import Supabase

logger = logging.getLogger(__name__)

API_PREFIX = "/api/v1"


def create_app(settings: Settings | None = None, database: Database | None = None) -> FastAPI:
    """Injectable settings and database keep the tests hermetic and the OpenAPI
    export independent of whoever runs it."""
    settings = settings or get_settings()
    database = database or Database()

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        await database.connect(settings)
        try:
            yield
        finally:
            await database.close()

    application = FastAPI(
        title="Visa Master API",
        version=settings.version,
        description="The backend every client of /api/v1 talks to (ADR-005).",
        docs_url=None if settings.is_production else f"{API_PREFIX}/docs",
        openapi_url=None if settings.is_production else f"{API_PREFIX}/openapi.json",
        lifespan=lifespan,
    )
    # Also outside the lifespan: Vercel's Python runtime does not run lifespan
    # events, so state is set here and the pool is opened by the first request
    # that arrives without one (below).
    application.state.settings = settings
    application.state.db = database
    application.state.jwks = JwksCache(settings)
    application.state.supabase = Supabase(settings)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        max_age=600,
    )

    @application.middleware("http")
    async def connect_on_first_request(request: Request, call_next):
        # Idempotent and locked: a no-op once the pool exists, a retry while
        # the database is unreachable, and nothing at all without a DSN.
        if not database.is_connected:
            await database.connect(settings)
        return await call_next(request)

    for router in (health.router, auth.router, routes.router, applications.router):
        application.include_router(router, prefix=API_PREFIX)

    @application.exception_handler(ValidationFailure)
    async def on_validation(_: Request, exc: ValidationFailure) -> JSONResponse:
        return JSONResponse(status_code=422, content={"issues": exc.issues})

    @application.exception_handler(ApiError)
    async def on_api_error(_: Request, exc: ApiError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status, content={"error": {"key": exc.key, **exc.extra}}
        )

    @application.exception_handler(RequestValidationError)
    async def on_request_shape(_: Request, __: RequestValidationError) -> JSONResponse:
        # Bodies are parsed by the service with the shared rules, which name
        # each failure; a request FastAPI itself cannot parse is just malformed.
        return JSONResponse(status_code=400, content={"error": {"key": "errors.request"}})

    @application.exception_handler(StarletteHTTPException)
    async def on_http(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        key = "errors.notFound.title" if exc.status_code == 404 else "errors.request"
        return JSONResponse(status_code=exc.status_code, content={"error": {"key": key}})

    @application.exception_handler(Exception)
    async def on_unexpected(_: Request, __: Exception) -> JSONResponse:
        logger.exception("api.unexpected_failure")
        return JSONResponse(status_code=500, content={"error": {"key": "errors.request"}})

    return application


app = create_app()
