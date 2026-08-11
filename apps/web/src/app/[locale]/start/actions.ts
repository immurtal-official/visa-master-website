"use server";

import type { Locale } from "next-intl";
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

export interface RouteCheckState {
  answers?: Partial<RouteCheck>;
  issues?: ValidationIssue[];
  verdict?: { supported: true } | { supported: false; reasons: UnsupportedReason[] };
  waitlisted?: boolean;
  failed?: boolean;
}

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

/** Create the draft, and go straight to it. */
export async function createApplication(formData: FormData): Promise<void> {
  const locale = localeOf(formData);
  const parsed = parseRouteCheck(answersOf(formData));

  // The gate runs again here rather than trusting the form that reached it:
  // the previous answer travelled through the browser, and this is the step
  // that creates something.
  if (!parsed.ok || !checkRoute(parsed.data).supported) {
    redirect(getPathname({ href: "/start", locale }));
  }

  if (!isSupabaseConfigured()) redirect(getPathname({ href: "/login", locale }));

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect(getPathname({ href: "/login", locale }));

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: userId,
      residence_area: parsed.data.residenceArea,
      destination: parsed.data.destination,
      purpose: parsed.data.purpose,
      employment: parsed.data.employment,
    })
    .select("id")
    .single();

  if (error || !data) redirect(getPathname({ href: "/dashboard", locale }));

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
  const verdict = parsed.ok ? checkRoute(parsed.data) : undefined;

  if (!parsed.ok) return { answers, issues: parsed.issues };
  if (!isSupabaseConfigured()) return { answers: parsed.data, verdict, failed: true };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  const { error } = await supabase.from("waitlist_entries").insert({
    user_id: claims?.claims?.sub ?? null,
    residence_area: parsed.data.residenceArea,
    destination: parsed.data.destination,
    purpose: parsed.data.purpose,
    employment: parsed.data.employment,
  });

  if (error) return { answers: parsed.data, verdict, failed: true };
  return { answers: parsed.data, verdict, waitlisted: true };
}
