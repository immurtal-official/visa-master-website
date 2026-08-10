import React from "react";

/**
 * The single sticky action bar. One per view. It survives the on-screen keyboard
 * and respects the home-indicator inset.
 */
export function StickyActionBar({ children, secondary, note, sticky = true, style }) {
  return (
    <div style={{
      position: sticky ? "sticky" : "static", bottom: 0, zIndex: 20,
      padding: `var(--space-3) var(--gutter-mobile) calc(var(--space-3) + var(--safe-bottom))`,
      background: "var(--white)", borderTop: "1px solid var(--border-subtle)",
      boxShadow: "0 -4px 16px rgba(11,37,69,.05)", ...style,
    }}>
      {note ? <p style={{ marginBottom: "var(--space-2)", fontSize: "var(--fs-12)", color: "var(--text-faint)", textAlign: "center" }}>{note}</p> : null}
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", maxWidth: "var(--container-narrow)", margin: "0 auto" }}>
        {secondary ? <div style={{ flex: "none" }}>{secondary}</div> : null}
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
