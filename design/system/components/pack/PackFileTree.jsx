import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Badge } from "../core/Badge.jsx";
import { t } from "../core/i18n.jsx";
import { languageName } from "../core/languages.js";

const KIND_ICON = { pdf: "file-text", doc: "file-pen-line", img: "image", link: "external-link", folder: "folder" };
const STATUS = {
  ready: { tone: "success", key: "packStatus.ready" },
  review: { tone: "info", key: "packStatus.review" },
  waiting: { tone: "warning", key: "packStatus.waiting" },
  official: { tone: "neutral", key: "packStatus.official" },
};

/* Status accepts the four known states OR an arbitrary { label, tone } — the pack picks up
   destination-specific states (公证中, 已寄出) that this design system cannot enumerate.
   Language is a separate field on purpose: it used to get smuggled in as a status value,
   which is how a file's language became invisible when its status changed. */
function statusOf(status) {
  if (!status) return null;
  if (typeof status === "object") return { tone: status.tone || "neutral", label: status.label };
  const s = STATUS[status];
  return s ? { tone: s.tone, label: t(s.key) } : null;
}

/** The file's own language, shown in its own script. Never the interface language. */
function LanguageChip({ language }) {
  const code = typeof language === "object" ? language.code : language;
  const name = (typeof language === "object" && language.name) || languageName(code);
  const label = name || t("packTree.languageUnknown");
  return (
    <span
      title={t("packTree.languageAria", { language: label })}
      aria-label={t("packTree.languageAria", { language: label })}
      lang={code || undefined}
      style={{
        flex: "none", display: "inline-flex", alignItems: "center", gap: 4,
        padding: "1px 7px 1px 5px", borderRadius: "var(--radius-chip)",
        border: "1px solid var(--border-default)", background: "var(--white)",
        fontSize: "var(--fs-12)", color: "var(--text-muted)", whiteSpace: "nowrap",
      }}>
      <Icon name="globe" size={12} style={{ color: "var(--text-faint)" }} />{label}
    </span>
  );
}

function Node({ node, depth, openIds, toggle, selectedId, onSelect }) {
  const isFolder = !!node.children;
  const open = openIds.includes(node.id);
  const selected = selectedId === node.id;
  const status = statusOf(node.status);
  return (
    <li>
      <div
        onClick={() => (isFolder ? toggle(node.id) : onSelect && onSelect(node))}
        style={{
          display: "flex", alignItems: "center", gap: "var(--space-2)",
          minHeight: "var(--touch-min)", padding: "var(--space-2) var(--space-3)",
          paddingLeft: `calc(var(--space-3) + ${depth * 18}px)`,
          background: selected ? "var(--surface-selected)" : "transparent",
          borderRadius: "var(--radius-sm)", cursor: "pointer",
          color: isFolder ? "var(--text-heading)" : "var(--text-body)",
          fontWeight: isFolder ? "var(--fw-semibold)" : "var(--fw-regular)",
          fontSize: isFolder ? "var(--fs-15,15px)" : "var(--fs-14)",
        }}>
        {isFolder ? <Icon name={open ? "chevron-down" : "chevron-right"} size={16} style={{ color: "var(--text-faint)" }} /> : <span style={{ width: 16 }} />}
        <Icon name={isFolder ? "folder" : KIND_ICON[node.kind] || "file"} size={17} style={{ color: isFolder ? "var(--blue-500)" : "var(--text-faint)" }} />
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
        {node.language ? <LanguageChip language={node.language} /> : null}
        {node.count != null ? <span style={{ fontSize: "var(--fs-12)", fontFamily: "var(--font-num)", color: "var(--text-faint)" }}>{node.count}</span> : null}
        {status ? <Badge size="sm" tone={status.tone}>{status.label}</Badge> : null}
      </div>
      {isFolder && open ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {node.children.map((c) => <Node key={c.id} node={c} depth={depth + 1} openIds={openIds} toggle={toggle} selectedId={selectedId} onSelect={onSelect} />)}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * The delivered pack, as a tree. Sections are fixed and always in this order:
 * 从这里开始 / 官方文件 / 可编辑模板 / 本人材料 / 来源与提醒.
 *
 * Every file carries its own `language`, set by the destination country, and the tree
 * shows it on the row. The interface language never stands in for it.
 */
export function PackFileTree({ tree = [], selectedId, onSelect, defaultOpen, languageNote = true, style }) {
  const [openIds, setOpenIds] = React.useState(defaultOpen || tree.map((t2) => t2.id));
  const toggle = (id) => setOpenIds((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
    <nav style={{ ...style }}>
      {languageNote ? (
        <p style={{
          display: "flex", gap: "var(--space-2)", margin: "0 0 var(--space-3)", padding: "var(--space-2) var(--space-3)",
          background: "var(--ink-50)", borderRadius: "var(--radius-sm)",
          fontSize: "var(--fs-12)", lineHeight: 1.7, color: "var(--text-muted)",
        }}>
          <Icon name="globe" size={14} style={{ marginTop: 3, color: "var(--text-faint)" }} />
          <span>{t("packTree.languageNote")}</span>
        </p>
      ) : null}
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
        {tree.map((n) => <Node key={n.id} node={n} depth={0} openIds={openIds} toggle={toggle} selectedId={selectedId} onSelect={onSelect} />)}
      </ul>
    </nav>
  );
}
