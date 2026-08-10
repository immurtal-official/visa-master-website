import React from "react";
import { Icon } from "./Icon.jsx";

const SIZES = {
  sm: { h: "var(--control-h-sm)", px: "var(--space-3)", fs: "var(--fs-14)" },
  md: { h: "var(--control-h)", px: "var(--space-5)", fs: "var(--fs-16)" },
  lg: { h: "var(--control-h-lg)", px: "var(--space-6)", fs: "var(--fs-18)" },
};

const VARIANTS = {
  primary: { bg: "var(--action-primary)", fg: "var(--text-on-accent)", bd: "var(--action-primary)", hoverBg: "var(--action-primary-hover)", activeBg: "var(--action-primary-active)" },
  secondary: { bg: "var(--white)", fg: "var(--action-secondary-fg)", bd: "var(--action-secondary-border)", hoverBg: "var(--action-secondary-hover)", activeBg: "var(--blue-100)" },
  ghost: { bg: "transparent", fg: "var(--action-secondary-fg)", bd: "transparent", hoverBg: "var(--action-ghost-hover)", activeBg: "var(--ink-200)" },
  quiet: { bg: "transparent", fg: "var(--text-muted)", bd: "transparent", hoverBg: "var(--action-ghost-hover)", activeBg: "var(--ink-200)" },
};

/** The single action control. Primary is used once per view; the sticky bar owns it on mobile. */
export function Button({
  children, variant = "primary", size = "md", icon, iconAfter, block, disabled,
  loading, as = "button", href, onClick, type = "button", style, ...rest
}) {
  const [h, setH] = React.useState(false);
  const [a, setA] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const Tag = as === "a" ? "a" : "button";
  const bg = disabled ? "var(--surface-disabled)" : a ? v.activeBg : h ? v.hoverBg : v.bg;
  return (
    <Tag
      href={href}
      type={Tag === "button" ? type : undefined}
      disabled={Tag === "button" ? disabled || loading : undefined}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => { setH(false); setA(false); }}
      onMouseDown={() => setA(true)}
      onMouseUp={() => setA(false)}
      style={{
        display: block ? "flex" : "inline-flex", width: block ? "100%" : undefined,
        alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
        minHeight: s.h, minWidth: "var(--touch-min)", padding: `0 ${s.px}`,
        fontSize: s.fs, fontWeight: "var(--fw-medium)", lineHeight: 1.2,
        letterSpacing: "var(--ls-cjk-body)", fontFamily: "var(--font-sans)",
        color: disabled ? "var(--text-faint)" : v.fg,
        background: bg,
        border: `1px solid ${disabled ? "var(--border-subtle)" : v.bd}`,
        borderRadius: "var(--radius-control)",
        textDecoration: "none", cursor: disabled ? "not-allowed" : "pointer",
        transition: "var(--transition-control)",
        boxShadow: variant === "primary" && !disabled ? "var(--shadow-1)" : "none",
        ...style,
      }}
      {...rest}
    >
      {loading ? <Icon name="loader-circle" size={18} style={{ animation: "vm-spin 1s linear infinite" }} /> : icon ? <Icon name={icon} size={18} /> : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={18} /> : null}
    </Tag>
  );
}
