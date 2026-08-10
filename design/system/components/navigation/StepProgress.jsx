import React from "react";
import { t } from "../core/i18n.jsx";

/** Visible progress for a long intake: section name, step count, and a thin bar. */
export function StepProgress({ section, step, total, sections = [], style }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ ...style }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", marginBottom: "var(--space-2)" }}>
        <span style={{ fontSize: "var(--fs-14)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)" }}>{section}</span>
        <span style={{ fontSize: "var(--fs-14)", fontFamily: "var(--font-num)", color: "var(--text-muted)" }}>{t("progress.stepOfTotal", { step, total })}</span>
      </div>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        style={{ height: 6, background: "var(--ink-200)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--teal-500)", borderRadius: "var(--radius-pill)", transition: `width var(--dur-slow) var(--ease-out)` }} />
      </div>
      {sections.length ? (
        <ol style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1) var(--space-4)", listStyle: "none", margin: "var(--space-3) 0 0", padding: 0 }}>
          {sections.map((s) => (
            <li key={s.name} style={{
              display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-14)",
              color: s.state === "current" ? "var(--text-heading)" : s.state === "done" ? "var(--text-muted)" : "var(--text-faint)",
              fontWeight: s.state === "current" ? "var(--fw-semibold)" : "var(--fw-regular)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.state === "done" ? "var(--teal-500)" : s.state === "current" ? "var(--blue-600)" : "var(--ink-300)" }} />
              {s.name}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
