"""Configuration.

Every setting comes from the environment (or a local ``.env`` during
development). Secrets are never returned to a client, never logged, and never
put in an error body.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

APP_VERSION = "0.1.0"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=False
    )

    environment: str = "development"
    version: str = APP_VERSION

    # --- Database -------------------------------------------------------
    # A direct Postgres DSN. User-scoped requests run as `authenticated` inside
    # their own transaction (app/db.py), so the connecting role must be able to
    # SET ROLE to it — Supabase's `postgres` can, as PostgREST's authenticator
    # does.
    database_url: str | None = None
    db_pool_min_size: int = 0
    db_pool_max_size: int = 4
    db_command_timeout_seconds: float = 10.0

    # --- Supabase -------------------------------------------------------
    supabase_url: str | None = None
    # Sent as `apikey` to Supabase Auth and Storage on a user's behalf. There is
    # no secret key: the product's own authority is the `service_role` database
    # role (app/db.py), and every Storage call is made as the user.
    supabase_publishable_key: str | None = None
    supabase_jwt_audience: str = "authenticated"
    jwks_cache_seconds: int = 600
    jwks_min_refresh_seconds: int = 60

    # Off unless "on": reading a document costs a model call, and with nothing
    # in the conductor to run it a queued job only fails.
    document_extraction: str = "off"

    # --- CORS -----------------------------------------------------------
    # Comma separated. The web's own server calls this service server to
    # server and needs none; these are for clients calling from a browser.
    cors_origins: str = ""

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in {"production", "prod"}

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_publishable_key)

    @property
    def extraction_on(self) -> bool:
        return self.document_extraction.strip().lower() == "on"

    @property
    def jwks_url(self) -> str | None:
        if not self.supabase_url:
            return None
        return f"{self.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"

    @property
    def jwt_issuer(self) -> str | None:
        if not self.supabase_url:
            return None
        return f"{self.supabase_url.rstrip('/')}/auth/v1"

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        if not self.is_production:
            origins += ["http://localhost:3000", "http://127.0.0.1:3000"]
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
