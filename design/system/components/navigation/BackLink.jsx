import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/** Text back link above the question. Answers are saved before it navigates. */
export function BackLink({ children, onClick, href = "#" }) {
  const label = children !== undefined ? children : t("nav.back");
  return (
    <a href={href} onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", minHeight: "var(--touch-min)", fontSize: "var(--fs-16)", color: "var(--text-link)" }}>
      <Icon name="chevron-left" size={18} />{label}
    </a>
  );
}
