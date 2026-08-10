import React from "react";
import { Wordmark } from "./SiteHeader.jsx";

/** Deep navy footer. Carries the regulatory line and the record number mainland sites require. */
export function SiteFooter({ columns = [], note, record, language }) {
  return (
    <footer style={{ background: "var(--surface-inverse)", color: "var(--blue-100)", padding: "var(--space-12) var(--gutter-desktop) var(--space-8)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <Wordmark tone="inverse" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "var(--space-8)", marginTop: "var(--space-8)" }}>
          {columns.map((c) => (
            <div key={c.title}>
              <div style={{ fontSize: "var(--fs-14)", fontWeight: "var(--fw-semibold)", color: "var(--white)", marginBottom: "var(--space-3)" }}>{c.title}</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-2)" }}>
                {c.links.map((l) => <li key={l}><a href="#" style={{ fontSize: "var(--fs-14)", color: "var(--blue-200)", textDecoration: "none" }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        {language ? <div style={{ marginTop: "var(--space-8)" }}>{language}</div> : null}
        <div style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-5)", borderTop: "1px solid var(--blue-800)", display: "flex", flexWrap: "wrap", gap: "var(--space-4)", justifyContent: "space-between", fontSize: "var(--fs-12)", color: "var(--blue-300)", lineHeight: 1.8 }}>
          <span>{note}</span><span style={{ fontFamily: "var(--font-num)" }}>{record}</span>
        </div>
      </div>
    </footer>
  );
}
