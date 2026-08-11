import { z } from "zod";
import { i18nIssue, toResult, type ValidationResult } from "../validation/issue";

/**
 * The intake answers, and the rules over them.
 *
 * Every rule lives here rather than on a screen: the same schema validates one
 * question as it is answered, validates the whole form before anything is
 * enqueued, and will validate it again in the conductor. A rule that existed
 * only in a component would be a second opinion about what a valid passport
 * number is, and this product exists to stop documents disagreeing with each
 * other.
 *
 * Each rule emits a message key plus parameters, never a sentence.
 */

/** How keyboards should behave for a field, derived from what it holds. */
export interface FieldBehaviour {
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal";
  autoComplete?: string;
  autoCapitalize?: "off" | "characters";
  autoCorrect?: "off";
  /** Rendered as three numeric fields rather than a picker. */
  kind?: "date";
  /** Uppercase as it is typed, for fields that are uppercase on the document. */
  uppercase?: boolean;
  maxLength?: number;
}

export const FIELD_BEHAVIOUR: Record<string, FieldBehaviour> = {
  "applicant.name": { inputMode: "text", autoComplete: "name" },
  "applicant.pinyin": {
    inputMode: "text",
    autoComplete: "off",
    autoCapitalize: "characters",
    autoCorrect: "off",
    uppercase: true,
  },
  "applicant.birthDate": { kind: "date", autoComplete: "bday" },
  "applicant.phone": { inputMode: "tel", autoComplete: "tel", maxLength: 20 },
  "passport.number": {
    inputMode: "text",
    autoComplete: "off",
    autoCapitalize: "characters",
    autoCorrect: "off",
    uppercase: true,
    maxLength: 9,
  },
  "passport.issuedAt": { kind: "date" },
  "passport.expiresAt": { kind: "date" },
};

/** A date as three numbers, which is how it is entered and stored. */
const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/);

function parseDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth()) -
    (to.getUTCDate() < from.getUTCDate() ? 1 : 0)
  );
}

/**
 * A passport must outlive the trip by a margin the consulate sets.
 *
 * Three months beyond the intended departure from the Schengen area is the
 * rule. Travel dates are asked for later in the form, so until they are known
 * this is checked against today — which is the floor, never the whole answer,
 * and the same rule runs again with the real return date once it exists.
 */
export const PASSPORT_VALIDITY_MONTHS = 3;

export const applicantSchema = z.object({
  name: z.string().trim().min(1).max(60),
  pinyin: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .transform((value) => value.toUpperCase())
    .superRefine((value, ctx) => {
      // Latin letters, spaces and hyphens: what a passport's machine-readable
      // line can hold. A Chinese character here means the wrong field.
      if (!/^[A-Z\s-]+$/.test(value)) ctx.addIssue(i18nIssue("validation.pinyin.invalid"));
    }),
  birthDate: dateString.superRefine((value, ctx) => {
    const date = parseDate(value);
    if (!date) {
      ctx.addIssue(i18nIssue("validation.date.invalid"));
      return;
    }
    if (date.getTime() > Date.now()) ctx.addIssue(i18nIssue("validation.date.future"));
  }),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .superRefine((value, ctx) => {
      // Mainland mobile numbers. Written down with spaces as often as not, so
      // they are stripped before checking rather than rejected.
      if (!/^1\d{10}$/.test(value)) ctx.addIssue(i18nIssue("validation.phone.invalid"));
    }),
});

/**
 * The passport fields on their own.
 *
 * Kept separate from the rules that relate them, so one answer can be checked
 * as it is given while the cross-field rules wait until both of their sides
 * exist.
 */
export const passportFieldsSchema = z.object({
  number: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, "").toUpperCase())
    .superRefine((value, ctx) => {
      if (!/^[A-Z0-9]{9}$/.test(value)) {
        ctx.addIssue(i18nIssue("validation.passport.number.invalid", { length: 9 }));
      }
    }),
  issuedAt: dateString,
  expiresAt: dateString,
});

export const passportSchema = passportFieldsSchema.superRefine((value, ctx) => {
  const issued = parseDate(value.issuedAt);
  const expires = parseDate(value.expiresAt);

  if (!issued) ctx.addIssue(i18nIssue("validation.date.invalid", undefined, ["issuedAt"]));
  if (!expires) ctx.addIssue(i18nIssue("validation.date.invalid", undefined, ["expiresAt"]));
  if (!issued || !expires) return;

  if (issued.getTime() > Date.now()) {
    ctx.addIssue(i18nIssue("validation.date.future", undefined, ["issuedAt"]));
  }
  if (expires.getTime() <= issued.getTime()) {
    ctx.addIssue(i18nIssue("validation.passport.expiry.beforeIssue", undefined, ["expiresAt"]));
  }
  if (monthsBetween(new Date(), expires) < PASSPORT_VALIDITY_MONTHS) {
    ctx.addIssue(
      i18nIssue(
        "validation.passport.expiry.tooSoon",
        { monthsRequired: PASSPORT_VALIDITY_MONTHS },
        ["expiresAt"],
      ),
    );
  }
});

/** The whole intake. Partial while it is being filled in. */
export const intakeSchengenTourismV1 = z.object({
  applicant: applicantSchema,
  passport: passportSchema,
});

export type IntakeSchengenTourismV1 = z.infer<typeof intakeSchengenTourismV1>;

/**
 * Validate one answer, as it is given.
 *
 * The step schemas are picked out of the whole rather than written twice, so a
 * rule cannot be stricter on its own page than it is at submission.
 */
const QUESTION_SCHEMAS: Record<string, z.ZodType> = {
  "applicant.name": applicantSchema.shape.name,
  "applicant.pinyin": applicantSchema.shape.pinyin,
  "applicant.birthDate": applicantSchema.shape.birthDate,
  "applicant.phone": applicantSchema.shape.phone,
};

/**
 * The expiry date, checked on its own.
 *
 * Whether a passport has enough validity left does not depend on any other
 * answer — it is this date against today — so it is checked the moment it is
 * given. Someone whose passport is too short should learn it here, not after
 * filling in six more sections. Only the comparison with the issue date waits,
 * because that genuinely needs the other side.
 */
const expiresAtSchema = dateString.superRefine((value, ctx) => {
  const expires = parseDate(value);
  if (!expires) {
    ctx.addIssue(i18nIssue("validation.date.invalid"));
    return;
  }
  if (monthsBetween(new Date(), expires) < PASSPORT_VALIDITY_MONTHS) {
    ctx.addIssue(
      i18nIssue("validation.passport.expiry.tooSoon", {
        monthsRequired: PASSPORT_VALIDITY_MONTHS,
      }),
    );
  }
});

/**
 * Validate one answer with the same rules the whole form uses.
 *
 * Only rules that need another answer are held back until it exists.
 */
export function parseQuestion(path: string, value: unknown): ValidationResult<unknown> {
  const schema = QUESTION_SCHEMAS[path];
  if (schema) return toResult(schema.safeParse(value), value);

  // Passport fields: validate the field's own shape now; the relationships
  // between them are checked by parsePassport once all three are present.
  if (path === "passport.number") {
    return toResult(passportFieldsSchema.shape.number.safeParse(value), value);
  }
  if (path === "passport.issuedAt") return toResult(dateString.safeParse(value), value);
  if (path === "passport.expiresAt") return toResult(expiresAtSchema.safeParse(value), value);

  return { ok: true, data: value };
}

export function parseApplicant(input: unknown) {
  return toResult(applicantSchema.safeParse(input), input);
}

export function parsePassport(input: unknown) {
  return toResult(passportSchema.safeParse(input), input);
}
