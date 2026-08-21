import { checkRoute, parseRouteCheck, type RouteCheck, type RouteVerdict } from "@visa-master/core";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { currentUser } from "./auth-service";
import { ServiceError, ValidationFailure } from "./errors";

/**
 * The route gate, and the waiting list for routes we do not serve.
 *
 * The gate itself is a pure rule in packages/core; this service only parses
 * what arrived and applies it. An unsupported combination never creates an
 * application — the check is a gate in front of the funnel, not a state in it.
 */
export const routeService = {
  check(input: unknown): { answers: RouteCheck; verdict: RouteVerdict } {
    const parsed = parseRouteCheck(input);
    if (!parsed.ok) throw new ValidationFailure(parsed.issues);
    return { answers: parsed.data, verdict: checkRoute(parsed.data) };
  },

  /**
   * Record that someone needed a route we do not serve. Signing in is not
   * required to be counted, and the list cannot be read back by anyone.
   */
  async joinWaitlist(input: unknown): Promise<void> {
    const parsed = parseRouteCheck(input);
    if (!parsed.ok) throw new ValidationFailure(parsed.issues);

    if (!isSupabaseConfigured()) throw new ServiceError("auth.notConfigured", 503);

    const user = await currentUser();
    const supabase = user?.supabase ?? (await createClient());

    const { error } = await supabase.from("waitlist_entries").insert({
      user_id: user?.userId ?? null,
      residence_area: parsed.data.residenceArea,
      destination: parsed.data.destination,
      purpose: parsed.data.purpose,
      employment: parsed.data.employment,
    });

    if (error) {
      console.error("joinWaitlist: insert failed", { code: error.code, message: error.message });
      throw new ServiceError("route.waitlistFailed", 502);
    }
  },
};
