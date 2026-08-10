import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * The privileged client. It bypasses row-level security entirely.
 *
 * Its only legitimate users are the paths that act on the product's authority
 * rather than a person's: enqueueing a job after a quota check, writing
 * metering, moving a job through its state machine. Anything a user does about
 * their own data goes through the request-scoped server client, so the policies
 * stay in force.
 *
 * The import of server-only is load-bearing: it turns "this must never reach
 * the browser" from a comment into a build error. Nothing uses this yet — it
 * exists so the secret has one home from the start rather than being wired in
 * under time pressure alongside the first feature that needs it.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !secretKey) {
    throw new Error(
      "The privileged Supabase client needs NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SECRET_KEY. SUPABASE_SECRET_KEY is server-only — it must never " +
        "be given a NEXT_PUBLIC_ prefix.",
    );
  }

  return createSupabaseClient(SUPABASE_URL, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
