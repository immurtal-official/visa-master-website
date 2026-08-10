/**
 * The brand name, in both scripts.
 *
 * It is not copy and never goes through the catalogue: a brand name is the same
 * string in every interface language. Holding it here rather than inline is
 * also what keeps it out of the way of the no-literal-string rule, which is
 * right to flag anything written directly into JSX.
 */
const BRAND_CJK = "签证大师"; // i18n-exempt: brand name
const BRAND_LATIN = "VISA MASTER"; // i18n-exempt: brand name

export interface WordmarkProps {
  size?: number;
  tone?: "default" | "inverse";
}

/**
 * The brand lockup, set in type.
 *
 * No logo file exists yet; the design system flags this as a placeholder to be
 * replaced when a real mark exists.
 */
export function Wordmark({ size = 20, tone = "default" }: WordmarkProps) {
  const fg = tone === "inverse" ? "var(--white)" : "var(--blue-900)";
  const accent = tone === "inverse" ? "var(--teal-300)" : "var(--teal-600)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        fontSize: size,
        fontWeight: "var(--fw-semibold)",
        letterSpacing: "var(--ls-cjk-display)",
        color: fg,
      }}
    >
      {BRAND_CJK}
      <span
        style={{
          fontSize: size * 0.62,
          fontWeight: "var(--fw-medium)",
          color: accent,
          letterSpacing: "var(--ls-latin-caps)",
        }}
      >
        {BRAND_LATIN}
      </span>
    </span>
  );
}
