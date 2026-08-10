import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * Always the native <select>. On touch this opens the OS picker, which is faster,
 * accessible and familiar; we never ship a custom listbox.
 */
export function Select({ label, hint, error, options = [], placeholder, id, width = "full", ...rest }) {
  const auto = React.useId();
  const selId = id || auto;
  const [focus, setFocus] = React.useState(false);
  const widths = { full: "100%", lg: "24em", md: "16em", sm: "10em" };
  return (
    <div style={{ maxWidth: widths[width] || width }}>
      {label ? <label htmlFor={selId} style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--type-label-size)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)" }}>{label}</label> : null}
      {hint ? <p style={{ marginBottom: "var(--space-2)", fontSize: "var(--type-hint-size)", color: "var(--text-muted)" }}>{hint}</p> : null}
      <div style={{ position: "relative" }}>
        <select
          id={selId} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", minHeight: "var(--control-h)", padding: "var(--space-3) var(--space-10) var(--space-3) var(--space-4)",
            fontSize: "var(--type-input-size)", fontFamily: "var(--font-sans)", color: "var(--text-body)",
            background: "var(--white)", appearance: "none",
            border: `${error ? 2 : 1}px solid ${error ? "var(--red-500)" : focus ? "var(--blue-600)" : "var(--border-input)"}`,
            borderRadius: "var(--radius-control)", outline: focus ? "3px solid var(--focus-ring)" : "none", outlineOffset: 2,
          }}
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (typeof o === "string"
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <Icon name="chevron-down" size={20} style={{ position: "absolute", right: "var(--space-4)", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}
