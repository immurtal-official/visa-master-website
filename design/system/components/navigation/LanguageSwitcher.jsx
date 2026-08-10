import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";
import { languageName } from "../core/languages.js";

/* Each language names itself, in its own script, in every locale — so the names come from
   languages.js, not the catalogue. The note beneath is the reason this component exists:
   switching the interface language does NOT change the language of the delivered pack,
   which the destination consulate decides. Users assume otherwise, so it is permanent copy
   ("language.note"), never a tooltip. */
const LANGS = [{ code: "zh-CN", name: languageName("zh-CN") }, { code: "en", name: languageName("en") }];

/** Interface-language switcher. Each language names itself, in its own language — never a flag. */
export function LanguageSwitcher({
  value = "zh-CN",
  onChange,
  languages = LANGS,
  placement = "header",
  note,
  tone = placement === "footer" ? "inverse" : "default",
  style,
}) {
  const inverse = tone === "inverse";
  const stacked = placement !== "header";
  const noteText = note !== undefined ? note : t("language.note");
  const muted = inverse ? "var(--blue-300)" : "var(--text-muted)";

  return (
    <div style={{
      display: "flex", flexDirection: stacked ? "column" : "row", flexWrap: "wrap",
      alignItems: stacked ? "stretch" : "center", gap: stacked ? "var(--space-2)" : "var(--space-3)",
      minInlineSize: 0, ...style,
    }}>
      <div role="group" aria-label={t("language.groupLabel")}
        style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, padding: 2,
          background: inverse ? "rgba(255,255,255,.08)" : "var(--ink-50)",
          border: `1px solid ${inverse ? "var(--blue-800)" : "var(--border-subtle)"}`,
          borderRadius: "var(--radius-pill)",
        }}>
        <Icon name="languages" size={16} style={{ color: muted, marginInline: "6px 2px" }} />
        {languages.map((l) => {
          const on = l.code === value;
          return (
            <button key={l.code} type="button" lang={l.code} aria-pressed={on}
              onClick={() => onChange && onChange(l.code)}
              style={{
                minHeight: stacked ? "var(--touch-min)" : 34,
                paddingInline: "var(--space-4)", border: 0, borderRadius: "var(--radius-pill)",
                background: on ? (inverse ? "var(--white)" : "var(--action-primary)") : "transparent",
                color: on ? (inverse ? "var(--blue-900)" : "var(--white)") : (inverse ? "var(--blue-100)" : "var(--text-body)"),
                fontSize: "var(--fs-14)", fontWeight: on ? "var(--fw-medium)" : "var(--fw-regular)",
                cursor: "pointer", transition: "var(--transition-control)", whiteSpace: "normal", textAlign: "center",
              }}>
              {l.name}
            </button>
          );
        })}
      </div>
      <p style={{
        margin: 0, fontSize: "var(--fs-12)", lineHeight: 1.6, color: muted,
        maxInlineSize: stacked ? "none" : "26em", textWrap: "pretty",
      }}>
        {noteText}
      </p>
    </div>
  );
}
