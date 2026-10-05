"""Branching, held to packages/core the same way: by vectors.

The real questionnaire has no conditional questions yet, so the main vectors
cannot tell a correct branching implementation from one that ignores `showIf`.
packages/core/conformance/branching.json carries a probe questionnaire that has
them — a conditional section, a conditional core question, extra questions, a
section rule that runs only when every question it reads is asked — and the
outputs the TypeScript gives against it. This loads that questionnaire in place
of the real one and replays every vector.
"""

from __future__ import annotations

from collections import Counter
from typing import Any

import pytest

from app import rules
from app.rules import documents, intake, route
from tests.vectors import instant, load, replay

_document = load("branching.json")
NOW = instant(_document["now"])

CALLS: dict[str, Any] = {
    "parseIntake": lambda answers: rules.parse_intake(answers, now=NOW),
    "parseQuestion": lambda path, value: rules.parse_question(path, value, now=NOW),
    "askedPath": rules.asked_path,
    "askedAnswers": rules.asked_answers,
    "intakeProgress": rules.intake_progress,
    "documentsFor": rules.documents_for,
    "sectionState": lambda answers: [
        rules.section_state(section, answers) for section in rules.sections()
    ],
    "resumePoint": rules.resume_point,
    "placeholderIssues": rules.placeholder_issues,
    "nextQuestion": rules.next_question,
    "findAskedQuestion": rules.find_asked_question,
}


@pytest.fixture(autouse=True)
def probe_questionnaire(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(intake, "data", lambda: _document["data"])
    monkeypatch.setattr(documents, "data", lambda: _document["data"])
    monkeypatch.setattr(route, "data", lambda: _document["data"])


def test_the_probe_branches() -> None:
    sections = _document["data"]["sections"]
    assert any("showIf" in s for s in sections)
    assert any("showIf" in q for s in sections for q in s.get("questions", []))
    assert any(q["extra"] for s in sections for q in s.get("questions", []))


@pytest.mark.parametrize("fn", sorted(Counter(v["fn"] for v in _document["vectors"])))
def test_vectors(fn: str) -> None:
    call = CALLS[fn]
    failures = replay(fn, _document["vectors"], lambda vector: call(*vector["args"]))
    assert not failures, f"{len(failures)} disagreement(s):\n" + "\n".join(failures[:3])
