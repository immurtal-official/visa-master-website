"""The committed contract is the code's contract."""

from __future__ import annotations

from pathlib import Path

from scripts.export_openapi import OUTPUT, render


def test_openapi_snapshot_is_current() -> None:
    assert Path(OUTPUT).read_text(encoding="utf-8") == render(), (
        "apps/api/openapi.json is out of date: run `pnpm --filter @visa-master/api openapi` "
        "and commit the result."
    )
