"""The failure shapes on the wire are the ones every client already reads."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.errors import ApiError, ValidationFailure


def test_health_needs_no_database(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True, "db": False, "version": "0.1.0"}


def test_rule_failures_are_issues_with_keys(app) -> None:
    @app.get("/api/v1/_test/invalid")
    async def invalid() -> None:
        raise ValidationFailure([{"path": "email", "key": "validation.email.invalid"}])

    response = TestClient(app).get("/api/v1/_test/invalid")
    assert response.status_code == 422
    assert response.json() == {"issues": [{"path": "email", "key": "validation.email.invalid"}]}


def test_other_failures_are_one_key_with_its_detail(app) -> None:
    @app.get("/api/v1/_test/missing")
    async def missing() -> None:
        raise ApiError("intake.review.documentsMissing", 422, missingDocuments=["passportBio"])

    response = TestClient(app).get("/api/v1/_test/missing")
    assert response.status_code == 422
    assert response.json() == {
        "error": {"key": "intake.review.documentsMissing", "missingDocuments": ["passportBio"]}
    }


def test_an_unexpected_failure_is_a_key_not_a_traceback(app) -> None:
    @app.get("/api/v1/_test/boom")
    async def boom() -> None:
        raise RuntimeError("a path, a value, a secret")

    response = TestClient(app, raise_server_exceptions=False).get("/api/v1/_test/boom")
    assert response.status_code == 500
    assert response.json() == {"error": {"key": "errors.request"}}
    assert "secret" not in response.text


def test_an_unknown_path_is_a_key(client: TestClient) -> None:
    response = client.get("/api/v1/nothing-here")
    assert response.status_code == 404
    assert response.json() == {"error": {"key": "errors.notFound.title"}}
