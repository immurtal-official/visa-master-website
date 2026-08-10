import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/** Paths that require a session, matched after the locale prefix is stripped. */
const PROTECTED = ["/dashboard"];

/**
 * Refresh the session, and say whether the request may proceed.
 *
 * This deviates from the documented single-middleware pattern in one way, and
 * deliberately: that pattern builds and returns its own response, but locale
 * routing has already produced one by the time this runs, and returning a
 * second would discard the rewrite. So the refreshed cookies are written onto
 * the response that already exists. Cookies are also written back onto the
 * request, so anything reading them later in this same pass sees the new
 * values rather than the expired ones.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<{ authenticated: boolean }> {
  if (!isSupabaseConfigured()) return { authenticated: false };

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
        // Supabase hands over cache directives with the cookies. Without them a
        // CDN can cache a response that carries someone's session.
        if (headers) {
          for (const [name, value] of Object.entries(headers)) {
            response.headers.set(name, value);
          }
        }
      },
    },
  });

  // getClaims verifies the token's signature rather than trusting whatever the
  // cookie says, which is why it is safe to gate a route on. getSession is not:
  // it reports what the cookie claims, unverified.
  const { data } = await supabase.auth.getClaims();
  return { authenticated: Boolean(data?.claims) };
}

/** Whether this path needs a session, given the locale prefix in front of it. */
export function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/[^/]+/, "");
  return PROTECTED.some((path) => withoutLocale === path || withoutLocale.startsWith(`${path}/`));
}
