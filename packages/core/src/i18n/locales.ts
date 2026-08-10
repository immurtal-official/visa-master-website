/**
 * The single source of truth for which locales exist.
 *
 * Routing, the language switcher, the `lang` attribute, `Intl` formatting and
 * every server-side locale resolution read from here. Adding a locale means
 * adding an entry here, writing a catalogue, and adding a font-stack entry —
 * nothing else (internationalization guideline §8).
 */
export const LOCALES = ["zh-CN", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-CN";

/**
 * Each language names itself, in itself. Never translated, never a flag:
 * flags denote countries, not languages (internationalization guideline §6).
 */
export const LOCALE_SELF_NAMES: Record<Locale, string> = {
  "zh-CN": "简体中文",
  en: "English",
};

/**
 * URL prefixes. The locale identifier stays BCP-47 (`zh-CN`) so it can go
 * straight into `lang` and `Intl`, while the path stays short (`/zh`).
 */
export const LOCALE_ROUTE_PREFIXES: Record<Locale, string> = {
  "zh-CN": "/zh",
  en: "/en",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Resolve any stored or user-supplied value to a usable locale.
 *
 * Stored locales can be written through paths that do not validate (the
 * `profiles.locale` column carries no CHECK constraint, so the locale list has
 * exactly one home), so every reader coerces rather than trusts.
 */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localeSelfName(locale: Locale): string {
  return LOCALE_SELF_NAMES[locale];
}
