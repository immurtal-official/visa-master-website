"""Reading request values the way the Next.js services did.

Those services coerced loosely-typed body fields with JavaScript's `String()`
and `Number()`, and what a client sends is not always a string. The same
coercions keep a number sent as an answer, or a missing field, meaning what it
meant before.
"""

from __future__ import annotations

import math
import time
import uuid
from typing import Any


def js_string(value: Any) -> str:
    """`String(value ?? "")`."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        if math.isnan(value):
            return "NaN"
        if math.isinf(value):
            return "Infinity" if value > 0 else "-Infinity"
        return str(int(value)) if value.is_integer() else repr(value)
    if isinstance(value, list):
        return ",".join(js_string(item) for item in value)
    return "[object Object]"


def js_number(value: Any) -> float:
    """`Number(value)`, for the values a JSON body can hold."""
    if value is None:
        return 0.0
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    if isinstance(value, int | float):
        return float(value)
    if isinstance(value, str):
        text = value.strip()
        if text == "":
            return 0.0
        try:
            return float(text)
        except ValueError:
            return math.nan
    return math.nan


def utf16_prefix(value: str, units: int) -> str:
    """`value.slice(0, units)`: a length in UTF-16 code units, as the web counts it.

    Never ends inside a surrogate pair — half a character is not storable.
    """
    encoded = value.encode("utf-16-le", "surrogatepass")
    if len(encoded) <= units * 2:
        return value
    cut = encoded[: units * 2]
    if 0xD800 <= int.from_bytes(cut[-2:], "little") <= 0xDBFF:
        cut = cut[:-2]
    return cut.decode("utf-16-le", "surrogatepass")


def as_uuid(value: str) -> str | None:
    """The id in canonical form, or None if it is not one — which is a row that is not there."""
    try:
        return str(uuid.UUID(value))
    except ValueError:
        return None


def now_ms() -> int:
    """Today, for the rules that depend on it."""
    return int(time.time() * 1000)
