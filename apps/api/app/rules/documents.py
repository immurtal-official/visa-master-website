"""The document checklist (packages/core/src/rules/schengen-spain.ts), read from its export."""

from __future__ import annotations

from typing import Any

from .intake import condition_holds, data


def documents() -> list[dict[str, Any]]:
    return data()["documents"]


def documents_for(answers: Any) -> list[dict[str, Any]]:
    """The documents this particular application has to provide."""
    return [
        document
        for document in documents()
        if "appliesWhen" not in document or condition_holds(document["appliesWhen"], answers)
    ]


def document_completeness(answers: Any, uploads: list[dict[str, Any]]) -> dict[str, Any]:
    """What is still outstanding. Only a confirmed (`stored`) upload counts."""
    stored = {u["document"] for u in uploads if u["status"] == "stored"}
    announced = {u["document"] for u in uploads if u["status"] == "pending"}
    needed = [d for d in documents_for(answers) if d["necessity"] != "recommended"]
    missing = [d["id"] for d in needed if d["id"] not in stored]
    pending = [d["id"] for d in needed if d["id"] not in stored and d["id"] in announced]
    return {"missing": missing, "pending": pending, "complete": not missing}


def documents_for_job(answers: Any, uploads: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """The documents a job is given: references, in checklist then page order."""
    needed = [d["id"] for d in documents_for(answers)]
    chosen = [u for u in uploads if u["status"] == "stored" and u["document"] in needed]
    chosen.sort(key=lambda u: (needed.index(u["document"]), u["page"]))
    return [
        {
            "uploadId": u["id"],
            "document": u["document"],
            "page": u["page"],
            "contentType": u["content_type"],
        }
        for u in chosen
    ]


def extractable_fields(document_id: str) -> list[str]:
    """The answers a document can supply when it is read; none for most."""
    document = next((d for d in documents() if d["id"] == document_id), None)
    return list(document.get("extracts", [])) if document else []
