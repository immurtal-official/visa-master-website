import React from "react";
import { Icon } from "./Icon.jsx";

const TONES = {
  neutral: ["--status-neutral-fg", "--status-neutral-bg", "--status-neutral-border"],
  info: ["--status-info-fg", "--status-info-bg", "--status-info-border"],
  success: ["--status-success-fg", "--status-success-bg", "--status-success-border"],
  warning: ["--status-warning-fg", "--status-warning-bg", "--status-warning-border"],
  error: ["--status-error-fg", "--status-error-bg", "--status-error-border"],
};

/** Small status label. Error tone is muted on purpose — a missing file is a task, not an alarm. */
export function Badge({ children, tone = "neutral", icon, size = "md", style, ...rest }) {
  const [fg, bg, bd] = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: "var(--space-1)",
        padding: size === "sm" ? "2px var(--space-2)" : "3px var(--space-3)",
        fontSize: size === "sm" ? "var(--fs-12)" : "var(--fs-14)",
        fontWeight: "var(--fw-medium)", letterSpacing: "var(--ls-cjk-sm)", lineHeight: 1.5,
        color: `var(${fg})`, background: `var(${bg})`, border: `1px solid var(${bd})`,
        borderRadius: "var(--radius-chip)", whiteSpace: "nowrap", ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={size === "sm" ? 12 : 14} /> : null}
      {children}
    </span>
  );
}
