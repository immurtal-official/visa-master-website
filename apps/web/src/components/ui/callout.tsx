import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "./icon";

const TONES = {
  info: {
    fg: "var(--status-info-fg)",
    bg: "var(--status-info-bg)",
    bar: "var(--blue-500)",
    icon: "circle-alert",
  },
  success: {
    fg: "var(--status-success-fg)",
    bg: "var(--status-success-bg)",
    bar: "var(--green-500)",
    icon: "check",
  },
  warning: {
    fg: "var(--status-warning-fg)",
    bg: "var(--status-warning-bg)",
    bar: "var(--amber-500)",
    icon: "circle-alert",
  },
  error: {
    fg: "var(--status-error-fg)",
    bg: "var(--status-error-bg)",
    bar: "var(--red-500)",
    icon: "circle-alert",
  },
  quiet: {
    fg: "var(--text-muted)",
    bg: "transparent",
    bar: "var(--border-default)",
    icon: null,
  },
} as const satisfies Record<string, { fg: string; bg: string; bar: string; icon: IconName | null }>;

export interface CalloutProps {
  children?: ReactNode;
  tone?: keyof typeof TONES;
  title?: ReactNode;
  style?: CSSProperties;
}

/**
 * An inline explanation block, in the GOV.UK inset-text shape: a rule on the
 * inline-start edge over a soft tint.
 *
 * It carries context and consequence, not decoration. Error tone uses the
 * de-escalated brick red — a missing document is a task, not a catastrophe, so
 * the colour carries less weight than the copy.
 */
export function Callout({ children, tone = "info", title, style }: CalloutProps) {
  const t = TONES[tone];

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-3)",
        padding: "var(--space-4)",
        background: t.bg,
        borderInlineStart: `4px solid ${t.bar}`,
        borderStartEndRadius: "var(--radius-sm)",
        borderEndEndRadius: "var(--radius-sm)",
        fontSize: "var(--fs-16)",
        lineHeight: "var(--type-body-lh)",
        color: "var(--text-body)",
        ...style,
      }}
    >
      {t.icon ? (
        <Icon name={t.icon} size={20} style={{ color: t.fg, marginBlockStart: 3 }} />
      ) : null}
      <div style={{ minInlineSize: 0 }}>
        {title ? (
          <div
            style={{
              fontWeight: "var(--fw-semibold)",
              color: t.fg,
              marginBlockEnd: "var(--space-1)",
            }}
          >
            {title}
          </div>
        ) : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
