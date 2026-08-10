"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Icon, type IconName } from "./icon";

const SIZES = {
  sm: { h: "var(--control-h-sm)", px: "var(--space-3)", fs: "var(--fs-14)" },
  md: { h: "var(--control-h)", px: "var(--space-5)", fs: "var(--fs-16)" },
  lg: { h: "var(--control-h-lg)", px: "var(--space-6)", fs: "var(--fs-18)" },
} as const;

/** Hover is one step darker on the ramp, press two. Never opacity, never a lift. */
const VARIANTS = {
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

export interface ButtonProps {
  children?: ReactNode;
  /** Primary appears once per view. */
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  icon?: IconName;
  iconAfter?: IconName;
  /** Full width — the default inside a sticky bottom bar. */
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  name?: string;
  value?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
}

/**
 * The single action control.
 *
 * The label is never truncated and the control has no fixed width: English runs
 * 40–60% longer than the Chinese beside it, and a clipped action is an
 * unreadable action.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconAfter,
  block,
  disabled,
  loading,
  type = "button",
  name,
  value,
  onClick,
  style,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const background = disabled
    ? "var(--surface-disabled)"
    : pressed
      ? v.activeBg
      : hovered
        ? v.hoverBg
        : v.bg;

  return (
    <button
      type={type}
      name={name}
      value={value}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
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
        background,
        border: `1px solid ${disabled ? "var(--border-subtle)" : v.bd}`,
        borderRadius: "var(--radius-control)",
        textDecoration: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "var(--transition-control)",
        boxShadow: variant === "primary" && !disabled ? "var(--shadow-1)" : "none",
        ...style,
      }}
    >
      {loading ? (
        <Icon name="loader-circle" size={18} style={{ animation: "vm-spin 1s linear infinite" }} />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={18} /> : null}
    </button>
  );
}
