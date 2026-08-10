import { CATALOGUE, LOCALES, registerStrings } from "./strings.js";
import { languageName } from "./languages.js";
import { expose } from "./expose.js";

export { registerStrings };

let LOCALE = "zh-CN";

/**
 * Locale for component microcopy. Setting it also sets `lang` on <html>, which is what
 * makes the Latin leading tokens (:lang(en)) apply. Chinese is the source language;
 * copy itself lives in strings.js, never in a component.
 */
export const Locale = {
  available: LOCALES,
  set(l) {
    LOCALE = CATALOGUE[l] ? l : "zh-CN";
    if (typeof document !== "undefined" && document.documentElement) document.documentElement.lang = LOCALE;
  },
  get() { return LOCALE; },
  isEn() { return LOCALE.slice(0, 2) === "en"; },
};

function fail(msg) {
  // No silent fallback. A missing translation is a bug that .build/check-i18n.mjs
  // fails the build on; if one reaches the browser it must be just as visible.
  throw new Error("[visa-master i18n] " + msg);
}

/**
 * t("packStatus.ready") — look up catalogue copy for the current locale.
 * t("camera.page", { n: 3 }) — fill {placeholders}.
 * t("file.pages", { count: 2 }) — picks <key>_one / <key>_other.
 */
export function t(key, vars) {
  const table = CATALOGUE[LOCALE] || fail(`unknown locale "${LOCALE}"`);
  let k = key;
  if (vars && vars.count !== undefined && table[key] === undefined) {
    k = Number(vars.count) === 1 ? `${key}_one` : `${key}_other`;
  }
  const raw = table[k];
  if (raw === undefined) fail(`missing key "${k}" in locale "${LOCALE}"`);
  return raw.replace(/\{(\w+)\}/g, (m, name) => {
    const v = vars ? vars[name] : undefined;
    if (v === undefined || v === null) fail(`key "${k}" needs {${name}}`);
    return String(v);
  });
}

/** Does the current locale have this key? For optional copy, e.g. a per-country note. */
export function has(key) {
  const table = CATALOGUE[LOCALE];
  return !!table && table[key] !== undefined;
}

/* `t`, `has`, `registerStrings` and `languageName` are lowercase, so the bundle keeps them
   internal. `I18n` is the capitalised handle that always resolves; expose() additionally
   publishes the lowercase names onto the namespace, so `const { t } = window.<Namespace>`
   works too. Consumers should not have to know which of their names survived the build. */
export const I18n = { t, has, registerStrings, languageName, Locale, LOCALES, CATALOGUE };

expose({ t, has, registerStrings, languageName, I18n });
