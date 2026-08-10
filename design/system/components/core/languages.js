/* Language self-names. NOT translated and NOT in the catalogue: a language is written
   in its own script, in every locale. 德语 is "Deutsch" to a German consulate whether the
   interface is Chinese or English. Used by PackFileTree's per-file language label and by
   LanguageSwitcher. */
export const LANGUAGE_NAMES = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  "en-GB": "English",
  "en-US": "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  ru: "Русский",
  ja: "日本語",
  ko: "한국어",
  th: "ไทย",
  vi: "Tiếng Việt",
  ar: "العربية",
  tr: "Türkçe",
  pl: "Polski",
  cs: "Čeština",
  el: "Ελληνικά",
  sv: "Svenska",
  da: "Dansk",
  fi: "Suomi",
  no: "Norsk",
  hu: "Magyar",
};

/** Self-name for a language tag. Falls back to the tag itself, never to the UI language. */
export function languageName(code) {
  if (!code) return null;
  return LANGUAGE_NAMES[code] || LANGUAGE_NAMES[String(code).split("-")[0]] || code;
}
