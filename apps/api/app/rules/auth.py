"""Sign-in input (packages/core/src/schemas/auth.ts)."""

from __future__ import annotations

import re
from typing import Any

from .engine import (
    JS_SPACE,
    Context,
    Object,
    Pipe,
    Refine,
    String,
    min_length,
    pattern,
    refine,
    safe_parse,
    to_json,
    trim,
)

# zod 4's email pattern, verbatim.
_EMAIL = re.compile(
    r"\A(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}\Z"
)

_NO_CLOCK = Context(now=0)


def parse_email(value: Any) -> dict[str, Any]:
    schema = Object(
        {"email": Pipe(String(trim(), min_length(1)), String(pattern(_EMAIL, "email")))}
    )
    return to_json(safe_parse(schema, value, _NO_CLOCK))


def _otp(value: str, ctx: Refine) -> None:
    if len(value) == 0:
        ctx.add("validation.required")
        return
    if not re.fullmatch(r"\d{6}", value, re.ASCII):
        ctx.add("validation.otp.invalidFormat")


def parse_otp_code(value: Any) -> dict[str, Any]:
    spaces = re.compile(f"[{JS_SPACE}]+")
    schema = Object({"code": Pipe(String(), lambda v: spaces.sub("", v), refine(_otp))})
    return to_json(safe_parse(schema, value, _NO_CLOCK))
