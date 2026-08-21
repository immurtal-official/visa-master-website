import type { routing } from "@/i18n/routing";
import type messages from "../messages/zh-CN.json";

/**
 * Typed message keys and locales.
 *
 * Chinese is the source catalogue, so it types the key space: a key that exists
 * only in English is a key nothing renders. A typo in `t("…")` is then a
 * TypeScript error rather than a runtime throw, and the catalogue-parity check
 * catches the other direction.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
