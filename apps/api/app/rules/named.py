"""The named rules of packages/core/src/intake/rules.ts, implemented a second time.

The questionnaire's data names which rule each question uses (`pinyin`,
`text(1,60)`, …); this is where those names mean something on this side. Each
is written to mirror its TypeScript original line for line, so a reader can
hold the two side by side. A rule changed there and not here fails the
conformance vectors; a rule added there and not here fails by its name.
"""

from __future__ import annotations

import re
from typing import Any

from . import jsdate
from .engine import (
    JS_SPACE,
    Check,
    Pipe,
    Refine,
    Schema,
    String,
    max_length,
    min_length,
    pattern,
    refine,
    trim,
)

PASSPORT_VALIDITY_MONTHS = 3

_DATE = re.compile(r"\A\d{4}-\d{2}-\d{2}\Z", re.ASCII)


class UnknownRule(LookupError):
    """questionnaire.ts names a rule that has no implementation here."""

    def __init__(self, name: str) -> None:
        super().__init__(
            f"rule {name!r} is named by packages/core but not implemented in "
            "apps/api/app/rules/named.py"
        )
        self.name = name


def _date_string(*after: Check) -> Schema:
    return String(trim(), pattern(_DATE), *after)


def _past_date(value: str, ctx: Refine) -> None:
    date = jsdate.parse_date(value)
    if date is None:
        ctx.add("validation.date.invalid")
        return
    if date > ctx.now:
        ctx.add("validation.date.future")


def _pinyin(value: str, ctx: Refine) -> None:
    # Latin letters, spaces and hyphens: what a passport's machine-readable
    # line can hold. A Chinese character here means the wrong field.
    if not re.fullmatch(f"[A-Z{JS_SPACE}-]+", value):
        ctx.add("validation.pinyin.invalid")


def _mobile_phone(value: str, ctx: Refine) -> None:
    if not re.fullmatch(r"1\d{10}", value, re.ASCII):
        ctx.add("validation.phone.invalid")


def _passport_number(value: str, ctx: Refine) -> None:
    if not re.fullmatch(r"[A-Z0-9]{9}", value):
        ctx.add("validation.passport.number.invalid", {"length": 9})


def _amount(value: str, ctx: Refine) -> None:
    if not re.fullmatch(r"\d{1,9}(\.\d{1,2})?", value, re.ASCII):
        ctx.add("validation.amount.invalid")


def _passport_expiry_alone(value: str, ctx: Refine) -> None:
    expires = jsdate.parse_date(value)
    if expires is None:
        ctx.add("validation.date.invalid")
        return
    if jsdate.months_between(ctx.now, expires) < PASSPORT_VALIDITY_MONTHS:
        ctx.add("validation.passport.expiry.tooSoon", {"monthsRequired": PASSPORT_VALIDITY_MONTHS})


def _strip(characters: str):
    expression = re.compile(f"[{characters}]")
    return lambda value: expression.sub("", value)


def _upper(value: str) -> str:
    return value.upper()


_RULES: dict[str, Any] = {
    "dateString": lambda: _date_string(),
    "pastDate": lambda: _date_string(refine(_past_date)),
    "pinyin": lambda: Pipe(String(trim(), min_length(1), max_length(80)), _upper, refine(_pinyin)),
    "mobilePhone": lambda: Pipe(String(trim()), _strip(JS_SPACE + "-"), refine(_mobile_phone)),
    "passportNumber": lambda: Pipe(
        String(trim()),
        lambda value: _strip(JS_SPACE)(value).upper(),
        refine(_passport_number),
    ),
    "amountInYuan": lambda: Pipe(String(trim()), _strip(",¥" + JS_SPACE), refine(_amount)),
    "passportExpiryAlone": lambda: _date_string(refine(_passport_expiry_alone)),
}

_TEXT = re.compile(r"text\((\d+),(\d+)\)")


def rule(name: str) -> Schema:
    """The schema a rule name stands for."""
    text = _TEXT.fullmatch(name)
    if text:
        return String(trim(), min_length(int(text[1])), max_length(int(text[2])))
    if name not in _RULES:
        raise UnknownRule(name)
    return _RULES[name]()


# --- rules relating two answers ---------------------------------------------


def _passport_dates(value: dict[str, Any], ctx: Refine) -> None:
    issued = jsdate.parse_date(value.get("issuedAt"))
    expires = jsdate.parse_date(value.get("expiresAt"))

    if issued is None:
        ctx.add("validation.date.invalid", path=["issuedAt"])
    if expires is None:
        ctx.add("validation.date.invalid", path=["expiresAt"])
    if issued is None or expires is None:
        return

    if issued > ctx.now:
        ctx.add("validation.date.future", path=["issuedAt"])
    if expires <= issued:
        ctx.add("validation.passport.expiry.beforeIssue", path=["expiresAt"])
    if jsdate.months_between(ctx.now, expires) < PASSPORT_VALIDITY_MONTHS:
        ctx.add(
            "validation.passport.expiry.tooSoon",
            {"monthsRequired": PASSPORT_VALIDITY_MONTHS},
            ["expiresAt"],
        )


def _travel_dates(value: dict[str, Any], ctx: Refine) -> None:
    departure = jsdate.parse_date(value.get("departureDate"))
    back = jsdate.parse_date(value.get("returnDate"))
    if departure is None:
        ctx.add("validation.date.invalid", path=["departureDate"])
    if back is None:
        ctx.add("validation.date.invalid", path=["returnDate"])
    if departure is None or back is None:
        return

    if departure < ctx.now - jsdate.MS_PER_DAY:
        ctx.add("validation.date.past", path=["departureDate"])
    if back < departure:
        ctx.add("validation.travel.returnBeforeDeparture", path=["returnDate"])


def _passport_outlives_trip(value: dict[str, Any], ctx: Refine) -> None:
    passport = value.get("passport")
    travel = value.get("travel")
    if not isinstance(passport, dict) or not isinstance(travel, dict):
        return
    expires = jsdate.parse_date(passport.get("expiresAt"))
    back = jsdate.parse_date(travel.get("returnDate"))
    if expires is None or back is None:
        return

    if jsdate.months_between(back, expires) < PASSPORT_VALIDITY_MONTHS:
        ctx.add(
            "validation.passport.expiry.tooSoonForTrip",
            {"monthsRequired": PASSPORT_VALIDITY_MONTHS},
            ["passport", "expiresAt"],
        )


_CHECKS = {
    "passportDatesCheck": _passport_dates,
    "travelDatesCheck": _travel_dates,
    "passportOutlivesTripCheck": _passport_outlives_trip,
}


def cross_check(name: str) -> Check:
    """The check a cross-field rule name stands for."""
    if name not in _CHECKS:
        raise UnknownRule(name)
    return refine(_CHECKS[name])


def rule_names() -> set[str]:
    """Every name implemented here, for the test that each named rule exists."""
    return {*_RULES, *_CHECKS}
