import React from "react";

/** White panel on the blue-grey page. Border first, shadow only when it floats. */
export function Card({ children, padding = "var(--space-6)", elevation = 1, tone = "default", header, footer, style, ...rest }) {
  const tones = {
    default: { bg: "var(--surface-card)", bd: "var(--border-subtle)" },
    accent: { bg: "var(--surface-accent-soft)", bd: "var(--blue-100)" },
    sunken: { bg: "var(--surface-sunken)", bd: "var(--border-subtle)" },
    inverse: { bg: "var(--surface-inverse)", bd: "var(--blue-800)" },
  };
  const t = tones[tone] || tones.default;
  return (
    <section
      style={{
        background: t.bg, border: `1px solid ${t.bd}`, borderRadius: "var(--radius-card)",
        boxShadow: elevation === 0 ? "none" : elevation === 2 ? "var(--shadow-2)" : "var(--shadow-1)",
        overflow: "hidden", color: tone === "inverse" ? "var(--text-inverse)" : undefined, ...style,
      }}
      {...rest}
    >
      {header ? (
        <header style={{ padding: `var(--space-4) ${padding}`, borderBottom: `1px solid ${t.bd}`, fontSize: "var(--fs-16)", fontWeight: "var(--fw-semibold)", color: tone === "inverse" ? "var(--text-inverse)" : "var(--text-heading)" }}>{header}</header>
      ) : null}
      <div style={{ padding }}>{children}</div>
      {footer ? (
        <footer style={{ padding: `var(--space-4) ${padding}`, borderTop: `1px solid ${t.bd}`, background: tone === "default" ? "var(--ink-50)" : "transparent" }}>{footer}</footer>
      ) : null}
    </section>
  );
}
