import { describe, expect, it } from "vitest";
import { readQaVerdict } from "./qa";

/**
 * The shapes here are the real ones: `visa-master.qa.v2` as the agent repo's
 * toolchain writes it, and the smaller report the fake executor writes.
 */
describe("the QA gate", () => {
  it("accepts a pack that passed its own checks", () => {
    const verdict = readQaVerdict({
      schemaVersion: "visa-master.qa.v2",
      status: "passed",
      summary: { artifacts: 9, issues: 0 },
      issues: [],
    });

    expect(verdict).toEqual({ ok: true, status: "passed", issues: 0 });
  });

  it("accepts a pack that needs someone to look at the pages", () => {
    // This is the ordinary outcome, not a near-miss: the review gate exists
    // precisely to look at rendered pages.
    const verdict = readQaVerdict({
      schemaVersion: "visa-master.qa.v2",
      status: "visual-review-required",
      summary: { issues: 0 },
      issues: [],
      vision: { required: true, sheets: [{ file: "full-1.jpg" }] },
    });

    expect(verdict.ok).toBe(true);
  });

  it("rejects a pack whose own QA says it failed", () => {
    const verdict = readQaVerdict({
      schemaVersion: "visa-master.qa.v2",
      status: "failed",
      summary: { issues: 2 },
      issues: ["Bounded contact-sheet generation failed.", "PDF text extraction failed."],
    });

    expect(verdict).toMatchObject({
      ok: false,
      code: "qa_failed",
      detail: "qa reported failure with 2 issues",
    });
  });

  it("does not put the issue text in the detail", () => {
    // `jobs.error` is readable by the applicant's own session through RLS, and
    // issue strings name their files. The count is the part worth recording.
    const verdict = readQaVerdict({
      status: "failed",
      issues: ["passport-scan-chen.pdf is unreadable"],
    });

    expect(verdict.ok).toBe(false);
    if (verdict.ok) return;
    expect(verdict.detail).not.toContain("passport-scan-chen.pdf");
  });

  it("counts one issue in the singular", () => {
    const verdict = readQaVerdict({ status: "failed", issues: ["one thing"] });

    expect(verdict).toMatchObject({ detail: "qa reported failure with 1 issue" });
  });

  it("rejects a status it does not recognise, and calls it drift rather than a bad pack", () => {
    // The distinction is what an operator reads at three in the morning: a bad
    // pack is a bad day for the agent, an unknown status is the two repos
    // having stopped agreeing.
    const verdict = readQaVerdict({ status: "partially-ok", issues: [] });

    expect(verdict).toMatchObject({
      ok: false,
      code: "validation_failed",
      detail: 'qa reported an unknown status "partially-ok"',
    });
  });

  it("rejects `pass`, which the architecture document spells and no producer writes", () => {
    // v0.4 §3.2 and §3.3 both say `pass`; toolchain/qa.mjs writes `passed`.
    // Accepting both would bless a status nothing emits, so this pins the
    // discrepancy instead of hiding it.
    expect(readQaVerdict({ status: "pass", issues: [] })).toMatchObject({
      ok: false,
      code: "validation_failed",
    });
  });

  it("rejects a report that carries no status", () => {
    expect(readQaVerdict({ summary: { issues: 0 } })).toEqual({
      ok: false,
      code: "validation_failed",
      detail: "qa report carries no status",
    });
    expect(readQaVerdict({ status: "" })).toMatchObject({ ok: false });
    expect(readQaVerdict({ status: 200 })).toMatchObject({ ok: false });
  });

  it("rejects anything that is not a report at all", () => {
    // `typeof null` and `typeof []` are both "object": neither is paranoia.
    expect(readQaVerdict(null)).toEqual({
      ok: false,
      code: "validation_failed",
      detail: "qa report is not an object (null)",
    });
    expect(readQaVerdict("passed")).toMatchObject({
      code: "validation_failed",
      detail: "qa report is not an object (string)",
    });
    expect(readQaVerdict([{ status: "passed" }])).toMatchObject({
      code: "validation_failed",
      detail: "qa report is not an object (array)",
    });
  });

  it("rejects a report that contradicts itself", () => {
    // The producer sets `failed` if and only if it recorded issues, so this
    // combination cannot come from it — and a report we cannot trust is not
    // evidence that a pack is good.
    const verdict = readQaVerdict({ status: "passed", issues: ["something went wrong"] });

    expect(verdict).toMatchObject({
      ok: false,
      code: "validation_failed",
      detail: 'qa reported status "passed" but listed 1 issue',
    });
  });

  it("reads the issue count from the summary when there is no array", () => {
    expect(readQaVerdict({ status: "failed", summary: { issues: 3 } })).toMatchObject({
      detail: "qa reported failure with 3 issues",
    });
  });

  it("accepts the report the fake executor writes", () => {
    // The default local configuration runs the fake executor, so the gate must
    // not turn every developer's run red.
    expect(readQaVerdict({ status: "visual-review-required", issues: 0 })).toMatchObject({
      ok: true,
    });
  });
});
