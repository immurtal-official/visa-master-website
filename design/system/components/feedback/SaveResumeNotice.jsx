import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/** Quiet confirmation that the answer is stored and the link back is theirs to keep. */
export function SaveResumeNotice({ savedAt, email, onSend, style }) {
  const when = savedAt !== undefined ? savedAt : t("save.justNow");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap",
      padding: "var(--space-3) var(--space-4)", background: "var(--surface-teal-soft)",
      border: "1px solid var(--teal-100)", borderRadius: "var(--radius-card)",
      fontSize: "var(--fs-14)", color: "var(--text-muted)", ...style,
    }}>
      <Icon name="cloud-check" size={18} style={{ color: "var(--teal-600)" }} />
      <span>{t("save.saved", { when })}</span>
      {onSend ? <button type="button" onClick={onSend} style={{ marginLeft: "auto", minHeight: 32, padding: "0 var(--space-3)", background: "transparent", border: "1px solid var(--teal-300)", borderRadius: "var(--radius-control)", color: "var(--teal-700)", fontSize: "var(--fs-14)", cursor: "pointer" }}>{email ? t("save.sendLink", { email }) : t("save.sendLinkNoEmail")}</button> : null}
    </div>
  );
}
