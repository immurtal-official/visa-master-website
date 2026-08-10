import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/** Wordmark set in the system stack — Visa Master has no supplied logo file. */
export function Wordmark({ size = 20, tone = "default" }) {
  const fg = tone === "inverse" ? "var(--white)" : "var(--blue-900)";
  const accent = tone === "inverse" ? "var(--teal-300)" : "var(--teal-600)";
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, fontSize: size, fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-cjk-display)", color: fg, whiteSpace: "nowrap" }}>
      签证大师<span style={{ fontSize: size * 0.62, fontWeight: "var(--fw-medium)", color: accent, letterSpacing: "var(--ls-latin-caps)" }}>VISA MASTER</span> {/* i18n-exempt: brand name, never translated */}
    </span>
  );
}

/** Marketing + app header. Nav collapses to a menu button below 900px (pass `compact`).
    `language` is a <LanguageSwitcher> — rendered in the desktop nav only; on compact it belongs
    inside the collapsed nav, so it never takes a top-level mobile nav slot. */
export function SiteHeader({ nav = [], action, language, compact, onMenu, style }) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-5)", flexWrap: "wrap",
      minHeight: 64, paddingBlock: compact ? 0 : "var(--space-2)", paddingInline: compact ? "var(--gutter-mobile)" : "var(--gutter-desktop)",
      background: "var(--white)", borderBottom: "1px solid var(--border-subtle)", ...style,
    }}>
      <Wordmark size={compact ? 17 : 20} />
      {compact ? (
        <button type="button" aria-label={t("nav.menu")} onClick={onMenu}
          style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "transparent", border: 0, color: "var(--text-heading)" }}>
          <Icon name="menu" size={22} />
        </button>
      ) : (
        <nav style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "var(--space-5)" }}>
          {nav.map((n) => (
            <a key={n.label} href={n.href || "#"} style={{ fontSize: "var(--fs-16)", color: "var(--text-body)", textDecoration: "none" }}>{n.label}</a>
          ))}
          {language}
          {action}
        </nav>
      )}
    </header>
  );
}
