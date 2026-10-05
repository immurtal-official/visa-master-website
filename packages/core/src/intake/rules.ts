import { z } from "zod";
import { i18nIssue } from "../validation/issue";

/**
 * The rules the questionnaire is built from.
 *
 * Every rule lives here rather than on a screen: the same rule validates one
 * question as it is answered, validates the whole form before anything is
 * enqueued, and will validate it again in the conductor. A rule that existed
 * only in a component would be a second opinion about what a valid passport
 * number is, and this product exists to stop documents disagreeing with each
 * other.
 *
 * Each rule emits a message key plus parameters, never a sentence.
 *
 * questionnaire.ts names which rule each question uses. Adding a question
 * usually means reusing one of these; writing a new one means adding it here,
 * with its message key registered in i18n/message-keys.ts.
 */

/**
 * Every rule carries a name, so the intake contract can say which rule a
 * question uses without comparing code. A rule written inline in
 * questionnaire.ts has no name, which is fine for an extra question and a
 * contract change for a core one.
 */
const NAMES = new WeakMap<object, string>();

function named<T extends object>(name: string, rule: T): T {
  NAMES.set(rule, name);
  return rule;
}

/** The name a rule was registered under here, or undefined for an inline one. */
export function ruleName(rule: unknown): string | undefined {
  return (typeof rule === "object" && rule !== null) || typeof rule === "function"
    ? NAMES.get(rule)
    : undefined;
}

/** A date as three numbers, which is how it is entered and stored. */
const dateFormat = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/);
export const dateString = named("dateString", dateFormat);

export function parseDate(value: string): Date | null {
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

/** Free text between two lengths, trimmed. */
export const text = (min: number, max: number) =>
  named(`text(${min},${max})`, z.string().trim().min(min).max(max));

/** A date that has already happened, or is today. */
export const pastDate = named(
  "pastDate",
  dateString.superRefine((value, ctx) => {
    const date = parseDate(value);
    if (!date) {
      ctx.addIssue(i18nIssue("validation.date.invalid"));
      return;
    }
    if (date.getTime() > Date.now()) ctx.addIssue(i18nIssue("validation.date.future"));
  }),
);

export const pinyin = named(
  "pinyin",
  z
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
);

export const mobilePhone = named(
  "mobilePhone",
  z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .superRefine((value, ctx) => {
      // Mainland mobile numbers. Written down with spaces as often as not, so
      // they are stripped before checking rather than rejected.
      if (!/^1\d{10}$/.test(value)) ctx.addIssue(i18nIssue("validation.phone.invalid"));
    }),
);

export const passportNumber = named(
  "passportNumber",
  z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, "").toUpperCase())
    .superRefine((value, ctx) => {
      if (!/^[A-Z0-9]{9}$/.test(value)) {
        ctx.addIssue(i18nIssue("validation.passport.number.invalid", { length: 9 }));
      }
    }),
);

export const amountInYuan = named(
  "amountInYuan",
  z
    .string()
    .trim()
    .transform((value) => value.replace(/[,\s¥]/g, ""))
    .superRefine((value, ctx) => {
      if (!/^\d{1,9}(\.\d{1,2})?$/.test(value))
        ctx.addIssue(i18nIssue("validation.amount.invalid"));
    }),
);

/**
 * The expiry date, checked on its own.
 *
 * Whether a passport has enough validity left does not depend on any other
 * answer — it is this date against today — so it is checked the moment it is
 * given. Someone whose passport is too short should learn it here, not after
 * filling in six more sections. Only the comparison with the issue date waits,
 * because that genuinely needs the other side.
 */
export const passportExpiryAlone = named(
  "passportExpiryAlone",
  dateString.superRefine((value, ctx) => {
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
  }),
);

/**
 * Rules that relate two answers.
 *
 * They run when the whole form is checked, because until both sides exist
 * there is nothing to compare. Each receives the section's (or the form's)
 * answers after the per-question rules have normalised them.
 */
export type CrossCheck = (values: Record<string, unknown>, ctx: z.RefinementCtx) => void;

export const passportDatesCheck: CrossCheck = named("passportDatesCheck", (value, ctx) => {
  const issued = parseDate(value.issuedAt as string);
  const expires = parseDate(value.expiresAt as string);

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

export const travelDatesCheck: CrossCheck = named("travelDatesCheck", (value, ctx) => {
  const departure = parseDate(value.departureDate as string);
  const back = parseDate(value.returnDate as string);
  if (!departure) ctx.addIssue(i18nIssue("validation.date.invalid", undefined, ["departureDate"]));
  if (!back) ctx.addIssue(i18nIssue("validation.date.invalid", undefined, ["returnDate"]));
  if (!departure || !back) return;

  if (departure.getTime() < Date.now() - 86_400_000) {
    ctx.addIssue(i18nIssue("validation.date.past", undefined, ["departureDate"]));
  }
  if (back.getTime() < departure.getTime()) {
    ctx.addIssue(i18nIssue("validation.travel.returnBeforeDeparture", undefined, ["returnDate"]));
  }
});

/**
 * The real validity rule, now that the trip is known: three months beyond the
 * departure from the Schengen area. Until the return date existed this was
 * checked against today, which is the floor rather than the answer.
 */
export const passportOutlivesTripCheck: CrossCheck = named(
  "passportOutlivesTripCheck",
  (value, ctx) => {
    const passport = value.passport as Record<string, string> | undefined;
    const travel = value.travel as Record<string, string> | undefined;
    if (!passport || !travel) return;
    const expires = parseDate(passport.expiresAt!);
    const back = parseDate(travel.returnDate!);
    if (!expires || !back) return;

    if (monthsBetween(back, expires) < PASSPORT_VALIDITY_MONTHS) {
      ctx.addIssue(
        i18nIssue(
          "validation.passport.expiry.tooSoonForTrip",
          { monthsRequired: PASSPORT_VALIDITY_MONTHS },
          ["passport", "expiresAt"],
        ),
      );
    }
  },
);
