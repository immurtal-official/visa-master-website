export interface LanguageOption {
  /** BCP-47 tag used as the value and set as `lang` on the button. */
  code: string;
  /** The language's name IN THAT LANGUAGE — 简体中文, English. Never a flag, never a country. */
  name: string;
}
export interface LanguageSwitcherProps {
  value?: string;
  onChange?: (code: string) => void;
  languages?: LanguageOption[];
  /** header: inline row (desktop header). nav: stacked, 44px targets, for the collapsed mobile nav. footer: stacked, inverse tone. */
  placement?: "header" | "nav" | "footer";
  /** Permanent one-line note. Defaults to the interface-language-only wording for `value`. Do not pass "" — the note is required copy. */
  note?: React.ReactNode;
  tone?: "default" | "inverse";
  style?: React.CSSProperties;
}
