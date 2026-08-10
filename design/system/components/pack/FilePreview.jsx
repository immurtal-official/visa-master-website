import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Badge } from "../core/Badge.jsx";
import { t } from "../core/i18n.jsx";

/**
 * Preview pane for one file in the pack: what it is, why it is in the pack,
 * and what the applicant is supposed to do with the printed copy.
 */
export function FilePreview({ file, style }) {
  if (!file) return null;
  return (
    <div style={{ display: "grid", gap: "var(--space-4)", ...style }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <h3 style={{ fontSize: "var(--fs-20)", lineHeight: 1.4 }}>{file.name}</h3>
          {file.badge ? <Badge tone={file.badgeTone || "neutral"}>{file.badge}</Badge> : null}
        </div>
        {file.purpose ? <p style={{ marginTop: "var(--space-2)", fontSize: "var(--fs-14)", color: "var(--text-muted)", lineHeight: 1.75, maxWidth: "var(--measure-prose)" }}>{file.purpose}</p> : null}
      </div>
      <div style={{
        aspectRatio: "1 / 1.414", maxHeight: 420, background: "var(--white)",
        border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
        boxShadow: "var(--shadow-2)", padding: "var(--space-6)", overflow: "hidden",
      }}>
        <div style={{ display: "grid", gap: 9 }}>
          <div style={{ height: 12, width: "52%", background: "var(--ink-200)", borderRadius: 2 }} />
          <div style={{ height: 7, width: "34%", background: "var(--ink-100)", borderRadius: 2, marginBottom: 10 }} />
          {[92, 88, 96, 71, 90, 84, 58, 93, 86, 64].map((w, i) => (
            <div key={i} style={{ height: 6, width: `${w}%`, background: "var(--ink-100)", borderRadius: 2 }} />
          ))}
        </div>
      </div>
      {file.instructions && file.instructions.length ? (
        <ol style={{ margin: 0, paddingLeft: "1.4em", display: "grid", gap: "var(--space-2)", fontSize: "var(--fs-14)", color: "var(--text-body)", lineHeight: 1.75 }}>
          {file.instructions.map((s) => <li key={s}>{s}</li>)}
        </ol>
      ) : null}
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", fontSize: "var(--fs-12)", color: "var(--text-faint)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="printer" size={14} />{file.print || t("file.printA4")}</span>
        {file.pages ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="files" size={14} />{t("file.pages", { count: file.pages })}</span> : null}
        {file.updated ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="clock" size={14} />{file.updated}</span> : null}
      </div>
    </div>
  );
}
