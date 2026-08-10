import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { DEFAULT_LOCALE } from "@visa-master/core/locales";
import { routing } from "./routing";

/**
 * Resolve the catalogue for the request's locale.
 *
 * There is no fallback locale for individual messages: a key missing from one
 * catalogue fails the build (scripts/check-i18n.mjs), so a silent fallback here
 * would only hide what that check exists to surface.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
