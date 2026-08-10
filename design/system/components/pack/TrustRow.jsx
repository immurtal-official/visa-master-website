import React from "react";
import { Icon } from "../core/Icon.jsx";

/** The four-claim trust row under the hero. Separator is a middle dot on wide screens, a stack on narrow. */
export function TrustRow({ items = [], tone = "default", style }) {
  const fg = tone === "inverse" ? "var(--blue-100)" : "var(--text-muted)";
  return (
    <ul style={{
      display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2) var(--space-5)",
      listStyle: "none", margin: 0, padding: 0, ...style,
    }}>
      {items.map((it) => {
        const label = typeof it === "string" ? it : it.label;
        const icon = typeof it === "string" ? "check" : it.icon || "check";
        return (
          <li key={label} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--fs-14)", color: fg, lineHeight: 1.6 }}>
            <Icon name={icon} size={16} style={{ color: tone === "inverse" ? "var(--teal-300)" : "var(--teal-600)" }} />{label}
          </li>
        );
      })}
    </ul>
  );
}
