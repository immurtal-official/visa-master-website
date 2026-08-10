import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Badge } from "../core/Badge.jsx";
import { t } from "../core/i18n.jsx";

const STATE = {
  done: { key: "tasklist.state.done", tone: "success" },
  progress: { key: "tasklist.state.progress", tone: "info" },
  todo: { key: "tasklist.state.todo", tone: "neutral" },
  locked: { key: "tasklist.state.locked", tone: "neutral" },
  problem: { key: "tasklist.state.problem", tone: "warning" },
};

/**
 * The intake hub, GOV.UK task-list shaped: every section listed with its state, jump in
 * anywhere, come back to the same page. It is what makes 25 screens feel like nine
 * sections you are working through rather than a queue with no end. Always the whole list —
 * hiding future sections is what makes a long form feel endless.
 *
 * A locked section states what unlocks it. It is never simply greyed out and silent.
 */
export function TaskList({ sections = [], onSelect, summary = true, style }) {
  const items = sections.flatMap((s) => s.items || []);
  const done = items.filter((i) => i.state === "done").length;
  return (
    <div style={{ display: "grid", gap: "var(--space-5)", ...style }}>
      {summary && items.length ? (
        <p style={{ fontSize: "var(--fs-16)", color: "var(--text-body)" }}>{t("tasklist.summary", { done, total: items.length })}</p>
      ) : null}
      {sections.map((section, si) => (
        <section key={section.id}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", marginBottom: "var(--space-2)" }}>
            <h3 style={{ fontSize: "var(--fs-18)", lineHeight: 1.5, color: "var(--text-heading)" }}>
              <span style={{ fontFamily: "var(--font-num)", color: "var(--text-faint)", marginInlineEnd: "var(--space-2)" }}>{si + 1}</span>
              {section.title}
            </h3>
            {section.items && section.items.length ? (
              <span style={{ fontSize: "var(--fs-12)", fontFamily: "var(--font-num)", color: "var(--text-faint)" }}>
                {t("tasklist.itemsDone", { done: section.items.filter((i) => i.state === "done").length, total: section.items.length })}
              </span>
            ) : null}
          </div>
          {section.description ? <p style={{ marginBottom: "var(--space-2)", fontSize: "var(--fs-14)", lineHeight: 1.75, color: "var(--text-muted)", maxWidth: "var(--measure-prose)" }}>{section.description}</p> : null}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--border-subtle)" }}>
            {(section.items || []).map((item) => {
              const s = STATE[item.state] || STATE.todo;
              const locked = item.state === "locked";
              return (
                <li key={item.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <button
                    type="button"
                    disabled={locked}
                    aria-disabled={locked || undefined}
                    onClick={() => !locked && onSelect && onSelect(item, section)}
                    style={{
                      width: "100%", minHeight: "var(--touch-min)", display: "flex", alignItems: "center",
                      gap: "var(--space-3)", padding: "var(--space-3) var(--space-2)", textAlign: "start",
                      background: "transparent", border: 0, cursor: locked ? "default" : "pointer",
                      font: "inherit", color: "inherit",
                    }}>
                    <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 2 }}>
                      <span style={{
                        fontSize: "var(--fs-16)", color: locked ? "var(--text-faint)" : "var(--action-link)",
                        textDecoration: locked ? "none" : "underline", textUnderlineOffset: 3, textDecorationThickness: 1,
                      }}>{item.title}</span>
                      {locked && item.after ? <span style={{ fontSize: "var(--fs-12)", color: "var(--text-faint)", lineHeight: 1.7 }}>{t("tasklist.lockedHint", { section: item.after })}</span> : null}
                      {!locked && item.hint ? <span style={{ fontSize: "var(--fs-12)", color: "var(--text-faint)", lineHeight: 1.7 }}>{item.hint}</span> : null}
                    </span>
                    <Badge size="sm" tone={s.tone}>{t(s.key)}</Badge>
                    {!locked ? <Icon name="chevron-right" size={16} style={{ color: "var(--text-faint)" }} /> : <span style={{ width: 16 }} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
