import React from "react";
import { Icon } from "./Icon.jsx";

/** Square 44x44 icon-only control. Always pass `label` — it is the accessible name. */
export function IconButton({ icon, label, size = 44, variant = "ghost", onClick, disabled, style, ...rest }) {
  const [h, setH] = React.useState(false);
  const bg = variant === "solid" ? "var(--white)" : "transparent";
  return (
    <button
      type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, padding: 0,
        color: disabled ? "var(--text-faint)" : "var(--text-muted)",
        background: h && !disabled ? "var(--action-ghost-hover)" : bg,
        border: variant === "solid" ? "1px solid var(--border-subtle)" : "1px solid transparent",
        borderRadius: "var(--radius-control)", cursor: disabled ? "not-allowed" : "pointer",
        transition: "var(--transition-control)", ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={Math.round(size * 0.45)} />
    </button>
  );
}
