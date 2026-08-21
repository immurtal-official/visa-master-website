import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES, LOCALE_ROUTE_PREFIXES } from "@visa-master/core/locales";

/**
 * Locale-prefixed routing.
 *
 * Prefixes are always present so each language is independently indexable and a
 * link someone shares carries the language they were reading. The locale
 * identifiers stay BCP-47 (`zh-CN`) because they go straight into the `lang`
 * attribute and into `Intl`; only the path is shortened to `/zh`.
 *
 * The locale list itself lives in packages/core, so routing, the switcher, the
 * `lang` attribute and every server-side resolution read one source.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: {
    mode: "always",
    prefixes: LOCALE_ROUTE_PREFIXES,
  },
});
