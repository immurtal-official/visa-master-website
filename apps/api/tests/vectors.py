"""Replaying conformance vectors written by packages/core (`pnpm intake:export`)."""

from __future__ import annotations

import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

from app.rules import jsdate
from app.rules.engine import to_json

CONFORMANCE = Path(__file__).parents[3] / "packages" / "core" / "conformance"


def load(name: str) -> dict[str, Any]:
    return json.loads((CONFORMANCE / name).read_text(encoding="utf-8"))


def instant(iso: str) -> int:
    """An ISO instant on the hour, as milliseconds — the form the vectors record."""
    ms = jsdate.parse_date(iso[:10]) + int(iso[11:13]) * 3_600_000
    assert jsdate.to_iso(ms) == iso, f"unexpected instant {iso}"
    return ms


def replay(
    fn: str, vectors: list[dict[str, Any]], call: Callable[[dict[str, Any]], Any]
) -> list[str]:
    """Every vector for `fn` whose answer here differs, described for a failure message."""
    failures = []
    for vector in (v for v in vectors if v["fn"] == fn):
        got = to_json(call(vector))
        if got != vector["result"]:
            failures.append(
                f"{fn}{json.dumps(vector['args'], ensure_ascii=False)}\n"
                f"  packages/core: {json.dumps(vector['result'], ensure_ascii=False)}\n"
                f"  apps/api:      {json.dumps(got, ensure_ascii=False)}"
            )
    return failures
