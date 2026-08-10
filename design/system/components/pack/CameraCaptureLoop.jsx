import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/**
 * Multi-page capture loop: shoot, keep, shoot the next page. Thumbnails stay on
 * screen and can be reordered, because page order is what the consulate reads.
 */
export function CameraCaptureLoop({ pages = [], onCapture, onRemove, onMove, guide, label, style }) {
  const guideText = guide !== undefined ? guide : t("camera.guide");
  const pageLabel = (n) => (label !== undefined ? String(label).replace("{n}", n) : t("camera.page", { n }));
  return (
    <div style={{ ...style }}>
      <div style={{
        position: "relative", aspectRatio: "3 / 4", maxHeight: 320, borderRadius: "var(--radius-card)",
        background: "var(--ink-900)", overflow: "hidden", display: "grid", placeItems: "center",
      }}>
        <div style={{ position: "absolute", inset: "10% 8%", border: "2px solid rgba(255,255,255,.55)", borderRadius: "var(--radius-sm)" }} />
        <span style={{ position: "absolute", top: "var(--space-3)", left: 0, right: 0, textAlign: "center", fontSize: "var(--fs-12)", color: "rgba(255,255,255,.85)" }}>{guideText}</span>
        <button type="button" aria-label={t("camera.capture")} onClick={onCapture}
          style={{ position: "absolute", bottom: "var(--space-4)", width: 60, height: 60, borderRadius: "50%", border: "4px solid rgba(255,255,255,.9)", background: "var(--white)", cursor: "pointer" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "var(--space-4) 0 var(--space-2)" }}>
        <span style={{ fontSize: "var(--fs-14)", fontWeight: "var(--fw-medium)", color: "var(--text-heading)" }}>{t("camera.captured", { n: pages.length })}</span>
        <span style={{ fontSize: "var(--fs-12)", color: "var(--text-faint)" }}>{t("camera.reorderHint")}</span>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: "var(--space-3)", overflowX: "auto" }}>
        {pages.map((p, i) => (
          <li key={p.id} style={{ flex: "none", width: 84 }}>
            <div style={{ position: "relative", aspectRatio: "3 / 4", background: p.thumb || "var(--ink-100)", backgroundSize: "cover", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              <span style={{ position: "absolute", left: 4, top: 4, padding: "1px 6px", borderRadius: "var(--radius-chip)", background: "rgba(11,37,69,.72)", color: "var(--white)", fontSize: "var(--fs-12)", fontFamily: "var(--font-num)" }}>{i + 1}</span>
              {onRemove ? (
                <button type="button" aria-label={t("camera.deletePage", { n: i + 1 })} onClick={() => onRemove(p.id)}
                  style={{ position: "absolute", right: 2, top: 2, width: 22, height: 22, display: "grid", placeItems: "center", borderRadius: "50%", border: 0, background: "rgba(11,37,69,.72)", color: "var(--white)", cursor: "pointer" }}>
                  <Icon name="x" size={12} />
                </button>
              ) : null}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 4 }}>
              <button type="button" aria-label={t("camera.moveEarlier")} onClick={() => onMove && onMove(i, -1)} style={{ width: 30, height: 26, border: "1px solid var(--border-subtle)", background: "var(--white)", borderRadius: "var(--radius-xs)", color: "var(--text-muted)", cursor: "pointer" }}><Icon name="chevron-left" size={13} /></button>
              <button type="button" aria-label={t("camera.moveLater")} onClick={() => onMove && onMove(i, 1)} style={{ width: 30, height: 26, border: "1px solid var(--border-subtle)", background: "var(--white)", borderRadius: "var(--radius-xs)", color: "var(--text-muted)", cursor: "pointer" }}><Icon name="chevron-right" size={13} /></button>
            </div>
            <div style={{ textAlign: "center", fontSize: "var(--fs-12)", color: "var(--text-faint)", marginTop: 2 }}>{pageLabel(i + 1)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
