import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/**
 * Resumable uploader. Chunked, so a WeChat-browser tab switch does not lose a
 * 40MB bank statement. Desktop accepts multi-file drag-and-drop; touch opens the picker.
 */
export function ResumableUploader({ files = [], onPick, onRetry, hint, style }) {
  const hintText = hint !== undefined ? hint : t("upload.hint");
  const [over, setOver] = React.useState(false);
  return (
    <div style={{ ...style }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); onPick && onPick(); }}
        onClick={onPick}
        style={{
          display: "grid", placeItems: "center", gap: "var(--space-2)",
          padding: "var(--space-8) var(--space-5)", textAlign: "center",
          background: over ? "var(--surface-selected)" : "var(--white)",
          border: `2px dashed ${over ? "var(--blue-500)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-card)", cursor: "pointer",
          transition: "var(--transition-control)",
        }}>
        <Icon name="upload" size={24} style={{ color: "var(--blue-600)" }} />
        <div style={{ fontSize: "var(--fs-16)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)" }}>{t("upload.dropzone")}</div>
        <div style={{ fontSize: "var(--fs-14)", color: "var(--text-muted)" }}>{hintText}</div>
        <div style={{ fontSize: "var(--fs-12)", color: "var(--text-faint)" }}>{t("upload.resumeNote")}</div>
      </div>
      {files.length ? (
        <ul style={{ listStyle: "none", margin: "var(--space-4) 0 0", padding: 0, display: "grid", gap: "var(--space-2)" }}>
          {files.map((f) => {
            const failed = f.state === "failed";
            const done = f.progress >= 100;
            return (
              <li key={f.name} style={{ padding: "var(--space-3) var(--space-4)", background: "var(--white)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <Icon name={done ? "circle-check" : failed ? "pause" : "arrow-up-from-line"} size={18} style={{ color: done ? "var(--green-600)" : failed ? "var(--amber-600)" : "var(--blue-600)" }} />
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--fs-14)", color: "var(--text-body)" }}>{f.name}</span>
                  <span style={{ fontFamily: "var(--font-num)", fontSize: "var(--fs-12)", color: "var(--text-faint)" }}>{f.size}</span>
                  {failed && onRetry ? (
                    <button type="button" onClick={() => onRetry(f.name)} style={{ minHeight: 32, padding: "0 var(--space-3)", background: "transparent", border: "1px solid var(--amber-100)", borderRadius: "var(--radius-control)", color: "var(--amber-600)", fontSize: "var(--fs-12)", cursor: "pointer" }}>{t("upload.resume")}</button>
                  ) : null}
                </div>
                {!done ? (
                  <div style={{ marginTop: "var(--space-2)", height: 4, background: "var(--ink-200)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
                    <div style={{ width: `${f.progress || 0}%`, height: "100%", background: failed ? "var(--amber-500)" : "var(--blue-500)", transition: "width var(--dur-base) var(--ease-out)" }} />
                  </div>
                ) : null}
                {failed ? <p style={{ marginTop: "var(--space-2)", fontSize: "var(--fs-12)", color: "var(--amber-600)" }}>{t("upload.interrupted", { progress: f.progress })}</p> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
