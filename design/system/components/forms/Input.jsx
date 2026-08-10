import React from "react";

const base = (invalid, focus) => ({
  width: "100%", minHeight: "var(--control-h)",
  padding: "var(--space-3) var(--space-4)",
  fontSize: "var(--type-input-size)", lineHeight: 1.5, fontFamily: "var(--font-sans)",
  color: "var(--text-body)", background: "var(--white)",
  border: `${invalid ? 2 : 1}px solid ${invalid ? "var(--red-500)" : focus ? "var(--blue-600)" : "var(--border-input)"}`,
  borderRadius: "var(--radius-control)",
  boxShadow: "var(--shadow-inset-input)",
  outline: focus ? "3px solid var(--focus-ring)" : "none", outlineOffset: 2,
  transition: "var(--transition-control)",
});

/** Text field. 16px minimum so iOS Safari never zooms on focus. */
export function Input({ label, hint, error, prefix, suffix, width = "full", id, ...rest }) {
  const auto = React.useId();
  const inputId = id || auto;
  const [focus, setFocus] = React.useState(false);
  const widths = { full: "100%", lg: "24em", md: "16em", sm: "10em", xs: "6em" };
  return (
    <div style={{ maxWidth: widths[width] || width }}>
      {label ? <label htmlFor={inputId} style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--type-label-size)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)" }}>{label}</label> : null}
      {hint ? <p style={{ marginBottom: "var(--space-2)", fontSize: "var(--type-hint-size)", color: "var(--text-muted)" }}>{hint}</p> : null}
      {error ? <p style={{ marginBottom: "var(--space-2)", fontSize: "var(--fs-14)", fontWeight: "var(--fw-medium)", color: "var(--status-error-fg)" }}>{error}</p> : null}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {prefix ? <span style={{ display: "flex", alignItems: "center", padding: "0 var(--space-3)", background: "var(--ink-100)", border: "1px solid var(--border-input)", borderRight: 0, borderRadius: "var(--radius-control) 0 0 var(--radius-control)", color: "var(--text-muted)", fontSize: "var(--fs-14)" }}>{prefix}</span> : null}
        <input
          id={inputId} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ ...base(!!error, focus), borderRadius: prefix ? "0 var(--radius-control) var(--radius-control) 0" : "var(--radius-control)" }}
          {...rest}
        />
        {suffix ? <span style={{ display: "flex", alignItems: "center", paddingLeft: "var(--space-2)", color: "var(--text-muted)", fontSize: "var(--fs-14)" }}>{suffix}</span> : null}
      </div>
    </div>
  );
}

/** Multi-line field. Rows are generous; CJK paragraphs run long. */
export function Textarea({ label, hint, error, rows = 5, id, ...rest }) {
  const auto = React.useId();
  const inputId = id || auto;
  const [focus, setFocus] = React.useState(false);
  return (
    <div>
      {label ? <label htmlFor={inputId} style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--type-label-size)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)" }}>{label}</label> : null}
      {hint ? <p style={{ marginBottom: "var(--space-2)", fontSize: "var(--type-hint-size)", color: "var(--text-muted)" }}>{hint}</p> : null}
      <textarea id={inputId} rows={rows} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...base(!!error, focus), lineHeight: "var(--lh-body)", resize: "vertical" }} {...rest} />
    </div>
  );
}
