import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";
import { expose } from "../core/expose.js";

/** True inside the WeChat webview, where downloads and Alipay handoffs both die silently. */
export function isWeChat(ua) {
  const s = ua || (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return /MicroMessenger/i.test(s);
}

// Lowercase, so the bundle keeps it internal unless it is published. See core/expose.js.
expose({ isWeChat });

const BODY = { payment: "wechat.body.payment", download: "wechat.body.download", alipay: "wechat.body.alipay" };

/**
 * The one escape hatch out of the WeChat webview. Downloads and Alipay handoffs are both
 * dead in there, so the same overlay covers both: it appears at payment and again at
 * delivery, and it carries the auth handoff token in the link so the browser lands signed
 * in and on the same step. Never a toast, never dismissible into nothing — the user cannot
 * finish the task inside WeChat, so the overlay owns the screen until they leave or cancel.
 */
export function WeChatEscape({ open, reason = "download", url, tokenMinutes = 30, onCopy, onDismiss, style }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => { if (!open) setCopied(false); }, [open]);
  if (!open) return null;
  const copy = () => {
    if (url && typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    if (onCopy) onCopy(url);
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={t("wechat.title")}
      style={{
        position: "fixed", inset: 0, zIndex: 80, display: "grid", alignItems: "start",
        background: "rgba(11,37,69,.82)", padding: "var(--space-4)", overflowY: "auto", ...style,
      }}>
      <div aria-hidden="true" style={{ position: "absolute", top: 10, right: 18, display: "flex", alignItems: "center", gap: 6, color: "var(--white)" }}>
        <span style={{ fontSize: "var(--fs-14)", opacity: .85, letterSpacing: ".2em" }}>···</span>
        <Icon name="arrow-right" size={26} style={{ transform: "rotate(-40deg)", opacity: .85 }} />
      </div>
      <div style={{
        marginTop: 72, marginInline: "auto", width: "min(420px,100%)",
        background: "var(--white)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-3)",
        padding: "var(--space-5)", display: "grid", gap: "var(--space-4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span style={{ flex: "none", width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: "50%", background: "var(--surface-teal-soft)", color: "var(--teal-600)" }}>
            <Icon name="message-square" size={19} />
          </span>
          <h2 style={{ fontSize: "var(--fs-20)", lineHeight: 1.45, color: "var(--text-heading)" }}>{t("wechat.title")}</h2>
        </div>
        <p style={{ fontSize: "var(--fs-16)", lineHeight: 1.8, color: "var(--text-body)" }}>{t(BODY[reason] || BODY.download)}</p>
        <p style={{ fontSize: "var(--fs-14)", color: "var(--text-muted)" }}>{t("wechat.hint")}</p>
        {url ? (
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            <div style={{
              padding: "var(--space-3)", background: "var(--ink-50)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)", fontFamily: "var(--font-num)", fontSize: "var(--fs-12)",
              color: "var(--text-muted)", wordBreak: "break-all", lineHeight: 1.6,
            }}>{url}</div>
            <button type="button" onClick={copy} style={{
              minHeight: "var(--touch-min)", padding: "0 var(--space-4)", background: "var(--white)",
              border: "1px solid var(--action-secondary-border)", borderRadius: "var(--radius-control)",
              color: "var(--action-secondary-fg)", fontSize: "var(--fs-16)", cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
            }}>
              <Icon name={copied ? "check" : "link"} size={16} />{copied ? t("common.copied") : t("common.copy")}
            </button>
            <p style={{ display: "flex", gap: 6, fontSize: "var(--fs-12)", lineHeight: 1.7, color: "var(--text-faint)" }}>
              <Icon name="lock" size={13} style={{ marginTop: 2 }} />
              <span>{t("wechat.tokenNote", { minutes: tokenMinutes })}</span>
            </p>
          </div>
        ) : null}
        {onDismiss ? (
          <button type="button" onClick={onDismiss} style={{
            minHeight: 40, background: "transparent", border: 0, color: "var(--text-muted)",
            fontSize: "var(--fs-14)", cursor: "pointer",
          }}>{t("wechat.dismiss")}</button>
        ) : null}
      </div>
    </div>
  );
}
