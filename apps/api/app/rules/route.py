"""The route gate (packages/core/src/routes/route-gate.ts), read from its export."""

from __future__ import annotations

from typing import Any

from .engine import Context, Enum, Object, safe_parse, to_json
from .intake import data


def _route() -> dict[str, Any]:
    return data()["route"]


def parse_route_check(value: Any) -> dict[str, Any]:
    route = _route()
    schema = Object(
        {
            "residenceArea": Enum(route["residenceAreas"]),
            "destination": Enum(route["destinations"]),
            "purpose": Enum(route["purposes"]),
            "employment": Enum(route["employmentStatuses"]),
        }
    )
    # No rule here reads the clock.
    return to_json(safe_parse(schema, value, Context(now=0)))


def check_route(answers: dict[str, str]) -> dict[str, Any]:
    """Whether a route is served; every failing part is reported, not just the first."""
    route = _route()
    supported = route["supported"]
    reasons = []
    if answers["residenceArea"] not in route["chengduDistrictAreas"]:
        reasons.append("route.unsupported.reason.area")
    if answers["destination"] != supported["destination"]:
        reasons.append("route.unsupported.reason.destination")
    if answers["purpose"] != supported["purpose"]:
        reasons.append("route.unsupported.reason.purpose")
    if answers["employment"] != supported["employment"]:
        reasons.append("route.unsupported.reason.employment")
    return {"supported": True} if not reasons else {"supported": False, "reasons": reasons}
