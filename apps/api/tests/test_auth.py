"""Bearer tokens: what is accepted, and that every refusal looks the same."""

from __future__ import annotations

import uuid
from collections.abc import Callable

import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import Depends
from fastapi.testclient import TestClient

from app.auth import Caller
from app.deps import optional_caller, require_caller

SIGNED_OUT = {"error": {"key": "route.sessionExpired"}}


@pytest.fixture
def protected(app, fake_db) -> TestClient:
    @app.get("/api/v1/_test/me")
    async def me(caller: Caller = Depends(require_caller)) -> dict:
        return {"userId": caller.user_id, "email": caller.email}

    @app.get("/api/v1/_test/maybe")
    async def maybe(caller: Caller | None = Depends(optional_caller)) -> dict:
        return {"signedIn": caller is not None}

    return TestClient(app)


def call(client: TestClient, token: str | None, path: str = "/api/v1/_test/me"):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return client.get(path, headers=headers)


def test_a_valid_token_for_a_live_account_is_the_caller(protected, fake_db, make_token) -> None:
    user = str(uuid.uuid4())
    fake_db.active.add(user)
    response = call(protected, make_token(user))
    assert response.status_code == 200
    assert response.json() == {"userId": user, "email": "a@example.test"}


def test_no_token_is_signed_out(protected) -> None:
    response = call(protected, None)
    assert (response.status_code, response.json()) == (401, SIGNED_OUT)


def test_a_cookie_is_not_a_credential(protected, fake_db, make_token) -> None:
    user = str(uuid.uuid4())
    fake_db.active.add(user)
    protected.cookies.set("sb-access-token", make_token(user))
    response = protected.get("/api/v1/_test/me")
    assert response.status_code == 401


@pytest.mark.parametrize(
    "overrides",
    [
        {"exp": 1},
        {"aud": "anon"},
        {"iss": "https://somebody-else.example/auth/v1"},
        {"role": "anon"},
    ],
    ids=["expired", "audience", "issuer", "role"],
)
def test_a_token_failing_any_check_is_signed_out(protected, fake_db, make_token, overrides) -> None:
    user = str(uuid.uuid4())
    fake_db.active.add(user)
    response = call(protected, make_token(user, **overrides))
    assert (response.status_code, response.json()) == (401, SIGNED_OUT)


def test_a_token_signed_by_another_key_is_signed_out(protected, fake_db, make_token) -> None:
    user = str(uuid.uuid4())
    fake_db.active.add(user)
    stranger = ec.generate_private_key(ec.SECP256R1())
    assert call(protected, make_token(user, key=stranger)).status_code == 401


def test_a_shared_secret_token_is_refused_before_any_key_is_looked_up(
    protected, fake_db, make_token
) -> None:
    user = str(uuid.uuid4())
    fake_db.active.add(user)
    token = make_token(user, key="a shared secret anybody might know", algorithm="HS256")
    assert call(protected, token).status_code == 401


def test_a_valid_token_for_a_deleted_account_is_signed_out(protected, make_token) -> None:
    # The signature is fine; the account behind it is gone.
    response = call(protected, make_token(str(uuid.uuid4())))
    assert (response.status_code, response.json()) == (401, SIGNED_OUT)


def test_signed_out_is_a_state_where_a_route_allows_it(
    protected, fake_db, make_token: Callable[..., str]
) -> None:
    assert call(protected, None, "/api/v1/_test/maybe").json() == {"signedIn": False}
    user = str(uuid.uuid4())
    fake_db.active.add(user)
    assert call(protected, make_token(user), "/api/v1/_test/maybe").json() == {"signedIn": True}
