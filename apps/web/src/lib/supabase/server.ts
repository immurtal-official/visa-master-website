import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, assertSupabaseConfigured } from "./config";

/**
 * A server client, scoped to one request.
 *
 * Never hoist this into a module-level singleton. Each caller gets its own
 * because the client holds that request's cookies, and sharing one across
 * requests hands one visitor another visitor's session.
 *
 * This client acts as the signed-in user, so reads are still filtered by
 * row-level security — which is what makes a query like "the current user's
 * profile" safe to write without a manual ownership check.
 */
export async function createClient() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The session refresh in the
          // proxy layer has already written them, so there is nothing to do
          // here and nothing lost by ignoring it.
        }
      },
    },
  });
}
