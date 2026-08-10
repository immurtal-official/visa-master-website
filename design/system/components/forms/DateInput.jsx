import React from "react";
import { t } from "../core/i18n.jsx";

/** Three separate number fields in 年 / 月 / 日 order. Never a date-picker overlay on mobile. */
export function DateInput({ label, hint, error, value = {}, onChange }) {
  const set = (k) => (e) => onChange && onChange({ ...value, [k]: e.target.value });
  const field = (k, w, ph, unit) => (
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <span style={{ fontSize: "var(--fs-14)", color: "var(--text-muted)" }}>{unit}</span>
      <input inputMode="numeric" placeholder={ph} value={value[k] || ""} onChange={set(k)}
        style={{
          width: w, minHeight: "var(--control-h)", padding: "var(--space-3)",
          fontSize: "var(--type-input-size)", fontFamily: "var(--font-num)", textAlign: "center",
          color: "var(--text-body)", background: "var(--white)",
          border: `${error ? 2 : 1}px solid ${error ? "var(--red-500)" : "var(--border-input)"}`,
          borderRadius: "var(--radius-control)", boxShadow: "var(--shadow-inset-input)",
        }} />
    </label>
  );
  return (
    <div>
      {label ? <div style={{ marginBottom: "var(--space-2)", fontSize: "var(--type-label-size)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)" }}>{label}</div> : null}
      {hint ? <p style={{ marginBottom: "var(--space-3)", fontSize: "var(--type-hint-size)", color: "var(--text-muted)" }}>{hint}</p> : null}
      {error ? <p style={{ marginBottom: "var(--space-3)", fontSize: "var(--fs-14)", fontWeight: "var(--fw-medium)", color: "var(--status-error-fg)" }}>{error}</p> : null}
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        {field("year", 96, "2026", t("date.year"))}
        {field("month", 72, "08", t("date.month"))}
        {field("day", 72, "09", t("date.day"))}
      </div>
    </div>
  );
}
