import type { $ZodIssue } from "zod/v4/core";
import { type MessageKey, isMessageKey } from "../i18n/message-keys";

export type IssueParams = Record<string, string | number>;

/**
 * A failed rule, as everything downstream sees it.
 *
 * There is deliberately no `message` field. A component that wants text calls
 * the catalogue with `key` and `params`; no component may carry its own copy of
 * a rule or of its wording.
 */
export interface ValidationIssue {
  /** Dot-path of the field that failed, e.g. `email`, `passport.expiryDate`. */
  path: string;
  /** A key from the registry — never free text. */
  key: MessageKey;
  /** ICU parameters for that key, e.g. `{ monthsRequired: 3 }`. */
  params?: IssueParams;
}

/** The payload a custom rule attaches so `toIssues` can recover its key. */
interface I18nIssueParams {
  i18n: {
    key: MessageKey;
    params?: IssueParams;
  };
}

/**
 * Attach a message key to a custom rule.
 *
 * Usage inside a schema:
 *
 * ```ts
 * .superRefine((value, ctx) => {
 *   if (tooSoon) ctx.addIssue(i18nIssue("validation.tooShort", { min: 6 }, ["code"]));
 * })
 * ```
 */
export function i18nIssue(key: MessageKey, params?: IssueParams, path?: (string | number)[]) {
  return {
    code: "custom" as const,
    params: { i18n: { key, ...(params ? { params } : {}) } } satisfies I18nIssueParams,
    ...(path ? { path } : {}),
    message: key,
  };
}

function hasI18nParams(value: unknown): value is I18nIssueParams {
  if (typeof value !== "object" || value === null || !("i18n" in value)) return false;
  const { i18n } = value as { i18n: unknown };
  return typeof i18n === "object" && i18n !== null && "key" in i18n && isMessageKey(i18n.key);
}

function pathOf(issue: $ZodIssue): string {
  return issue.path.map((segment) => String(segment)).join(".");
}

/**
 * Read the value at an issue's path out of the parsed input.
 *
 * Zod v4 does not carry the offending value on a finalized issue, and its
 * `message` — the only place the received type appears — must never be read.
 * Walking the original input is how a missing field is told apart from a
 * wrongly typed one without depending on English text.
 */
function valueAt(input: unknown, path: readonly PropertyKey[]): unknown {
  let current: unknown = input;
  for (const segment of path) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<PropertyKey, unknown>)[segment];
  }
  return current;
}

/**
 * Map one zod issue onto a registry key.
 *
 * Only the issue's structured fields are read. `issue.message` is deliberately
 * never consulted: it is a sentence in one language, which is exactly what must
 * not reach a user through this path.
 */
function keyFor(
  issue: $ZodIssue,
  input: unknown,
  hasInput: boolean,
): { key: MessageKey; params?: IssueParams } {
  if (issue.code === "custom" && hasI18nParams(issue.params)) {
    const { key, params } = issue.params.i18n;
    return params ? { key, params } : { key };
  }

  // An answer that is simply absent is reported as absent, whichever rule
  // happened to trip on it. Zod reports an unanswered multiple choice the same
  // way it reports a wrong one, and "fill this in" is the useful instruction
  // where "check this entry" is not.
  if (hasInput) {
    const value = valueAt(input, issue.path);
    if (value === undefined || value === null || value === "") {
      return { key: "validation.required" };
    }
  }

  switch (issue.code) {
    case "invalid_type": {
      // Without the input to consult, assume the field was absent: these
      // schemas parse submitted forms, where every present field arrives as a
      // string, so a type mismatch means nothing was sent.
      if (!hasInput) return { key: "validation.required" };
      const value = valueAt(input, issue.path);
      return value === undefined || value === null
        ? { key: "validation.required" }
        : { key: "validation.invalid" };
    }

    case "too_small": {
      if (issue.origin === "string" && issue.minimum === 1) {
        // An empty string after trimming is a missing answer, not a length
        // problem: "fill this in" is the useful instruction.
        return { key: "validation.required" };
      }
      return { key: "validation.tooShort", params: { min: Number(issue.minimum) } };
    }

    case "too_big":
      return { key: "validation.tooLong", params: { max: Number(issue.maximum) } };

    case "invalid_format":
      return issue.format === "email"
        ? { key: "validation.email.invalid" }
        : { key: "validation.invalid" };

    default:
      return { key: "validation.invalid" };
  }
}

/**
 * The one place zod issues become `ValidationIssue`s.
 *
 * Pass the value that was parsed as the second argument where it is available:
 * it is what lets a missing field be reported as missing rather than as
 * invalid. Anything unmapped falls back to the generic key rather than throwing
 * or leaking zod's own English message.
 */
export function toIssues(
  error: { issues: readonly $ZodIssue[] },
  ...input: [unknown] | []
): ValidationIssue[] {
  const hasInput = input.length === 1;
  return error.issues.map((issue) => ({
    path: pathOf(issue),
    ...keyFor(issue, input[0], hasInput),
  }));
}

/** Convenience for the common "parse, or hand the caller keys" shape. */
export type ValidationResult<T> = { ok: true; data: T } | { ok: false; issues: ValidationIssue[] };

export function toResult<T>(
  parsed: { success: true; data: T } | { success: false; error: { issues: readonly $ZodIssue[] } },
  ...input: [unknown] | []
): ValidationResult<T> {
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, issues: toIssues(parsed.error, ...input) };
}
