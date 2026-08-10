import React from "react";
import { Icon } from "../core/Icon.jsx";

export function ChoiceRow({ type, name, checked, onChange, title, hint, value }) {
  const id = React.useId();
  return (
    <label
      htmlFor={id}
      style={{
        display: "flex", gap: "var(--space-3)", alignItems: "flex-start",
        minHeight: "var(--touch-min)", padding: "var(--space-4)",
        background: checked ? "var(--surface-selected)" : "var(--white)",
        border: `${checked ? 2 : 1}px solid ${checked ? "var(--blue-600)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-control)", cursor: "pointer",
        transition: "var(--transition-control)",
      }}
    >
      <input id={id} type={type} name={name} value={value} checked={checked} onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
      <span aria-hidden="true" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: "none", width: 24, height: 24, marginTop: 1,
        borderRadius: type === "radio" ? "50%" : "var(--radius-xs)",
        border: `2px solid ${checked ? "var(--blue-600)" : "var(--border-strong)"}`,
        background: checked ? "var(--blue-600)" : "var(--white)",
      }}>
        {checked ? (type === "radio"
          ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--white)" }} />
          : <Icon name="check" size={16} style={{ color: "var(--white)" }} />) : null}
      </span>
      <span style={{ display: "block" }}>
        <span style={{ display: "block", fontSize: "var(--fs-16)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)", lineHeight: 1.5 }}>{title}</span>
        {hint ? <span style={{ display: "block", marginTop: 2, fontSize: "var(--fs-14)", color: "var(--text-muted)", lineHeight: 1.6 }}>{hint}</span> : null}
      </span>
    </label>
  );
}
