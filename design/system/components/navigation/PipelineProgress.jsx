import React from "react";
import { Icon } from "../core/Icon.jsx";
import { t } from "../core/i18n.jsx";

/* The pipeline is always these four stages, in this order. Not configurable: the sequence
   is what the service does, and a user who comes back an hour later has to find the same
   four rows in the same places. */
export const PIPELINE_STAGES = ["sources", "generate", "consistency", "review"];
const STAGE_KEY = { sources: "pipeline.stage.sources", generate: "pipeline.stage.generate", consistency: "pipeline.stage.consistency", review: "pipeline.stage.review" };
const STATE = {
  done: { key: "pipeline.state.done", icon: "circle-check", fg: "var(--green-600)", bg: "var(--green-50)" },
  active: { key: "pipeline.state.active", icon: "loader-circle", fg: "var(--blue-600)", bg: "var(--surface-selected)" },
  pending: { key: "pipeline.state.pending", icon: "circle-dashed", fg: "var(--text-faint)", bg: "var(--ink-100)" },
  blocked: { key: "pipeline.state.blocked", icon: "triangle-alert", fg: "var(--amber-600)", bg: "var(--amber-50)" },
};

/**
 * Progress of the asynchronous pack pipeline. Distinct from StepProgress, which is
 * intake-shaped (section / step / total, one screen at a time, driven by the user).
 * This is machine work the user waits on: minutes to hours, four named stages, and the
 * page can be closed and reopened at any point — so it states that closing is safe and
 * always renders every stage, including the ones not started.
 */
export function PipelineProgress({ current = 0, states = {}, notes = {}, etaMinutes, leaveNote = true, title = true, style }) {
  const stateOf = (name, i) => states[name] || (i < current ? "done" : i === current ? "active" : "pending");
  return (
    <section style={{
      padding: "var(--space-5)", background: "var(--white)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)", display: "grid", gap: "var(--space-4)", ...style,
    }}>
      {title ? (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <h3 style={{ fontSize: "var(--fs-18)", lineHeight: 1.5, color: "var(--text-heading)" }}>{t("pipeline.title")}</h3>
          <span style={{ fontSize: "var(--fs-14)", fontFamily: "var(--font-num)", color: "var(--text-muted)" }}>{t("pipeline.stageOf", { n: Math.min(current + 1, PIPELINE_STAGES.length), total: PIPELINE_STAGES.length })}</span>
        </div>
      ) : null}
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 0 }}>
        {PIPELINE_STAGES.map((name, i) => {
          const s = STATE[stateOf(name, i)] || STATE.pending;
          const last = i === PIPELINE_STAGES.length - 1;
          return (
            <li key={name} style={{ display: "flex", gap: "var(--space-3)" }}>
              <div style={{ flex: "none", display: "grid", justifyItems: "center", gap: 2 }}>
                <span style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "50%", background: s.bg, color: s.fg }}>
                  <Icon name={s.icon} size={16} />
                </span>
                {!last ? <span style={{ width: 2, flex: 1, minHeight: 22, background: "var(--border-subtle)", borderRadius: 1 }} /> : null}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : "var(--space-4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", minHeight: 30 }}>
                  <span style={{ fontSize: "var(--fs-16)", fontWeight: "var(--fw-medium)", color: s === STATE.pending ? "var(--text-muted)" : "var(--text-heading)" }}>{t(STAGE_KEY[name])}</span>
                  <span style={{ fontSize: "var(--fs-12)", color: s.fg }}>{t(s.key)}</span>
                </div>
                {notes[name] ? <p style={{ marginTop: 2, fontSize: "var(--fs-14)", lineHeight: 1.75, color: "var(--text-muted)", maxWidth: "var(--measure-prose)" }}>{notes[name]}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {etaMinutes != null ? (
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-14)", color: "var(--text-muted)" }}>
          <Icon name="clock" size={15} style={{ color: "var(--text-faint)" }} />{t("pipeline.eta", { minutes: etaMinutes })}
        </p>
      ) : null}
      {leaveNote ? (
        <p style={{
          display: "flex", gap: "var(--space-2)", padding: "var(--space-3) var(--space-4)",
          background: "var(--surface-teal-soft)", border: "1px solid var(--teal-100)",
          borderRadius: "var(--radius-sm)", fontSize: "var(--fs-14)", lineHeight: 1.75, color: "var(--text-muted)",
        }}>
          <Icon name="cloud-check" size={16} style={{ marginTop: 3, color: "var(--teal-600)" }} />
          <span>{t("pipeline.leaveNote")}</span>
        </p>
      ) : null}
    </section>
  );
}
