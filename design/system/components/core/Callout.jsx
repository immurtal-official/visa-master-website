import React from "react";
import { Icon } from "./Icon.jsx";

const TONES = {
  info: { fg: "var(--status-info-fg)", bg: "var(--status-info-bg)", bar: "var(--blue-500)", icon: "info" },
  success: { fg: "var(--status-success-fg)", bg: "var(--status-success-bg)", bar: "var(--green-500)", icon: "check" },
  warning: { fg: "var(--status-warning-fg)", bg: "var(--status-warning-bg)", bar: "var(--amber-500)", icon: "triangle-alert" },
  error: { fg: "var(--status-error-fg)", bg: "var(--status-error-bg)", bar: "var(--red-500)", icon: "circle-alert" },
  quiet: { fg: "var(--text-muted)", bg: "transparent", bar: "var(--border-default)", icon: null },
};

/** Inline explanation block. GOV.UK inset-text shape: left rule, no rounded pill, no icon-only meaning. */
export function Callout({ children, tone = "info", title, icon, style, ...rest }) {
  const t = TONES[tone] || TONES.info;
  const glyph = icon === null ? null : icon || t.icon;
  return (
    <div
      style={{
        display: "flex", gap: "var(--space-3)",
        padding: "var(--space-4) var(--space-4) var(--space-4) var(--space-4)",
        background: t.bg, borderLeft: `4px solid ${t.bar}`,
        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
        fontSize: "var(--fs-16)", lineHeight: "var(--lh-body)", color: "var(--text-body)", ...style,
      }}
      {...rest}
    >
      {glyph ? <Icon name={glyph} size={20} style={{ color: t.fg, marginTop: 3 }} /> : null}
      <div>
        {title ? <div style={{ fontWeight: "var(--fw-semibold)", color: t.fg, marginBottom: "var(--space-1)" }}>{title}</div> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
