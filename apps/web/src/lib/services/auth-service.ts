import type { SupabaseClient } from "@supabase/supabase-js";
import { parseEmail, parseOtpCode } from "@visa-master/core";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { readSession } from "@/lib/supabase/session";
import { ServiceError, ValidationFailure } from "./errors";

/**
 * Sessions and sign-in, and the one authorization chokepoint.
 *
 * Every service that acts on somebody's behalf starts at requireUser(). It is
 * the architecture's authorize() chokepoint made concrete: the account must
 * still exist — a signature alone proves only that a token was once issued —
 * and whatever this function learns is what the rest of the request trusts.
 */

export interface AuthedUser {
  userId: string;
  email: string | null;
  /** The request-scoped client, so callers act under this user's own rows. */
  supabase: SupabaseClient;
}

export async function requireUser(): Promise<AuthedUser> {
  if (!isSupabaseConfigured()) throw new ServiceError("auth.notConfigured", 503);

  const supabase = await createClient();
  const session = await readSession(supabase);

  if (session.status === "unavailable") throw new ServiceError("errors.request", 503);
  if (session.status !== "signed-in") throw new ServiceError("route.sessionExpired", 401);

  return { userId: session.userId, email: session.email, supabase };
}

/** Like requireUser, but a signed-out caller is a state, not a failure. */
export async function currentUser(): Promise<AuthedUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const session = await readSession(supabase);
  if (session.status !== "signed-in") return null;
  return { userId: session.userId, email: session.email, supabase };
}

export const authService = {
  /** Send a sign-in code. Signing up and signing in are the same act here. */
  async requestOtp(input: unknown): Promise<{ email: string }> {
    const parsed = parseEmail(input);
    if (!parsed.ok) throw new ValidationFailure(parsed.issues);

    if (!isSupabaseConfigured()) throw new ServiceError("auth.notConfigured", 503);

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      // Asking again too soon is the one failure worth naming precisely: it is
      // self-inflicted, it resolves on its own, and the useful instruction is
      // to wait rather than to try something different.
      if (error.status === 429) throw new ServiceError("auth.otp.rateLimited", 429);
      throw new ServiceError("auth.otp.sendFailed", 502);
    }

    return { email: parsed.data.email };
  },

  /**
   * Check a code and open the session.
   *
   * The session lands in cookies because this runs in a route handler on the
   * web client's behalf; a native client calling the same endpoint gets the
   * cookies too and may ignore them in favour of the tokens Supabase's own
   * endpoint hands it. The address is re-checked rather than trusted — on this
   * step it is as much user input as the code is.
   */
  async verifyOtp(input: { email?: unknown; code?: unknown }): Promise<void> {
    const parsedEmail = parseEmail({ email: input.email });
    if (!parsedEmail.ok) throw new ValidationFailure(parsedEmail.issues);

    const parsedCode = parseOtpCode({ code: input.code });
    if (!parsedCode.ok) throw new ValidationFailure(parsedCode.issues);

    if (!isSupabaseConfigured()) throw new ServiceError("auth.notConfigured", 503);

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: parsedEmail.data.email,
      token: parsedCode.data.code,
      type: "email",
    });

    if (error) {
      // A wrong code and an expired one get the same message on purpose:
      // telling someone which it was tells an attacker the same thing. Being
      // unable to check at all is different — "that code is wrong" would send
      // someone hunting for a mistake they did not make.
      const status = error.status ?? 0;
      if (status === 429) throw new ServiceError("auth.otp.rateLimited", 429);
      if (status >= 500 || status === 0) {
        console.error("verifyOtp: could not reach the auth service", { status });
        throw new ServiceError("auth.otp.checkFailed", 502);
      }
      throw new ServiceError("auth.otp.failed", 401);
    }
  },

  /**
   * End the session. Only report success if it actually ended — the sign-in
   * screen is the universal signal for "you are signed out", and showing it
   * while the session lives is the lie that matters on a shared computer.
   */
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("signOut: failed", { status: error.status, message: error.message });
      throw new ServiceError("auth.signOutFailed", 502);
    }
  },
};
