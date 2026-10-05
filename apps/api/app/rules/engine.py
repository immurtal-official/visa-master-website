"""Just enough of zod's semantics to run the named rules the way packages/core does.

The rules are written in TypeScript with zod, and which issues a bad answer
produces — how many, in what order, whether a later check still runs after an
earlier one failed — is zod's behaviour, not the rule's. A port that only got
the happy path right would agree with the web on valid answers and disagree on
exactly the ones a person sees an error for. So the parts of zod 4 the rules
use are reproduced here as zod implements them:

- A type failure stops the checks after it, except length checks, which still
  run on anything that has a length (an array given where text was expected
  reports both).
- A failed check does not stop the next one: a malformed date still reaches the
  rule that asks whether it is in the past.
- A transform runs only when everything before it passed, and the rules
  attached after it are skipped otherwise.
- An object runs every field, then its own rules only if no field failed in a
  way that stops (a missing or wrongly typed answer); a merely invalid one does
  not stop them.

The conformance vectors are the judge of whether this is right.
"""

from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any


class _Undefined:
    """JavaScript's `undefined`, distinct from `null` (None)."""

    _instance: _Undefined | None = None

    def __new__(cls) -> _Undefined:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __repr__(self) -> str:
        return "undefined"

    def __bool__(self) -> bool:
        return False


UNDEFINED: Any = _Undefined()

# JavaScript's \s and String.prototype.trim(): whitespace and line terminators.
JS_SPACE = "\t\n\v\f\r    -     　﻿"
_TRIM = re.compile(f"\\A[{JS_SPACE}]+|[{JS_SPACE}]+\\Z")


def js_trim(value: str) -> str:
    return _TRIM.sub("", value)


def js_length(value: Any) -> int | None:
    """`.length`, in UTF-16 code units for a string; None where it is undefined."""
    if isinstance(value, str):
        return len(value.encode("utf-16-le")) // 2
    if isinstance(value, list):
        return len(value)
    return None


def is_object(value: Any) -> bool:
    """zod's isObject: a plain object, not null and not an array."""
    return isinstance(value, dict)


@dataclass
class Context:
    """What a rule may read besides the value: today, as milliseconds since the epoch."""

    now: int


@dataclass
class Payload:
    value: Any
    issues: list[dict[str, Any]] = field(default_factory=list)
    aborted: bool = False


def aborted(payload: Payload, start: int = 0) -> bool:
    return payload.aborted or any(
        issue.get("continue") is not True for issue in payload.issues[start:]
    )


def explicitly_aborted(payload: Payload, start: int = 0) -> bool:
    return payload.aborted or any(
        issue.get("continue") is False for issue in payload.issues[start:]
    )


# --- checks -----------------------------------------------------------------


@dataclass
class Check:
    run: Callable[[Payload, Context], None]
    # A length check runs even after a stopping failure, on anything with a length.
    when: Callable[[Payload], bool] | None = None


def _has_length(payload: Payload) -> bool:
    return (
        payload.value is not None
        and payload.value is not UNDEFINED
        and (js_length(payload.value) is not None)
    )


def _origin(value: Any) -> str:
    if isinstance(value, list):
        return "array"
    if isinstance(value, str):
        return "string"
    return "unknown"


def trim() -> Check:
    def run(payload: Payload, _: Context) -> None:
        payload.value = js_trim(payload.value)

    return Check(run)


def min_length(minimum: int) -> Check:
    def run(payload: Payload, _: Context) -> None:
        if js_length(payload.value) < minimum:
            payload.issues.append(
                {
                    "code": "too_small",
                    "origin": _origin(payload.value),
                    "minimum": minimum,
                    "continue": True,
                }
            )

    return Check(run, when=_has_length)


def max_length(maximum: int) -> Check:
    def run(payload: Payload, _: Context) -> None:
        if js_length(payload.value) > maximum:
            payload.issues.append(
                {
                    "code": "too_big",
                    "origin": _origin(payload.value),
                    "maximum": maximum,
                    "continue": True,
                }
            )

    return Check(run, when=_has_length)


def pattern(regex: re.Pattern[str], format: str = "regex") -> Check:
    def run(payload: Payload, _: Context) -> None:
        if not regex.search(payload.value):
            payload.issues.append({"code": "invalid_format", "format": format, "continue": True})

    return Check(run)


Refinement = Callable[[Any, "Refine"], None]


class Refine:
    """The `ctx` a superRefine receives: somewhere to add issues, and today."""

    def __init__(self, payload: Payload, context: Context) -> None:
        self._payload = payload
        self.now = context.now

    def add(self, key: str, params: dict[str, Any] | None = None, path: list[str] | None = None):
        issue: dict[str, Any] = {
            "code": "custom",
            "i18n": {"key": key, **({"params": params} if params else {})},
            "path": list(path or []),
            "continue": True,
        }
        self._payload.issues.append(issue)


def refine(fn: Refinement) -> Check:
    def run(payload: Payload, context: Context) -> None:
        fn(payload.value, Refine(payload, context))

    return Check(run)


def run_checks(payload: Payload, checks: list[Check], context: Context) -> Payload:
    stopped = aborted(payload)
    for check in checks:
        if check.when is not None:
            if explicitly_aborted(payload) or not check.when(payload):
                continue
        elif stopped:
            continue
        before = len(payload.issues)
        check.run(payload, context)
        if len(payload.issues) != before and not stopped:
            stopped = aborted(payload, before)
    return payload


# --- schemas ----------------------------------------------------------------


class Schema:
    checks: list[Check]

    def parse(self, payload: Payload, context: Context) -> Payload:
        raise NotImplementedError

    def run(self, payload: Payload, context: Context) -> Payload:
        return run_checks(self.parse(payload, context), self.checks, context)


class String(Schema):
    def __init__(self, *checks: Check) -> None:
        self.checks = list(checks)

    def parse(self, payload: Payload, context: Context) -> Payload:
        if not isinstance(payload.value, str):
            payload.issues.append({"code": "invalid_type", "expected": "string"})
        return payload


class Enum(Schema):
    def __init__(self, values: list[str]) -> None:
        self.values = list(values)
        self.checks = []

    def parse(self, payload: Payload, context: Context) -> Payload:
        if not (isinstance(payload.value, str) and payload.value in self.values):
            payload.issues.append({"code": "invalid_value"})
        return payload


class Never(Schema):
    checks: list[Check] = []

    def parse(self, payload: Payload, context: Context) -> Payload:
        payload.issues.append({"code": "invalid_type", "expected": "never"})
        return payload


class Pipe(Schema):
    """`a.transform(fn)` or `a.pipe(b)`, with any rules attached after it."""

    def __init__(self, first: Schema, then: Schema | Callable[[Any], Any], *checks: Check):
        self.first = first
        self.then = then
        self.checks = list(checks)

    def parse(self, payload: Payload, context: Context) -> Payload:
        left = self.first.run(payload, context)
        if left.issues:
            left.aborted = True
            return left
        if isinstance(self.then, Schema):
            return self.then.run(Payload(left.value, left.issues), context)
        return Payload(self.then(left.value), left.issues)


class Object(Schema):
    """A z.object: unknown keys are dropped; each field's issues carry its key."""

    def __init__(self, shape: dict[str, Schema], *checks: Check) -> None:
        self.shape = shape
        self.checks = list(checks)

    def parse(self, payload: Payload, context: Context) -> Payload:
        source = payload.value
        if not is_object(source):
            payload.issues.append({"code": "invalid_type", "expected": "object"})
            return payload
        result: dict[str, Any] = {}
        payload.value = result
        for key, schema in self.shape.items():
            present = key in source
            out = schema.run(Payload(source.get(key, UNDEFINED)), context)
            for issue in out.issues:
                issue["path"] = [key, *issue.get("path", [])]
            payload.issues.extend(out.issues)
            if out.value is UNDEFINED:
                if present:
                    result[key] = UNDEFINED
            else:
                result[key] = out.value
        return payload


# --- issues → keys ----------------------------------------------------------


def value_at(value: Any, path: list[str]) -> Any:
    for segment in path:
        if not isinstance(value, dict):
            return UNDEFINED
        value = value.get(segment, UNDEFINED)
    return value


def _absent(value: Any) -> bool:
    return value is UNDEFINED or value is None or value == "" and isinstance(value, str)


def key_for(issue: dict[str, Any], source: Any) -> dict[str, Any]:
    """keyFor() in validation/issue.ts: one issue as a catalogue key and its params."""
    if issue["code"] == "custom":
        return dict(issue["i18n"])

    value = value_at(source, issue.get("path", []))
    if _absent(value):
        return {"key": "validation.required"}

    code = issue["code"]
    if code == "invalid_type":
        return {"key": "validation.invalid"}
    if code == "too_small":
        if issue["origin"] == "string" and issue["minimum"] == 1:
            return {"key": "validation.required"}
        return {"key": "validation.tooShort", "params": {"min": issue["minimum"]}}
    if code == "too_big":
        return {"key": "validation.tooLong", "params": {"max": issue["maximum"]}}
    if code == "invalid_format" and issue.get("format") == "email":
        return {"key": "validation.email.invalid"}
    return {"key": "validation.invalid"}


def to_json(value: Any) -> Any:
    """JSON.parse(JSON.stringify(value)): `undefined` members disappear."""
    if isinstance(value, dict):
        return {k: to_json(v) for k, v in value.items() if v is not UNDEFINED}
    if isinstance(value, list):
        return [None if v is UNDEFINED else to_json(v) for v in value]
    return value


def safe_parse(schema: Schema, value: Any, context: Context) -> dict[str, Any]:
    """toResult(schema.safeParse(value), value): `{ok, data}` or `{ok, issues}`."""
    payload = schema.run(Payload(value), context)
    if not payload.issues:
        return {"ok": True, "data": payload.value}
    return {
        "ok": False,
        "issues": [
            {"path": ".".join(issue.get("path", [])), **key_for(issue, value)}
            for issue in payload.issues
        ],
    }
