"use client";

import { useLocale } from "next-intl";
import { getPathname } from "./navigation";

/**
 * Leave the page with a full load, for the moment the session changes.
 *
 * Signing in or out changes what every protected route answers, but the
 * client router remembers what those routes answered a moment ago — including
 * a redirect to the sign-in page recorded while signed out. A client-side push
 * after signing in can replay that redirect without asking the server, and the
 * reader is left on the sign-in form with a spinner, signed in and nowhere to
 * go. A full load starts from the session the cookies now hold, with nothing
 * remembered from before it changed.
 */
export function useSessionNavigation(): (href: string) => void {
  const locale = useLocale();
  return (href) => {
    window.location.assign(getPathname({ href, locale }));
  };
}
