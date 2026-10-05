#!/usr/bin/env python
"""Write the OpenAPI contract to apps/api/openapi.json.

The snapshot is committed: production serves no live schema, and the test
suite fails when the snapshot and the code disagree, so a contract change
cannot merge without its regenerated file.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import APP_VERSION, Settings  # noqa: E402
from app.main import create_app  # noqa: E402

OUTPUT = Path(__file__).resolve().parents[1] / "openapi.json"


def render() -> str:
    # Independent of the machine: ignore any local .env.
    schema = create_app(Settings(_env_file=None, version=APP_VERSION)).openapi()
    return json.dumps(schema, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


if __name__ == "__main__":
    OUTPUT.write_text(render(), encoding="utf-8")
    print(f"wrote {OUTPUT.name}")
