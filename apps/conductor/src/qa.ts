/**
 * The gate between "the agent produced something" and "a person may look at it".
 *
 * The pack producer runs its own acceptance pass and writes the verdict into
 * `qa-report.json` — `visa-master.qa.v2` in the agent repo's toolchain, whose
 * status is `failed` when its checks found issues, `visual-review-required`
 * when a human has to look at rendered pages, and `passed` when neither. Until
 * this module existed the conductor collected that file and marked the job
 * succeeded without opening it, so a pack whose own QA said it had failed
 * arrived in the review queue indistinguishable from one that had not.
 *
 * Two of the three statuses are acceptable outcomes, not two of two: a pack
 * needing visual review is exactly what the review gate is for. Only `failed`
 * is a failure.
 *
 * The gate is closed by default. A report that cannot be read, or that says
 * something this conductor does not recognise, fails the job rather than
 * passing it on — "we could not tell" is not evidence that a pack is good, and
 * the cost of being wrong here is a customer submitting a broken application to
 * a consulate.
 *
 * What this gate is not: architecture v0.4 §3.3 puts the QA report fourth in a
 * six-step validation, after manifest role-completeness, recomputed checksums
 * and format sanity. Those three have nowhere to run yet — there is no
 * manifest — so a pack can still pass here and be missing a document the
 * applicant needs. Until the week-4 human review gate exists, this stops only
 * the case where the machine already knows it failed.
 *
 * On retrying: v0.4 §3.4 specifies one retry with the QA issues fed back into
 * the next attempt's input. That feedback channel does not exist, so a retry
 * here is a blind re-run and repeats the spend. It is left retryable anyway,
 * because that is what this taxonomy already does with every failure except
 * `budget_exceeded`, and a one-off bad render is the likeliest cause. Whoever
 * builds the feedback channel should revisit `isRetryable`, not just this note.
 */

/**
 * Statuses that mean the pack may go forward.
 *
 * These are the two the producer actually writes (toolchain/qa.mjs, the ternary
 * that computes `status`). Architecture v0.4 §3.2 and §3.3 spell the clean one
 * `pass` rather than `passed`; the runner is the authority here, so a gate
 * written from the document alone would reject every clean pack. The document
 * is wrong and is not edited here — v0.4 is superseded framing, and an
 * in-place edit is not how this repo amends decisions.
 */
const ACCEPTED = new Set(["passed", "visual-review-required"]);

/**
 * Why a pack was stopped, in the taxonomy `failJob` already speaks.
 *
 * The two are kept apart on purpose. `qa_failed` means the agent judged its own
 * work and found it wanting — a bad pack, and the retry may well produce a good
 * one. `validation_failed` means this conductor could not obtain a verdict at
 * all: a missing file, a parse error, a status from a schema nobody here knows.
 * That is contract drift or a broken run, and an operator reading the alert
 * needs to see the difference — one says the agent is having a bad day, the
 * other says the two repos have stopped agreeing.
 */
export type QaFailureCode = "qa_failed" | "validation_failed";

export type QaVerdict =
  | { ok: true; status: string; issues: number }
  | { ok: false; code: QaFailureCode; detail: string };

/**
 * Judge a parsed `qa-report.json`.
 *
 * `detail` is written for whoever reads `jobs.error` later, and deliberately
 * does not quote the report's issue text: that names the applicant's own files,
 * and the row is readable by the applicant's session through RLS. The count is
 * enough to know what happened; the report itself is in object storage.
 */
export function readQaVerdict(report: unknown): QaVerdict {
  if (report === null || typeof report !== "object" || Array.isArray(report)) {
    // `typeof null` and `typeof []` are both "object", so both are checked.
    return {
      ok: false,
      code: "validation_failed",
      detail: `qa report is not an object (${describe(report)})`,
    };
  }

  const record = report as Record<string, unknown>;
  const status = record.status;

  if (typeof status !== "string" || status.length === 0) {
    return { ok: false, code: "validation_failed", detail: "qa report carries no status" };
  }

  const issues = countIssues(record);

  if (status === "failed") {
    return {
      ok: false,
      code: "qa_failed",
      detail:
        issues === null || issues === 0
          ? `qa reported failure`
          : `qa reported failure with ${issues} ${plural(issues)}`,
    };
  }

  if (!ACCEPTED.has(status)) {
    // Any other string: a schema this conductor does not know. Stopping is
    // right — an unreadable verdict is not evidence of a good pack — but it is
    // not the same event as a pack that failed its own checks.
    return {
      ok: false,
      code: "validation_failed",
      detail: `qa reported an unknown status "${status}"`,
    };
  }

  // The producer sets `failed` if and only if it recorded issues, so an
  // accepted status alongside issues is a report contradicting itself — a
  // hand-edited file, a foreign producer, or a bug. Fail closed.
  if (issues !== null && issues > 0) {
    return {
      ok: false,
      code: "validation_failed",
      detail: `qa reported status "${status}" but listed ${issues} ${plural(issues)}`,
    };
  }

  return { ok: true, status, issues: issues ?? 0 };
}

/**
 * How many issues the report records, or null when it does not say.
 *
 * `visa-master.qa.v2` carries both an `issues` array and a `summary.issues`
 * count; the array is authoritative, the count is what the fake executor
 * writes.
 */
function countIssues(record: Record<string, unknown>): number | null {
  if (Array.isArray(record.issues)) return record.issues.length;
  if (typeof record.issues === "number") return record.issues;

  const summary = record.summary;
  if (summary !== null && typeof summary === "object") {
    const count = (summary as Record<string, unknown>).issues;
    if (typeof count === "number") return count;
  }

  return null;
}

function plural(count: number): string {
  return count === 1 ? "issue" : "issues";
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
