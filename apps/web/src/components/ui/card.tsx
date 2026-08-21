import type { CSSProperties, ReactNode } from "react";

const TONES = {
  default: { bg: "var(--surface-card)", bd: "var(--border-subtle)" },
  accent: { bg: "var(--surface-accent-soft)", bd: "var(--blue-100)" },
  sunken: { bg: "var(--surface-sunken)", bd: "var(--border-subtle)" },
  inverse: { bg: "var(--surface-inverse)", bd: "var(--blue-800)" },
} as const;

export interface CardProps {
  children?: ReactNode;
  padding?: string;
  /** 0 flat, 1 at rest, 2 for something that genuinely floats. */
  elevation?: 0 | 1 | 2;
  tone?: keyof typeof TONES;
  header?: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
}

/**
 * A white panel on the blue-grey page.
 *
 * The border does the separating; shadow is reserved for things that float. No
 * coloured left-border accent cards — that shape belongs to Callout alone.
 */
export function Card({
  children,
  padding = "var(--space-6)",
  elevation = 1,
  tone = "default",
  header,
  footer,
  style,
}: CardProps) {
  const t = TONES[tone];

  return (
    <section
      style={{
        background: t.bg,
        border: `1px solid ${t.bd}`,
        borderRadius: "var(--radius-card)",
        boxShadow:
          elevation === 0 ? "none" : elevation === 2 ? "var(--shadow-2)" : "var(--shadow-1)",
        overflow: "hidden",
        color: tone === "inverse" ? "var(--text-inverse)" : undefined,
        ...style,
      }}
    >
      {header ? (
        <header
          style={{
            padding: `var(--space-4) ${padding}`,
            borderBlockEnd: `1px solid ${t.bd}`,
            fontSize: "var(--fs-16)",
            fontWeight: "var(--fw-semibold)",
            color: tone === "inverse" ? "var(--text-inverse)" : "var(--text-heading)",
          }}
        >
          {header}
        </header>
      ) : null}

      <div style={{ padding }}>{children}</div>

      {footer ? (
        <footer
          style={{
            padding: `var(--space-4) ${padding}`,
            borderBlockStart: `1px solid ${t.bd}`,
            background: tone === "default" ? "var(--ink-50)" : "transparent",
          }}
        >
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
