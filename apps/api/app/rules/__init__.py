"""The product's rules, as this service runs them (ADR-005).

packages/core is the only place a rule is written. Its data — the questionnaire,
the checklist, the route gate's tables — arrives as `generated/intake.json`;
its named rules and evaluators are implemented again here, and the conformance
vectors in packages/core/conformance/ hold this implementation to that one.

Rules that depend on today take `now`, in milliseconds since the epoch, so the
service passes the clock in and the tests pin it.
"""

from .auth import parse_email, parse_otp_code
from .documents import (
    document_completeness,
    documents_for,
    documents_for_job,
    extractable_fields,
)
from .intake import (
    asked_answers,
    asked_path,
    condition_holds,
    contract,
    find_asked_question,
    has_answer,
    intake_progress,
    next_question,
    parse_intake,
    parse_question,
    placeholder_issues,
    read_answer,
    resume_point,
    section_state,
    sections,
)
from .route import check_route, parse_route_check

__all__ = [
    "asked_answers",
    "asked_path",
    "check_route",
    "condition_holds",
    "contract",
    "document_completeness",
    "documents_for",
    "documents_for_job",
    "extractable_fields",
    "find_asked_question",
    "has_answer",
    "intake_progress",
    "next_question",
    "parse_email",
    "parse_intake",
    "parse_otp_code",
    "parse_question",
    "parse_route_check",
    "placeholder_issues",
    "read_answer",
    "resume_point",
    "section_state",
    "sections",
]
