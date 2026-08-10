import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/**
 * One overlay component, two presentations. Below 768px it is a bottom sheet with a
 * drag handle; above, a centred dialog. Never a centred modal on a phone.
 */
export function Sheet({ open, title, description, children, actions, onClose, mode }) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width:767px)");
    const f = () => setIsMobile(mq.matches);
    f(); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f);
  }, []);
  if (!open) return null;
  const sheet = mode ? mode === "sheet" : isMobile;
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      style={{
        position: "absolute", inset: 0, zIndex: 60, display: "flex",
        alignItems: sheet ? "flex-end" : "center", justifyContent: "center",
        background: "rgba(11,37,69,.44)", backdropFilter: "blur(2px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div style={{
        width: sheet ? "100%" : "min(520px,92%)",
        maxHeight: sheet ? "88%" : "84%", overflow: "auto",
        background: "var(--surface-card)",
        borderRadius: sheet ? "var(--radius-sheet) var(--radius-sheet) 0 0" : "var(--radius-card)",
        boxShadow: sheet ? "var(--shadow-sheet)" : "var(--shadow-3)",
        padding: `var(--space-5) var(--space-5) calc(var(--space-5) + var(--safe-bottom))`,
        animation: `vm-${sheet ? "rise" : "fade"} var(--dur-sheet) var(--ease-out)`,
      }}>
        {sheet ? <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--ink-300)", margin: "0 auto var(--space-4)" }} /> : null}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--fs-20)", lineHeight: 1.45 }}>{title}</h2>
          {!sheet && onClose ? (
            <button type="button" aria-label={t("common.close")} onClick={onClose} style={{ width: 36, height: 36, border: 0, background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
              <Icon name="x" size={20} />
            </button>
          ) : null}
        </div>
        {description ? <p style={{ marginTop: "var(--space-2)", fontSize: "var(--fs-14)", color: "var(--text-muted)", lineHeight: 1.7 }}>{description}</p> : null}
        <div style={{ marginTop: "var(--space-4)" }}>{children}</div>
        {actions ? <div style={{ display: "flex", flexDirection: sheet ? "column" : "row", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-6)" }}>{actions}</div> : null}
      </div>
    </div>
  );
}
