"""Dates the way packages/core reads them, which is the way JavaScript does.

The rules read a date with `new Date(value + "T00:00:00Z")`, and JavaScript's
reading has edges Python's does not: a 30th of February is not refused but
rolls into March, a bare year or year-month is a date, and year 0 exists. Those
edges decide whether an answer passes, so they are reproduced here rather than
approximated with `datetime` — and the conformance vectors hold them to it.

A date is an integer: milliseconds since the epoch, UTC, as `getTime()` gives.
"""

from __future__ import annotations

import re

MS_PER_DAY = 86_400_000

# The date forms of ECMAScript's date-time string format, followed by the fixed
# "T00:00:00Z" every caller appends. Anything else falls to the engine's legacy
# parser, which reads none of the strings an answer can hold as a date.
_ISO = re.compile(
    r"\A(?:(?P<year>\d{4})|(?P<sign>[+-])(?P<wide>\d{6}))"
    r"(?:-(?P<month>\d{2})(?:-(?P<day>\d{2}))?)?"
    r"T00:00:00Z\Z",
    re.ASCII,
)


def days_from_civil(year: int, month: int, day: int) -> int:
    """Days since 1970-01-01 of a proleptic Gregorian date (Hinnant's algorithm)."""
    year -= month <= 2
    era = year // 400  # floor division: no adjustment for negative years
    yoe = year - era * 400
    doy = (153 * (month + (-3 if month > 2 else 9)) + 2) // 5 + day - 1
    doe = yoe * 365 + yoe // 4 - yoe // 100 + doy
    return era * 146097 + doe - 719468


def civil_from_days(days: int) -> tuple[int, int, int]:
    """The (year, month, day) of a day count since 1970-01-01."""
    days += 719468
    era = days // 146097
    doe = days - era * 146097
    yoe = (doe - doe // 1460 + doe // 36524 - doe // 146096) // 365
    year = yoe + era * 400
    doy = doe - (365 * yoe + yoe // 4 - yoe // 100)
    mp = (5 * doy + 2) // 153
    day = doy - (153 * mp + 2) // 5 + 1
    month = mp + (3 if mp < 10 else -9)
    return year + (month <= 2), month, day


def utc_ms(year: int, month: int, day: int) -> int:
    """Date.UTC(year, month - 1, day): out-of-range months and days roll over."""
    year += (month - 1) // 12
    month = (month - 1) % 12 + 1
    return (days_from_civil(year, month, 1) + day - 1) * MS_PER_DAY


def ymd(ms: int) -> tuple[int, int, int]:
    """getUTCFullYear(), getUTCMonth() + 1, getUTCDate()."""
    return civil_from_days(ms // MS_PER_DAY)


# Beyond ±100,000,000 days from the epoch a JavaScript date is invalid.
_LIMIT = 8.64e15


def parse_date(value: object) -> int | None:
    """parseDate() in rules.ts: the date's time, or None where JavaScript gets NaN."""
    if not isinstance(value, str):
        return None
    match = _ISO.match(f"{value}T00:00:00Z")
    if not match:
        return None
    if match["year"] is not None:
        year = int(match["year"])
    else:
        if match["sign"] == "-" and match["wide"] == "000000":
            return None
        year = int(match["wide"]) * (-1 if match["sign"] == "-" else 1)
    month = int(match["month"]) if match["month"] else 1
    day = int(match["day"]) if match["day"] else 1
    # Each field is range-checked on its own, so the 31st of any month passes
    # here and rolls over below.
    if not 1 <= month <= 12 or not 1 <= day <= 31:
        return None
    ms = utc_ms(year, month, day)
    return ms if abs(ms) <= _LIMIT else None


def to_iso(ms: int) -> str:
    """toISOString(), for the parts of a date the rules produce."""
    year, month, day = ymd(ms)
    rest = ms % MS_PER_DAY
    hours, rest = divmod(rest, 3_600_000)
    minutes, rest = divmod(rest, 60_000)
    seconds, millis = divmod(rest, 1000)
    shown = f"{year:04d}" if 0 <= year <= 9999 else f"{'-' if year < 0 else '+'}{abs(year):06d}"
    return f"{shown}-{month:02d}-{day:02d}T{hours:02d}:{minutes:02d}:{seconds:02d}.{millis:03d}Z"


def months_between(start: int, end: int) -> int:
    """monthsBetween() in rules.ts: whole months, counted on the calendar."""
    fy, fm, fd = ymd(start)
    ty, tm, td = ymd(end)
    return (ty - fy) * 12 + (tm - fm) - (1 if td < fd else 0)
