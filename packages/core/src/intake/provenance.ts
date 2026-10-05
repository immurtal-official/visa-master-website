import type { ValidationIssue } from "../validation/issue";
import { hasAnswer } from "./answers";
import { askedPath } from "./sections";

/**
 * Placeholder answers: values that are in the form but are not yet the
 * applicant's answer.
 *
 * An answer proposed from a document — read off the passport scan, say — is
 * stored like any other so the form can show it, and recorded in
 * answer_sources as `document` until the applicant confirms it by looking at
 * the question and pressing Continue. Until then it is a placeholder, and the
 * submission refuses to send it: a pack built on a misread passport number is
 * worse than no pack.
 *
 * An answer with no source row predates the record and was typed.
 */

export interface AnswerSource {
  path: string;
  source: "applicant" | "document";
  confirmed_at: string | null;
}

export function isPlaceholder(source: AnswerSource | undefined): boolean {
  return source?.source === "document" && !source.confirmed_at;
}

/**
 * One issue per asked, answered question whose answer is still a placeholder.
 * Questions not asked are left out with their answers, so a placeholder in a
 * closed branch blocks nothing.
 */
export function placeholderIssues(answers: unknown, sources: AnswerSource[]): ValidationIssue[] {
  const byPath = new Map(sources.map((source) => [source.path, source]));
  return askedPath(answers)
    .filter((question) => hasAnswer(answers, question.path))
    .filter((question) => isPlaceholder(byPath.get(question.path)))
    .map((question) => ({ path: question.path, key: "validation.answer.unconfirmed" as const }));
}
