import { z } from "zod";
import { toResult, type ValidationResult } from "../validation/issue";

/**
 * Which routes the product serves, and how a request is turned away.
 *
 * V1 serves exactly one: a resident of the Chengdu consular district applying
 * for a Spanish Schengen personal-tourism visa, in employment. Everything else
 * is turned away here, before an application exists and before anyone pays.
 * That is deliberate — requirements, forms and evidence are per-route work, and
 * a route that has not been researched cannot be served honestly.
 *
 * These are rules, not model decisions, and they live in one place so the
 * screen and the server cannot disagree about who is served.
 */

/**
 * Areas the Chengdu consulate covers. Residence decides jurisdiction, so this
 * is what the question is really asking.
 */
export const CHENGDU_DISTRICT_AREAS = [
  "sichuan",
  "chongqing",
  "yunnan",
  "guizhou",
  "xizang",
] as const;

/** Areas offered in the route check. `other` stands for everywhere else. */
export const RESIDENCE_AREAS = [...CHENGDU_DISTRICT_AREAS, "other"] as const;
export type ResidenceArea = (typeof RESIDENCE_AREAS)[number];

/**
 * Destinations offered in the route check.
 *
 * Only Spain is served. The others are here so the answer to "can you help me?"
 * is a real answer rather than a form that only accepts one input — and so the
 * waiting list records where demand actually is.
 */
export const DESTINATIONS = ["ES", "FR", "IT", "DE", "NL", "PT", "GR", "other"] as const;
export type Destination = (typeof DESTINATIONS)[number];

export const PURPOSES = ["tourism", "family", "business", "conference"] as const;
export type Purpose = (typeof PURPOSES)[number];

export const EMPLOYMENT_STATUSES = ["employed", "student", "retired", "self_employed"] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const routeCheckSchema = z.object({
  residenceArea: z.enum(RESIDENCE_AREAS),
  destination: z.enum(DESTINATIONS),
  purpose: z.enum(PURPOSES),
  employment: z.enum(EMPLOYMENT_STATUSES),
});

export type RouteCheck = z.infer<typeof routeCheckSchema>;

export function parseRouteCheck(input: unknown): ValidationResult<RouteCheck> {
  return toResult(routeCheckSchema.safeParse(input), input);
}

/**
 * Why a route is not served.
 *
 * Each reason is a message key, because the screen has to say which part of
 * the answer was the problem — being turned away without knowing why is the
 * thing that makes someone assume the product is broken rather than early.
 */
export const UNSUPPORTED_REASONS = [
  "route.unsupported.reason.area",
  "route.unsupported.reason.destination",
  "route.unsupported.reason.purpose",
  "route.unsupported.reason.employment",
] as const;
export type UnsupportedReason = (typeof UNSUPPORTED_REASONS)[number];

export type RouteVerdict = { supported: true } | { supported: false; reasons: UnsupportedReason[] };

/** The one route served in V1. */
export const SUPPORTED_ROUTE = {
  destination: "ES",
  purpose: "tourism",
  employment: "employed",
} as const;

/**
 * Decide whether a route is served.
 *
 * Every failing part is reported, not just the first: someone who is both a
 * student and going to France should learn both now rather than one at a time.
 */
export function checkRoute(answers: RouteCheck): RouteVerdict {
  const reasons: UnsupportedReason[] = [];

  if (!(CHENGDU_DISTRICT_AREAS as readonly string[]).includes(answers.residenceArea)) {
    reasons.push("route.unsupported.reason.area");
  }
  if (answers.destination !== SUPPORTED_ROUTE.destination) {
    reasons.push("route.unsupported.reason.destination");
  }
  if (answers.purpose !== SUPPORTED_ROUTE.purpose) {
    reasons.push("route.unsupported.reason.purpose");
  }
  if (answers.employment !== SUPPORTED_ROUTE.employment) {
    reasons.push("route.unsupported.reason.employment");
  }

  return reasons.length === 0 ? { supported: true } : { supported: false, reasons };
}
