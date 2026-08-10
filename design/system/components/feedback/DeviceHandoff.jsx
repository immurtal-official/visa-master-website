import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/**
 * Cross-device handoff. Two shapes, one component:
 *   mode="continue" — carry the session to another device at any long step. A normal
 *     choice (phone on the train, desktop at home), offered everywhere, not a fallback.
 *   mode="camera"   — a desktop session borrows the phone's camera; shots land here.
 *
 * The QR itself is rendered by the app (`qrSrc`: a data-URI or blob the server signs),
 * because the code carries a one-time token this design system must not mint. Without it
 * the slot shows the typed code, which is always offered as an equal path — QR scanning
 * fails often enough on older Android that a code-only route cannot be the fallback.
 */
export function DeviceHandoff({ mode = "continue", url, code, qrSrc, minutes = 15, state, device, onCopy, style }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (url && typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    if (onCopy) onCopy(url);
  };
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "var(--space-5)", padding: "var(--space-5)",
      background: "var(--white)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)", ...style,
    }}>
      <div style={{ flex: "none", display: "grid", gap: "var(--space-2)", justifyItems: "center" }}>
        <div style={{
          width: 148, height: 148, display: "grid", placeItems: "center", padding: "var(--space-2)",
          background: "var(--white)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)",
        }}>
          {qrSrc
            ? <img src={qrSrc} alt={t("handoff.qrPlaceholder")} width={128} height={128} style={{ display: "block", width: 128, height: 128, imageRendering: "pixelated" }} />
            : <span style={{ display: "grid", gap: 6, justifyItems: "center", color: "var(--text-faint)" }}>
                <Icon name="qr-code" size={40} />
                <span style={{ fontSize: "var(--fs-12)" }}>{t("handoff.qrPlaceholder")}</span>
              </span>}
        </div>
        <span style={{ fontSize: "var(--fs-12)", color: "var(--text-faint)" }}>{t("handoff.expires", { minutes })}</span>
      </div>
      <div style={{ flex: "1 1 260px", minWidth: 0, display: "grid", gap: "var(--space-3)", alignContent: "start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Icon name={mode === "camera" ? "camera" : "smartphone"} size={18} style={{ color: "var(--blue-600)" }} />
          <h3 style={{ fontSize: "var(--fs-18)", lineHeight: 1.5, color: "var(--text-heading)" }}>{t(mode === "camera" ? "handoff.title.camera" : "handoff.title.continue")}</h3>
        </div>
        <p style={{ fontSize: "var(--fs-14)", lineHeight: 1.8, color: "var(--text-muted)", maxWidth: "var(--measure-prose)" }}>{t(mode === "camera" ? "handoff.body.camera" : "handoff.body.continue")}</p>
        {code ? (
          <div style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: "var(--fs-12)", color: "var(--text-faint)" }}>{t("handoff.codeLabel")}</span>
            <span style={{
              justifySelf: "start", padding: "var(--space-2) var(--space-3)", background: "var(--ink-50)",
              border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-num)", fontSize: "var(--fs-20)", letterSpacing: ".16em", color: "var(--text-heading)",
            }}>{code}</span>
            {url ? <span style={{ fontSize: "var(--fs-12)", color: "var(--text-faint)", lineHeight: 1.7 }}>{t("handoff.codeHint", { url: String(url).replace(/^https?:\/\//, "").split("?")[0] })}</span> : null}
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {url ? (
            <button type="button" onClick={copy} style={{
              minHeight: 36, padding: "0 var(--space-4)", background: "var(--white)",
              border: "1px solid var(--action-secondary-border)", borderRadius: "var(--radius-control)",
              color: "var(--action-secondary-fg)", fontSize: "var(--fs-14)", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}><Icon name={copied ? "check" : "link"} size={15} />{copied ? t("common.copied") : t("common.copy")}</button>
          ) : null}
          {state ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-14)", color: state === "connected" ? "var(--green-600)" : "var(--text-muted)" }}>
              <Icon name={state === "connected" ? "circle-check" : "loader-circle"} size={15} />
              {state === "connected" ? t("handoff.connected", { device: device || t("handoff.qrPlaceholder") }) : t("handoff.waiting")}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
