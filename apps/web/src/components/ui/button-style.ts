import type { CSSProperties } from "react";

export const BUTTON_SIZES = {
  sm: { h: "var(--control-h-sm)", px: "var(--space-3)", fs: "var(--fs-14)" },
  md: { h: "var(--control-h)", px: "var(--space-5)", fs: "var(--fs-16)" },
  lg: { h: "var(--control-h-lg)", px: "var(--space-6)", fs: "var(--fs-18)" },
} as const;

/** Hover is one step darker on the ramp, press two. Never opacity, never a lift. */
export const BUTTON_VARIANTS = {
  primary: {
    bg: "var(--action-primary)",
    fg: "var(--text-on-accent)",
    bd: "var(--action-primary)",
    hoverBg: "var(--action-primary-hover)",
    activeBg: "var(--action-primary-active)",
  },
  secondary: {
    bg: "var(--white)",
    fg: "var(--action-secondary-fg)",
    bd: "var(--action-secondary-border)",
    hoverBg: "var(--action-secondary-hover)",
    activeBg: "var(--blue-100)",
  },
  ghost: {
    bg: "transparent",
    fg: "var(--action-secondary-fg)",
    bd: "transparent",
    hoverBg: "var(--action-ghost-hover)",
    activeBg: "var(--ink-200)",
  },
  quiet: {
    bg: "transparent",
    fg: "var(--text-muted)",
    bd: "transparent",
    hoverBg: "var(--action-ghost-hover)",
    activeBg: "var(--ink-200)",
  },
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES;

/**
 * The look of a button, shared by the button and by links that lead somewhere
 * and should look like one.
 *
 * A link that looks like a button has to *be* a link: nesting a button inside
 * an anchor is invalid, and the browser's handling of it varies — in practice
 * the click stops at the button and never navigates.
 */
export function buttonStyle({
  variant = "primary",
  size = "md",
  block,
  disabled,
  hovered,
  pressed,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  disabled?: boolean;
  hovered?: boolean;
  pressed?: boolean;
}): CSSProperties {
  const v = BUTTON_VARIANTS[variant];
  const s = BUTTON_SIZES[size];

  return {
    display: block ? "flex" : "inline-flex",
    inlineSize: block ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
    minBlockSize: s.h,
    minInlineSize: "var(--touch-min)",
    paddingInline: s.px,
    fontSize: s.fs,
    fontWeight: "var(--fw-medium)",
    lineHeight: 1.2,
    letterSpacing: "var(--ls-cjk-body)",
    fontFamily: "var(--font-sans)",
    color: disabled ? "var(--text-faint)" : v.fg,
    background: disabled
      ? "var(--surface-disabled)"
      : pressed
        ? v.activeBg
        : hovered
          ? v.hoverBg
          : v.bg,
    border: `1px solid ${disabled ? "var(--border-subtle)" : v.bd}`,
    borderRadius: "var(--radius-control)",
    textDecoration: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "var(--transition-control)",
    boxShadow: variant === "primary" && !disabled ? "var(--shadow-1)" : "none",
  };
}
