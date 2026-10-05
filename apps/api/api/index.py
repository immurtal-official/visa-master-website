"""Vercel's entrypoint.

Vercel's Python runtime serves the ASGI object named ``app`` from this file
with request paths intact — the routers mount themselves under ``/api/v1``, so
``/api/v1/health`` is the same path locally (``uvicorn app.main:app``) and in
production. Do not add a rewrite pointing at this module: it would replace
every request path with ``/api/index`` and FastAPI would 404 everything.
"""

from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from app.main import app as fastapi_app  # noqa: E402

app = fastapi_app
