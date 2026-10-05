"""The Python rules reproduce packages/core, vector for vector.

packages/core/conformance/vectors.json holds inputs and the outputs the
TypeScript gives for them, computed at a fixed instant (and the date
boundaries again at a second one, midnight). Every one is replayed here at the
instant it was computed at. A failure names the function, the input, and both
answers; `pnpm check:intake` regenerates the vectors when a rule changes there.
"""

from __future__ import annotations

from collections import Counter
from typing import Any

import pytest

from app import rules
from app.rules import jsdate, named
from app.rules.intake import data
from tests.vectors import instant, load, replay

_document = load("vectors.json")


def _date(value: str) -> str | None:
    ms = jsdate.parse_date(value)
    return None if ms is None else jsdate.to_iso(ms)


CALLS: dict[str, Any] = {
    "parseDate": _date,
    "parseQuestion": lambda path, value, now: rules.parse_question(path, value, now=now),
    "parseIntake": lambda answers, now: rules.parse_intake(answers, now=now),
    "parseEmail": rules.parse_email,
    "parseOtpCode": rules.parse_otp_code,
    "checkRoute": rules.check_route,
    "parseRouteCheck": rules.parse_route_check,
    "conditionHolds": rules.condition_holds,
    "askedPath": rules.asked_path,
    "askedAnswers": rules.asked_answers,
    "intakeProgress": rules.intake_progress,
    "documentsFor": rules.documents_for,
    "documentCompleteness": rules.document_completeness,
    "documentsForJob": rules.documents_for_job,
    "placeholderIssues": rules.placeholder_issues,
    "nextQuestion": rules.next_question,
    "findAskedQuestion": rules.find_asked_question,
    "extractableFields": rules.extractable_fields,
}


# The functions whose answer depends on today.
CLOCKED = {"parseQuestion", "parseIntake"}


def test_every_vector_has_a_python_counterpart() -> None:
    missing = sorted({v["fn"] for v in _document["vectors"]} - CALLS.keys())
    assert not missing, f"vectors for functions with no Python counterpart: {missing}"


def test_every_named_rule_is_implemented() -> None:
    sections = [s for s in data()["sections"] if s["kind"] == "questions"]
    used = {q[k] for s in sections for q in s["questions"] for k in ("rule", "alone") if q.get(k)}
    used |= {s["check"] for s in sections if s.get("check")}
    used |= {data()["formCheck"]} if data().get("formCheck") else set()
    unknown = sorted(n for n in used if not n.startswith("text(") and n not in named.rule_names())
    assert not unknown, f"named in packages/core, not implemented in Python: {unknown}"


@pytest.mark.parametrize("fn", sorted(Counter(v["fn"] for v in _document["vectors"])))
def test_vectors(fn: str) -> None:
    call = CALLS[fn]

    def run(vector: dict[str, Any]) -> Any:
        if fn in CLOCKED:
            return call(*vector["args"], instant(vector.get("now", _document["now"])))
        return call(*vector["args"])

    failures = replay(fn, _document["vectors"], run)
    assert not failures, f"{len(failures)} disagreement(s):\n" + "\n".join(failures[:5])
