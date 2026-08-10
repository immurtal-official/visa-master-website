import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Locale detection and redirection.
 *
 * Next 16 calls this file `proxy.ts`; it is the middleware layer under its
 * current name, and it lives inside src/ because that is where Next looks when
 * the project has a src directory. Supabase session refresh joins it here once
 * auth lands, and the order matters then: routing runs first and produces the
 * response, and the session refresh writes its cookies onto that same response.
 */
export const proxy = createMiddleware(routing);

export const config = {
  // Skip Next internals, the API surface, and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
