"use server";

import type { Locale } from "next-intl";
import { parseEmail, parseOtpCode, type ValidationIssue } from "@visa-master/core";
import { redirect } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * What a sign-in step hands back to its screen.
 *
 * Two kinds of failure, kept apart on purpose. `issues` are rule failures,
 * carrying message keys the screen resolves against the active locale — the
 * rules themselves live in packages/core and are never restated here.
 * `authError` is a catalogue key for something the authentication service
 * reported; its own message is never shown, because it is written in one
 * language for developers.
 */
export type AuthErrorKey =
  "auth.notConfigured" | "auth.otp.failed" | "auth.otp.rateLimited" | "auth.otp.sendFailed";

export interface AuthState {
  step: "email" | "code";
  email?: string;
  issues?: ValidationIssue[];
  authError?: AuthErrorKey;
}

function localeOf(formData: FormData): Locale {
  return formData.get("locale") as Locale;
}

/** Send a sign-in code. Signing up and signing in are the same act here. */
export async function requestOtp(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");

  const parsed = parseEmail({ email });
  if (!parsed.ok) return { step: "email", email, issues: parsed.issues };

  if (!isSupabaseConfigured()) return { step: "email", email, authError: "auth.notConfigured" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    // Asking again too soon is the one failure worth naming precisely: it is
    // self-inflicted, it resolves on its own, and the useful instruction is to
    // wait rather than to try something different.
    const key: AuthErrorKey = error.status === 429 ? "auth.otp.rateLimited" : "auth.otp.sendFailed";
    return { step: "email", email: parsed.data.email, authError: key };
  }

  return { step: "code", email: parsed.data.email };
}

/** Check a code and open the session. */
export async function verifyOtp(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const code = String(formData.get("code") ?? "");

  // The address travels in a hidden field, so it is re-checked rather than
  // trusted: it is as much user input on this step as the code is.
  const parsedEmail = parseEmail({ email });
  if (!parsedEmail.ok) return { step: "email", issues: parsedEmail.issues };

  const parsedCode = parseOtpCode({ code });
  if (!parsedCode.ok) return { step: "code", email, issues: parsedCode.issues };

  if (!isSupabaseConfigured()) return { step: "code", email, authError: "auth.notConfigured" };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsedEmail.data.email,
    token: parsedCode.data.code,
    type: "email",
  });

  // A wrong code and an expired one get the same message on purpose: telling
  // someone which of the two it was tells an attacker the same thing.
  if (error) return { step: "code", email, authError: "auth.otp.failed" };

  // next/navigation's redirect throws, so this is the end of the action.
  // The path is built by the routing config rather than assembled by hand.
  redirect(getPathname({ href: "/dashboard", locale: localeOf(formData) }));
}

/**
 * One entry point for the sign-in form, dispatching on which button was used.
 *
 * A single action keeps a single piece of state: whichever button is pressed,
 * the screen that comes back knows which step it is on and which address it is
 * working with, so a resend never loses the typed address and going back to
 * change it never loses the rest.
 */
export async function submitLogin(previous: AuthState, formData: FormData): Promise<AuthState> {
  const intent = String(formData.get("intent") ?? "send");

  if (intent === "changeEmail") {
    return { step: "email", email: String(formData.get("email") ?? "") };
  }

  if (intent === "verify") return verifyOtp(previous, formData);

  // "send" from the first step, "resend" from the second: the same request,
  // and both land back on the code step.
  return requestOtp(previous, formData);
}

export async function signOut(formData: FormData): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(getPathname({ href: "/login", locale: localeOf(formData) }));
}
