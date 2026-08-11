"use server";

import type { Locale } from "next-intl";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkRoute,
  parseRouteCheck,
  type RouteCheck,
  type UnsupportedReason,
  type ValidationIssue,
} from "@visa-master/core";
import { getPathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { readSession } from "@/lib/supabase/session";

/** Failures a screen can be told about, as catalogue keys. */
export type RouteErrorKey =
  "route.createFailed" | "route.sessionExpired" | "route.waitlistFailed" | "auth.notConfigured";

export interface RouteCheckState {
  answers?: Partial<RouteCheck>;
  issues?: ValidationIssue[];
  verdict?: { supported: true } | { supported: false; reasons: UnsupportedReason[] };
  waitlisted?: boolean;
  error?: RouteErrorKey;
}

/**
 * Where a route check waits while somebody signs in.
 *
 * The route check is deliberately readable signed out, so the person most
 * likely to answer it has no account yet. Sending them to sign in and losing
 * four answers on the way would teach them that this product forgets what they
 * tell it — the opposite of what it is selling.
 */
const PENDING_COOKIE = "vm_route_check";
const PENDING_MAX_AGE = 60 * 60;

function localeOf(formData: FormData): Locale {
  return formData.get("locale") as Locale;
}

function answersOf(formData: FormData): Partial<RouteCheck> {
  return {
    residenceArea: (formData.get("residenceArea") as RouteCheck["residenceArea"]) || undefined,
    destination: (formData.get("destination") as RouteCheck["destination"]) || undefined,
    purpose: (formData.get("purpose") as RouteCheck["purpose"]) || undefined,
    employment: (formData.get("employment") as RouteCheck["employment"]) || undefined,
  };
}

/** Read back a route check that was parked while its owner signed in. */
export async function readPendingRouteCheck(): Promise<RouteCheck | null> {
  const raw = (await cookies()).get(PENDING_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = parseRouteCheck(JSON.parse(raw));
    return parsed.ok ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function clearPendingRouteCheck(): Promise<void> {
  (await cookies()).delete(PENDING_COOKIE);
}

/**
 * Answer "can you help me?" before anything is created.
 *
 * The gate lives in packages/core, so this only collects the answers and
 * reports what it decided. An unsupported combination never becomes an
 * application — it is a result of the check, not a state of the funnel.
 */
export async function checkRouteAction(
  _previous: RouteCheckState,
  formData: FormData,
): Promise<RouteCheckState> {
  const answers = answersOf(formData);

  const parsed = parseRouteCheck(answers);
  if (!parsed.ok) return { answers, issues: parsed.issues };

  return { answers: parsed.data, verdict: checkRoute(parsed.data) };
}

/**
 * Create the application.
 *
 * Failure and success are different destinations. They were the same one, and
 * the result was that a foreign-key error looked exactly like a fresh account
 * with nothing in it: the reader was told the route was supported, pressed the
 * button, and arrived at "you do not have any applications yet".
 */
export async function createApplication(
  previous: RouteCheckState,
  formData: FormData,
): Promise<RouteCheckState> {
  const locale = localeOf(formData);
  const answers = answersOf(formData);
  const parsed = parseRouteCheck(answers);

  // The gate runs again here rather than trusting the form that reached it:
  // the previous answer travelled through the browser, and this is the step
  // that creates something.
  if (!parsed.ok) return { answers, issues: parsed.issues };

  const verdict = checkRoute(parsed.data);
  if (!verdict.supported) return { answers: parsed.data, verdict };

  const supported = { answers: parsed.data, verdict } satisfies RouteCheckState;

  if (!isSupabaseConfigured()) return { ...supported, error: "auth.notConfigured" };

  const supabase = await createClient();
  const session = await readSession(supabase);

  if (session.status !== "signed-in") {
    // Park the answers before sending anyone to sign in, so they come back to
    // the card they were on rather than to an empty form.
    (await cookies()).set(PENDING_COOKIE, JSON.stringify(parsed.data), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: PENDING_MAX_AGE,
    });
    redirect(getPathname({ href: "/login", locale }));
  }

  const { error } = await supabase.from("applications").insert({
    user_id: session.userId,
    residence_area: parsed.data.residenceArea,
    destination: parsed.data.destination,
    purpose: parsed.data.purpose,
    employment: parsed.data.employment,
  });

  if (error) {
    console.error("createApplication: insert failed", {
      code: error.code,
      message: error.message,
      userId: session.userId,
    });
    return { ...supported, error: "route.createFailed" };
  }

  await clearPendingRouteCheck();
  redirect(getPathname({ href: "/dashboard", locale }));
}

/**
 * Record that someone needed a route we do not serve.
 *
 * Only the two fields that describe the demand are kept. Signing in is not
 * required to be counted, and the list cannot be read back by anyone.
 */
export async function joinWaitlist(
  _previous: RouteCheckState,
  formData: FormData,
): Promise<RouteCheckState> {
  const answers = answersOf(formData);
  const parsed = parseRouteCheck(answers);
  if (!parsed.ok) return { answers, issues: parsed.issues };

  const verdict = checkRoute(parsed.data);
  const base = { answers: parsed.data, verdict } satisfies RouteCheckState;

  if (!isSupabaseConfigured()) return { ...base, error: "auth.notConfigured" };

  const supabase = await createClient();
  const session = await readSession(supabase);

  const { error } = await supabase.from("waitlist_entries").insert({
    user_id: session.status === "signed-in" ? session.userId : null,
    residence_area: parsed.data.residenceArea,
    destination: parsed.data.destination,
    purpose: parsed.data.purpose,
    employment: parsed.data.employment,
  });

  if (error) {
    console.error("joinWaitlist: insert failed", { code: error.code, message: error.message });
    return { ...base, error: "route.waitlistFailed" };
  }

  return { ...base, waitlisted: true };
}
