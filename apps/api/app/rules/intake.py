"""The questionnaire, its conditions, and the whole-form check, read from packages/core.

Everything about which questions exist, in what order, when each is asked and
which rule each must meet comes from `generated/intake.json`, which
packages/core writes (`pnpm intake:export`). Nothing here names a section or a
question: a question added in questionnaire.ts reaches this service with the
regenerated file and no code change. Only the evaluators are written here, each
mirroring its TypeScript original in packages/core/src/intake/.
"""

from __future__ import annotations

import json
from functools import cache
from pathlib import Path
from typing import Any

from . import named
from .engine import UNDEFINED, Context, Enum, Never, Object, Schema, safe_parse, to_json

DATA_FILE = Path(__file__).parent / "generated" / "intake.json"


@cache
def data() -> dict[str, Any]:
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def contract() -> dict[str, Any]:
    """The intake contract's version and checksum, which every job records."""
    return data()["contract"]


def sections() -> list[dict[str, Any]]:
    """INTAKE_SECTIONS: every section, with each question's id, path and condition."""
    return [
        {
            "id": section["id"],
            "kind": section["kind"],
            "questions": section.get("questions", []),
            "available": section.get("available", True),
            **({"showIf": section["showIf"]} if "showIf" in section else {}),
        }
        for section in data()["sections"]
    ]


def _question_view(question: dict[str, Any]) -> dict[str, Any]:
    """An IntakeQuestion: what the navigation reads about a question."""
    return {
        "id": question["id"],
        "path": question["path"],
        **({"showIf": question["showIf"]} if "showIf" in question else {}),
    }


# --- answers and conditions (answers.ts, condition.ts) ----------------------


def read_answer(answers: Any, path: str) -> Any:
    value = answers
    for key in path.split("."):
        if not isinstance(value, dict):
            return UNDEFINED
        value = value.get(key, UNDEFINED)
    return value


def has_answer(answers: Any, path: str) -> bool:
    value = read_answer(answers, path)
    return value is not UNDEFINED and value is not None and value != ""


def condition_holds(condition: dict[str, Any], answers: Any) -> bool:
    if "all" in condition:
        return all(condition_holds(c, answers) for c in condition["all"])
    if "any" in condition:
        return any(condition_holds(c, answers) for c in condition["any"])
    if "not" in condition:
        return not condition_holds(condition["not"], answers)

    value = read_answer(answers, condition["answer"])
    if not isinstance(value, str):
        return False
    return value == condition["is"] if "is" in condition else value in condition["in"]


# --- which questions are asked (sections.ts) --------------------------------


def is_asked(section: dict[str, Any], question: dict[str, Any], answers: Any) -> bool:
    if not section["available"] or section["kind"] != "questions":
        return False
    if "showIf" in section and not condition_holds(section["showIf"], answers):
        return False
    return "showIf" not in question or condition_holds(question["showIf"], answers)


def asked_questions(section: dict[str, Any], answers: Any) -> list[dict[str, Any]]:
    return [_question_view(q) for q in section["questions"] if is_asked(section, q, answers)]


def asked_path(answers: Any) -> list[dict[str, Any]]:
    return [
        {"sectionId": section["id"], **question}
        for section in sections()
        for question in asked_questions(section, answers)
    ]


def find_asked_question(section_id: str, question_id: str, answers: Any) -> dict | None:
    section = next((s for s in sections() if s["id"] == section_id), None)
    if section is None:
        return None
    question = next((q for q in section["questions"] if q["id"] == question_id), None)
    if question is None or not is_asked(section, question, answers):
        return None
    return _question_view(question)


def intake_progress(answers: Any) -> dict[str, int]:
    asked = asked_path(answers)
    return {
        "answered": sum(1 for q in asked if has_answer(answers, q["path"])),
        "total": len(asked),
    }


def section_state(section: dict[str, Any], answers: Any) -> str:
    if not section["available"]:
        return "unavailable"
    if section["kind"] == "review":
        rest = intake_progress(answers)
        return "done" if rest["answered"] == rest["total"] else "todo"

    asked = asked_questions(section, answers)
    if not asked:
        return "notNeeded"
    answered = sum(1 for q in asked if has_answer(answers, q["path"]))
    if answered == 0:
        return "todo"
    return "done" if answered == len(asked) else "inProgress"


def resume_point(answers: Any, last_step: str | None) -> dict[str, str] | None:
    if last_step:
        section_id, _, question_id = last_step.partition("/")
        question_id = question_id.split("/")[0]
        if find_asked_question(section_id, question_id, answers):
            return {"sectionId": section_id, "questionId": question_id}

    first = next((q for q in asked_path(answers) if not has_answer(answers, q["path"])), None)
    return {"sectionId": first["sectionId"], "questionId": first["id"]} if first else None


def next_question(section_id: str, question_id: str, answers: Any) -> dict[str, str] | None:
    every = [(s, q) for s in sections() for q in s["questions"]]
    index = next(
        (i for i, (s, q) in enumerate(every) if s["id"] == section_id and q["id"] == question_id),
        None,
    )
    if index is None:
        return None
    for section, question in every[index + 1 :]:
        if is_asked(section, question, answers):
            return {"sectionId": section["id"], "questionId": question["id"]}
    return None


def asked_answers(answers: Any) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for question in asked_path(answers):
        path = question["path"]
        if not has_answer(answers, path):
            continue
        *keys, last = path.split(".")
        node = result
        for key in keys:
            node = node.setdefault(key, {})
        node[last] = read_answer(answers, path)
    return result


# --- rules (schengen-tourism-v1.ts) -----------------------------------------


def _question_rule(question: dict[str, Any], alone: bool = False) -> Schema:
    if question["kind"] == "choice":
        options = data()["optionGroups"].get(question["options"])
        return Enum(options) if options else Never()
    if alone and question.get("alone"):
        return named.rule(question["alone"])
    return named.rule(question["rule"])


def _questions() -> list[tuple[dict[str, Any], dict[str, Any]]]:
    return [(s, q) for s in data()["sections"] if s["kind"] == "questions" for q in s["questions"]]


def _context(now: int) -> Context:
    return Context(now=now)


def parse_question(path: str, value: Any, *, now: int) -> dict[str, Any]:
    """Validate one answer as it is given, with the rule its own page uses."""
    question = next((q for _, q in _questions() if q["path"] == path), None)
    if question is None:
        # Nothing in the intake reaches this; packages/core accepts it unchanged.
        return {"ok": True, "data": value}
    return _json(safe_parse(_question_rule(question, alone=True), value, _context(now)))


def _object_of(questions: list[dict[str, Any]]) -> dict[str, Schema]:
    return {q["id"]: _question_rule(q) for q in questions}


def form_schema(asked: set[str]) -> Schema:
    """The whole form as asked of one set of answers (formSchema in TypeScript)."""
    shape: dict[str, Schema] = {}
    extras: dict[str, Schema] = {}
    for section in data()["sections"]:
        if section["kind"] != "questions":
            continue
        core = [q for q in section["questions"] if not q["extra"]]
        core_asked = [q for q in core if q["path"] in asked]
        if core_asked:
            checks = (
                [named.cross_check(section["check"])]
                if section.get("check") and len(core_asked) == len(core)
                else []
            )
            shape[section["id"]] = Object(_object_of(core_asked), *checks)
        extra_asked = [q for q in section["questions"] if q["extra"] and q["path"] in asked]
        if extra_asked:
            extras[section["id"]] = Object(_object_of(extra_asked))
    if extras:
        shape["extra"] = Object(extras)
    form_check = data().get("formCheck")
    return Object(shape, *([named.cross_check(form_check)] if form_check else []))


def parse_intake(answers: Any, *, now: int) -> dict[str, Any]:
    """The whole form, checked at once, before anything is enqueued."""
    asked = {q["path"] for q in asked_path(answers)}
    return _json(safe_parse(form_schema(asked), answers, _context(now)))


def placeholder_issues(answers: Any, sources: list[dict[str, Any]]) -> list[dict[str, str]]:
    """provenance.ts: one issue per asked, answered question still holding a proposal."""
    by_path = {source["path"]: source for source in sources}
    return [
        {"path": q["path"], "key": "validation.answer.unconfirmed"}
        for q in asked_path(answers)
        if has_answer(answers, q["path"]) and _is_placeholder(by_path.get(q["path"]))
    ]


def _is_placeholder(source: dict[str, Any] | None) -> bool:
    return (
        source is not None and source.get("source") == "document" and not source.get("confirmed_at")
    )


def _json(result: dict[str, Any]) -> dict[str, Any]:
    return to_json(result)
