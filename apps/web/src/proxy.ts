import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_ROUTE_PREFIXES, isLocale } from "@visa-master/core/locales";
import { routing } from "@/i18n/routing";
import { isProtectedPath, updateSession } from "@/lib/supabase/proxy";

/**
 * Locale routing and session refresh, in that order.
 *
 * Next 16 calls this file proxy.ts; it is the middleware layer under its
 * current name, and it lives inside src/ because that is where Next looks when
 * the project has a src directory — at the package root it is ignored silently,
 * which presents as every locale route returning 404.
 *
 * Order matters. Locale routing runs first and produces the response,
 * including any rewrite or redirect; the session refresh then writes its
 * cookies onto that same response rather than building a second one, because
 * the second would throw away the rewrite.
 */
const handleLocale = createMiddleware(routing);

/** The locale prefix for a path, so a redirect keeps the reader's language. */
function localePrefixOf(pathname: string): string {
  const segment = pathname.split("/")[1] ?? "";
  const match = Object.entries(LOCALE_ROUTE_PREFIXES).find(
    ([, prefix]) => prefix === `/${segment}`,
  );
  if (match) return match[1];
  if (isLocale(segment)) return LOCALE_ROUTE_PREFIXES[segment];
  return LOCALE_ROUTE_PREFIXES[DEFAULT_LOCALE];
}

export async function proxy(request: NextRequest) {
  const response = handleLocale(request);

  // A redirect is the routing layer sending the reader somewhere else; there is
  // no page to protect yet, and refreshing a session onto a redirect response
  // would only have to be redone at the destination.
  if (response.headers.has("location")) return response;

  const session = await updateSession(request, response);

  // An auth service that cannot be reached is not the same as a visitor who is
  // not signed in: letting the request through means the page decides, rather
  // than signing everyone out at once because of a transient failure.
  if (session.status === "signed-out" && isProtectedPath(request.nextUrl.pathname)) {
    const prefix = localePrefixOf(request.nextUrl.pathname);
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}/login`;
    const redirect = NextResponse.redirect(url);
    // Carry the refreshed cookies across, or the reader arrives at the sign-in
    // page having just been silently signed out.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}

export const config = {
  // Skip Next internals, the API surface, and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
