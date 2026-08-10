import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Badge } from "../core/Badge.jsx";
import { t } from "../core/i18n.jsx";

const STATE = {
  done: { tone: "success", key: "uploadState.done", icon: "check" },
  checking: { tone: "info", key: "uploadState.checking", icon: "loader-circle" },
  todo: { tone: "neutral", key: "uploadState.todo", icon: "circle-dashed" },
  redo: { tone: "warning", key: "uploadState.redo", icon: "rotate-ccw" },
  optional: { tone: "neutral", key: "uploadState.optional", icon: "circle-dashed" },
};

/**
 * The upload checklist. Every item states WHY it is needed in one plain sentence —
 * that rationale is the difference between a chore and an explainable process.
 */
export function UploadChecklist({ items = [], onAction, style }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-3)", ...style }}>
      {items.map((it) => {
        const s = STATE[it.state] || STATE.todo;
        return (
          <li key={it.id} style={{
            display: "flex", gap: "var(--space-3)", padding: "var(--space-4)",
            background: "var(--white)", border: `1px solid ${it.state === "redo" ? "var(--amber-100)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-card)",
          }}>
            <span style={{
              flex: "none", width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "50%",
              background: it.state === "done" ? "var(--green-50)" : it.state === "redo" ? "var(--amber-50)" : "var(--ink-100)",
              color: it.state === "done" ? "var(--green-600)" : it.state === "redo" ? "var(--amber-600)" : "var(--text-faint)",
            }}><Icon name={s.icon} size={17} /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <span style={{ fontSize: "var(--fs-16)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)" }}>{it.title}</span>
                <Badge size="sm" tone={s.tone}>{t(s.key)}</Badge>
              </div>
              <p style={{ marginTop: 4, fontSize: "var(--fs-14)", color: "var(--text-muted)", lineHeight: 1.7 }}>{it.rationale}</p>
              {it.detail ? <p style={{ marginTop: "var(--space-2)", fontSize: "var(--fs-14)", color: it.state === "redo" ? "var(--amber-600)" : "var(--text-faint)" }}>{it.detail}</p> : null}
              {it.files && it.files.length ? (
                <ul style={{ listStyle: "none", margin: "var(--space-3) 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                  {it.files.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px var(--space-3)", background: "var(--ink-50)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-chip)", fontSize: "var(--fs-12)", color: "var(--text-muted)" }}>
                      <Icon name="paperclip" size={13} />{f}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {onAction ? (
              <button type="button" onClick={() => onAction(it.id)}
                style={{ alignSelf: "center", flex: "none", minHeight: "var(--touch-min)", padding: "0 var(--space-4)", background: it.state === "done" ? "transparent" : "var(--white)", border: "1px solid var(--action-secondary-border)", borderRadius: "var(--radius-control)", color: "var(--action-secondary-fg)", fontSize: "var(--fs-14)", cursor: "pointer" }}>
                {it.state === "done" ? t("upload.replace") : t("upload.upload")}
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
