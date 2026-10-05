"""The failure shapes on the wire — the same two the Next.js handlers produce.

    422 (rule failures)    { "issues": [{ "path", "key", "params"? }] }
    other failures         { "error": { "key", ...extra } }

Keys are catalogue keys, never sentences: every client resolves them against
its own locale (ADR-004). Raise one of these two from anywhere below a router;
app/main.py turns them into responses.
"""

from __future__ import annotations

from typing import Any


class ApiError(Exception):
    """A failure the client is told about by one catalogue key."""

    def __init__(self, key: str, status: int, **extra: Any) -> None:
        super().__init__(key)
        self.key = key
        self.status = status
        self.extra = extra


class ValidationFailure(Exception):
    """One or more rules failed; each issue names its path and key."""

    def __init__(self, issues: list[dict[str, Any]]) -> None:
        super().__init__("validation failed")
        self.issues = issues
