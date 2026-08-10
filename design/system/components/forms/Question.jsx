import React from "react";

/**
 * One question per page. The question IS the page heading; the explanation sits
 * inline beneath it (never a tooltip — hover does not exist on touch).
 */
export function Question({ question, hint, error, children, as = "h1", legend, footnote, style }) {
  const H = as;
  const id = React.useId();
  return (
    <div style={{ maxWidth: "var(--measure-question)", ...style }}>
      <H style={{
        fontSize: "var(--type-question-size)", lineHeight: "var(--type-question-lh)",
        fontWeight: "var(--fw-semibold)", color: "var(--text-heading)", margin: 0,
      }}>{question}</H>
      {hint ? (
        <p id={`${id}-hint`} style={{ marginTop: "var(--space-2)", fontSize: "var(--type-hint-size)", lineHeight: "var(--type-hint-lh)", color: "var(--text-muted)" }}>{hint}</p>
      ) : null}
      {legend ? (
        <p style={{ marginTop: "var(--space-2)", fontSize: "var(--fs-14)", color: "var(--text-faint)" }}>{legend}</p>
      ) : null}
      {error ? (
        <p role="alert" style={{
          display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)",
          paddingLeft: "var(--space-3)", borderLeft: "4px solid var(--red-500)",
          color: "var(--status-error-fg)", fontSize: "var(--fs-16)", fontWeight: "var(--fw-medium)",
        }}>{error}</p>
      ) : null}
      <div style={{ marginTop: "var(--space-5)" }}>{children}</div>
      {footnote ? (
        <p style={{ marginTop: "var(--space-5)", fontSize: "var(--fs-14)", color: "var(--text-faint)", lineHeight: 1.6 }}>{footnote}</p>
      ) : null}
    </div>
  );
}
