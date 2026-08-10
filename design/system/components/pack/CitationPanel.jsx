import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/**
 * Where a requirement came from, and what we are not promising. Every generated
 * claim in the pack carries one of these; the caveat is never hidden behind a link.
 */
export function CitationPanel({ sources = [], caveats = [], checkedAt, style }) {
  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card)", background: "var(--white)", overflow: "hidden", ...style }}>
      <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-accent-soft)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <Icon name="book-open-text" size={16} style={{ color: "var(--blue-700)" }} />
        <span style={{ fontSize: "var(--fs-14)", fontWeight: "var(--fw-semibold)", color: "var(--blue-800)" }}>{t("citations.title")}</span>
        {checkedAt ? <span style={{ marginLeft: "auto", fontSize: "var(--fs-12)", color: "var(--text-muted)", fontFamily: "var(--font-num)" }}>{t("citations.checkedAt", { date: checkedAt })}</span> : null}
      </div>
      <ol style={{ listStyle: "none", margin: 0, padding: "var(--space-2) var(--space-4)", display: "grid", gap: "var(--space-3)" }}>
        {sources.map((s, i) => (
          <li key={s.url || s.title} style={{ display: "flex", gap: "var(--space-3)", paddingTop: i ? "var(--space-3)" : 0, borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
            <span style={{ flex: "none", width: 22, height: 22, display: "grid", placeItems: "center", borderRadius: "50%", background: "var(--ink-100)", fontFamily: "var(--font-num)", fontSize: "var(--fs-12)", color: "var(--text-muted)" }}>{i + 1}</span>
            <span style={{ minWidth: 0 }}>
              <a href={s.url || "#"} style={{ fontSize: "var(--fs-14)", fontWeight: "var(--fw-medium)" }}>{s.title}</a>
              <span style={{ display: "block", fontSize: "var(--fs-12)", color: "var(--text-faint)", marginTop: 2, wordBreak: "break-all" }}>{s.publisher}{s.url ? " · " + s.url : ""}</span>
              {s.quote ? <span style={{ display: "block", marginTop: "var(--space-2)", paddingLeft: "var(--space-3)", borderLeft: "3px solid var(--border-default)", fontSize: "var(--fs-14)", color: "var(--text-muted)", lineHeight: 1.7 }}>{s.quote}</span> : null}
            </span>
          </li>
        ))}
      </ol>
      {caveats.length ? (
        <ul style={{ listStyle: "none", margin: 0, padding: "var(--space-3) var(--space-4)", borderTop: "1px solid var(--border-subtle)", background: "var(--amber-50)", display: "grid", gap: "var(--space-2)" }}>
          {caveats.map((c) => (
            <li key={c} style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--fs-14)", color: "var(--text-body)", lineHeight: 1.7 }}>
              <Icon name="info" size={16} style={{ color: "var(--amber-600)", marginTop: 4 }} />{c}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
