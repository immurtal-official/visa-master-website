import React from "react";
import { t } from "../core/i18n.jsx";
import { Icon } from "../core/Icon.jsx";

/**
 * Sits at the very top of a page that failed validation, is focused on render,
 * and links to each field. Every message says what to DO, not what went wrong.
 */
export function ErrorSummary({ title, errors = [], onJump }) {
  const heading = title !== undefined ? title : t("errorSummary.title");
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  if (!errors.length) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert"
      style={{
        padding: "var(--space-4) var(--space-5)", marginBottom: "var(--space-6)",
        background: "var(--status-error-bg)", border: "1px solid var(--status-error-border)",
        borderLeft: "4px solid var(--red-500)", borderRadius: "0 var(--radius-card) var(--radius-card) 0",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--status-error-fg)", fontSize: "var(--fs-18)", fontWeight: "var(--fw-semibold)" }}>
        <Icon name="circle-alert" size={20} />{heading}
      </div>
      <ul style={{ margin: "var(--space-3) 0 0", padding: 0, listStyle: "none", display: "grid", gap: "var(--space-2)" }}>
        {errors.map((e) => (
          <li key={e.field}>
            <a href={`#${e.field}`} onClick={(ev) => { if (onJump) { ev.preventDefault(); onJump(e.field); } }}
              style={{ color: "var(--status-error-fg)", fontSize: "var(--fs-16)", textDecorationThickness: 1 }}>{e.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
