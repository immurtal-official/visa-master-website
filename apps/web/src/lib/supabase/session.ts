import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Who is signed in, as far as a protected page may trust.
 *
 * `getClaims()` verifies a token's signature and nothing else. That proves the
 * token was issued by this project and has not been tampered with — it does not
 * prove the account still exists or is still allowed in. A deleted user's token
 * stays cryptographically valid until it expires, and a suspended user's does
 * too, so a page that gates on claims alone shows both of them a working
 * product where every write fails.
 *
 * `getUser()` asks the auth service, which is the only party that knows. It
 * costs a round trip, and that is the price of the answer being true.
 */
export type SessionState =
  /** Verified, and the account exists. */
  | { status: "signed-in"; userId: string; email: string | null }
  /** No session, or one the auth service rejects. */
  | { status: "signed-out" }
  /** The auth service could not be reached. Not the same as signed out. */
  | { status: "unavailable" };

export async function readSession(supabase: SupabaseClient): Promise<SessionState> {
  const { data, error } = await supabase.auth.getUser();

  if (data?.user) {
    return { status: "signed-in", userId: data.user.id, email: data.user.email ?? null };
  }

  // The auth service answers "this user does not exist" with a 4xx; anything
  // else — an outage, a network fault — must not be reported as being signed
  // out, or a transient failure signs everybody out at once.
  const status = error?.status ?? 0;
  if (status >= 400 && status < 500) return { status: "signed-out" };
  if (!error) return { status: "signed-out" };

  return { status: "unavailable" };
}
