"""Hermetic fixtures: a signing key, a JWKS served without a network, and an
application built from pinned settings."""

from __future__ import annotations

import time
import uuid
from collections.abc import Callable
from typing import Any

import httpx
import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient
from jwt.algorithms import ECAlgorithm

from app.auth import JwksCache
from app.config import Settings
from app.db import Database
from app.main import create_app

SUPABASE_URL = "https://project.example.test"
KID = "test-key"


@pytest.fixture(scope="session")
def signing_key() -> ec.EllipticCurvePrivateKey:
    return ec.generate_private_key(ec.SECP256R1())


@pytest.fixture
def settings() -> Settings:
    return Settings(_env_file=None, supabase_url=SUPABASE_URL, environment="test")


class FakeDatabase(Database):
    """No Postgres: accounts are whatever the test says exists."""

    def __init__(self) -> None:
        super().__init__()
        self.active: set[str] = set()

    async def ping(self) -> bool:
        return False

    async def account_is_active(self, user_id: str) -> bool:
        return user_id in self.active


@pytest.fixture
def fake_db() -> FakeDatabase:
    return FakeDatabase()


@pytest.fixture
def jwks_transport(signing_key: ec.EllipticCurvePrivateKey) -> httpx.MockTransport:
    public = ECAlgorithm.to_jwk(signing_key.public_key(), as_dict=True)
    document = {"keys": [{**public, "kid": KID, "alg": "ES256", "use": "sig"}]}
    return httpx.MockTransport(lambda request: httpx.Response(200, json=document))


@pytest.fixture
def app(settings: Settings, fake_db: FakeDatabase, jwks_transport: httpx.MockTransport):
    application = create_app(settings, database=fake_db)
    application.state.jwks = JwksCache(settings, transport=jwks_transport)
    return application


@pytest.fixture
def client(app) -> TestClient:
    return TestClient(app)


@pytest.fixture
def make_token(signing_key: ec.EllipticCurvePrivateKey) -> Callable[..., str]:
    def make(
        sub: str | None = None,
        *,
        key: Any = None,
        algorithm: str = "ES256",
        kid: str | None = KID,
        **overrides: Any,
    ) -> str:
        now = int(time.time())
        claims = {
            "sub": sub or str(uuid.uuid4()),
            "aud": "authenticated",
            "iss": f"{SUPABASE_URL}/auth/v1",
            "role": "authenticated",
            "email": "a@example.test",
            "iat": now,
            "exp": now + 3600,
            **overrides,
        }
        headers = {"kid": kid} if kid else {}
        return jwt.encode(claims, key or signing_key, algorithm=algorithm, headers=headers)

    return make
