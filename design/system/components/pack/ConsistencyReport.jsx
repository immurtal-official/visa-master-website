import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

const SEV = {
  conflict: { fg: "var(--status-error-fg)", bg: "var(--status-error-bg)", bd: "var(--status-error-border)", icon: "git-compare-arrows", key: "consistency.conflict" },
  check: { fg: "var(--status-warning-fg)", bg: "var(--status-warning-bg)", bd: "var(--status-warning-border)", icon: "triangle-alert", key: "consistency.check" },
  pass: { fg: "var(--status-success-fg)", bg: "var(--status-success-bg)", bd: "var(--status-success-border)", icon: "check", key: "consistency.pass" },
};

/**
 * Consistency check across the pack: the same fact read out of two documents,
 * side by side, with the fix stated as an instruction.
 */
export function ConsistencyReport({ items = [], summary, onResolve, style }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-3)", ...style }}>
      {summary ? (
        <p style={{ fontSize: "var(--fs-14)", color: "var(--text-muted)" }}>{summary}</p>
      ) : null}
      {items.map((it) => {
        const s = SEV[it.severity] || SEV.check;
        return (
          <div key={it.id} style={{ border: `1px solid ${s.bd}`, borderRadius: "var(--radius-card)", background: "var(--white)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-4)", background: s.bg, color: s.fg, fontSize: "var(--fs-14)", fontWeight: "var(--fw-semibold)" }}>
              <Icon name={s.icon} size={16} />{it.field}
              <span style={{ marginLeft: "auto", fontWeight: "var(--fw-regular)" }}>{t(s.key)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "var(--space-3)", padding: "var(--space-4)" }}>
              {it.readings.map((r) => (
                <div key={r.source} style={{ padding: "var(--space-3)", background: "var(--ink-50)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "var(--fs-12)", color: "var(--text-faint)", marginBottom: 4 }}>{r.source}</div>
                  <div style={{ fontFamily: "var(--font-num)", fontSize: "var(--fs-18)", color: "var(--text-heading)", fontWeight: "var(--fw-medium)" }}>{r.value}</div>
                </div>
              ))}
            </div>
            {it.action ? (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", padding: "var(--space-3) var(--space-4)", borderTop: "1px solid var(--border-subtle)", background: "var(--ink-50)" }}>
                <span style={{ fontSize: "var(--fs-14)", color: "var(--text-body)", flex: 1, minWidth: 200 }}>{it.action}</span>
                {onResolve ? (
                  <button type="button" onClick={() => onResolve(it.id)}
                    style={{ minHeight: 36, padding: "0 var(--space-4)", background: "var(--white)", border: "1px solid var(--action-secondary-border)", borderRadius: "var(--radius-control)", color: "var(--action-secondary-fg)", fontSize: "var(--fs-14)", cursor: "pointer" }}>{t("consistency.fix")}</button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
