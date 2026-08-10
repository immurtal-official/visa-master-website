const { Button, Card, Badge, Callout, Icon, PackFileTree, FilePreview, ConsistencyReport, CitationPanel, TrustRow, Sheet, Locale } = window.VisaMasterDesignSystem_744fbe;

function PackDelivery({ mobile, lang = "zh-CN", onLang }) {
  const c = APP_TEXT[lang] || APP_TEXT["zh-CN"];
  Locale.set(lang);
  const [sel, setSel] = React.useState("f6");
  const [tab, setTab] = React.useState("file");
  const [openTree, setOpenTree] = React.useState(false);
  const file = c.files[sel] || c.fallbackFile;

  const tree = (
    <Card padding="8px" header={<span style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="folder-open" size={18} style={{ color: "var(--blue-600)" }} />{c.treeHeader}</span>}
      footer={<Button variant="secondary" block icon="download">{c.downloadAll}</Button>}>
      <PackFileTree tree={c.tree} selectedId={sel} onSelect={(n) => { setSel(n.id); setTab("file"); setOpenTree(false); }} />
    </Card>
  );

  const right = (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderBlockEnd: "1px solid var(--border-subtle)", paddingBlockEnd: 12 }}>
        {c.tabs.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            style={{ minHeight: 40, paddingInline: 14, border: 0, borderRadius: "var(--radius-control)", cursor: "pointer",
              background: tab === k ? "var(--surface-selected)" : "transparent",
              color: tab === k ? "var(--blue-800)" : "var(--text-muted)", fontSize: 15, fontWeight: tab === k ? 600 : 400 }}>{l}</button>
        ))}
      </div>
      {tab === "file" ? <FilePreview file={file} /> : null}
      {tab === "check" ? <ConsistencyReport summary={c.checkSummary} onResolve={() => {}} items={c.checks} /> : null}
      {tab === "src" ? <CitationPanel checkedAt="2026-08-01" sources={c.sources} caveats={c.caveats} /> : null}
    </div>
  );

  return (
    <div lang={lang} style={{ minHeight: mobile ? 720 : 760, background: "var(--surface-page)" }}>
      <AppHeader mobile={mobile} lang={lang} onLang={onLang} nav={[{ label: c.myApp }, { label: c.help }]}
        action={<Button size="sm" icon="download">{c.downloadShort}</Button>} />

      <div style={{ padding: mobile ? "20px var(--gutter-mobile)" : "28px var(--gutter-desktop)", background: "var(--white)", borderBlockEnd: "1px solid var(--border-subtle)" }}>
        <div style={{ maxInlineSize: "var(--container-max)", marginInline: "auto" }}>
          <Badge tone="success" icon="check">{c.packBadge}</Badge>
          <h1 style={{ marginBlockStart: 12, fontSize: mobile ? 24 : 30, lineHeight: "var(--type-h2-lh)" }}>{c.packTitle}</h1>
          <p style={{ marginBlockStart: 10, fontSize: 15, color: "var(--text-muted)", lineHeight: "var(--type-body-lh)", maxInlineSize: "42em" }}>{c.packLede}</p>
          <TrustRow style={{ marginBlockStart: 16 }} items={c.packTrust} />
        </div>
      </div>

      <main style={{ padding: mobile ? "16px var(--gutter-mobile) 40px" : "24px var(--gutter-desktop) 64px" }}>
        <div style={{ maxInlineSize: "var(--container-max)", marginInline: "auto" }}>
          <Callout tone="warning" title={c.packWarnTitle} style={{ marginBlockEnd: 20 }}>{c.packWarn}</Callout>
          {mobile ? (
            <div style={{ display: "grid", gap: 16 }}>
              <Button variant="secondary" block icon="folder-open" onClick={() => setOpenTree(true)}>{c.openTree}</Button>
              {right}
              <Sheet open={openTree} mode="sheet" title={c.treeSheet} onClose={() => setOpenTree(false)}>
                <PackFileTree tree={c.tree} selectedId={sel} onSelect={(n) => { setSel(n.id); setTab("file"); setOpenTree(false); }} />
              </Sheet>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,340px) 1fr", gap: 32, alignItems: "start" }}>
              {tree}
              <Card>{right}</Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { PackDelivery });
