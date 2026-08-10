const { Button, Card, Callout, StepProgress, BackLink, StickyActionBar, UploadChecklist, ResumableUploader, CameraCaptureLoop, Locale } = window.VisaMasterDesignSystem_744fbe;

function UploadStep({ mobile, lang = "zh-CN", onLang, onNext, onPrev }) {
  const c = APP_TEXT[lang] || APP_TEXT["zh-CN"];
  Locale.set(lang);
  const [mode, setMode] = React.useState("list");
  const [pages, setPages] = React.useState([{ id: "p1" }, { id: "p2" }]);
  const sections = c.sections.map((s) => ({ name: s.name, state: s.name === c.uploadSection ? "current" : "done" }));
  return (
    <div lang={lang} style={{ minHeight: mobile ? 720 : 760, display: "flex", flexDirection: "column", background: "var(--surface-page)" }}>
      <AppHeader mobile={mobile} lang={lang} onLang={onLang}
        action={<Button variant="ghost" size="sm" icon="save">{c.saveExit}</Button>} />
      <div style={{ padding: mobile ? "12px var(--gutter-mobile)" : "16px var(--gutter-desktop)", background: "var(--white)", borderBlockEnd: "1px solid var(--border-subtle)" }}>
        <div style={{ maxInlineSize: "var(--container-narrow)", marginInline: "auto" }}>
          <StepProgress section={c.uploadSection} step={29} total={34} sections={mobile ? [] : sections} />
        </div>
      </div>

      <main style={{ flex: 1, padding: mobile ? "8px var(--gutter-mobile) 24px" : "24px var(--gutter-desktop) 48px" }}>
        <div style={{ maxInlineSize: "var(--container-narrow)", marginInline: "auto" }}>
          <BackLink onClick={(e) => { e.preventDefault(); onPrev && onPrev(); }} />
          <h1 style={{ marginBlockStart: 8, fontSize: "var(--type-question-size)", lineHeight: "var(--type-question-lh)" }}>{c.uploadTitle}</h1>
          <p style={{ marginBlockStart: 8, fontSize: 14, color: "var(--text-muted)", lineHeight: "var(--type-hint-lh)", maxInlineSize: "var(--measure-question)" }}>{c.uploadLede}</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "20px 0" }}>
            <Button variant={mode === "list" ? "primary" : "secondary"} size="sm" onClick={() => setMode("list")}>{c.modeList}</Button>
            <Button variant={mode === "drop" ? "primary" : "secondary"} size="sm" onClick={() => setMode("drop")}>{mobile ? c.modePick : c.modeDrop}</Button>
            <Button variant={mode === "cam" ? "primary" : "secondary"} size="sm" icon="camera" onClick={() => setMode("cam")}>{c.modeCam}</Button>
          </div>

          {mode === "list" ? <UploadChecklist items={c.items} onAction={() => setMode("drop")} /> : null}

          {mode === "drop" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <Callout tone="warning" title={c.dropTitle}>{c.dropBody}</Callout>
              <ResumableUploader onPick={() => {}} onRetry={() => {}} files={[
                { name: "bank-statement-2026Q2.pdf", size: "18.4MB", progress: 62, state: "failed" },
                { name: "passport-page.jpg", size: "2.1MB", progress: 100, state: "done" }]} />
            </div>
          ) : null}

          {mode === "cam" ? (
            <Card>
              <h2 style={{ fontSize: 18 }}>{c.camTitle}</h2>
              <p style={{ margin: "8px 0 16px", fontSize: 14, color: "var(--text-muted)", lineHeight: "var(--type-hint-lh)" }}>{c.camBody}</p>
              <CameraCaptureLoop pages={pages}
                onCapture={() => setPages((p) => [...p, { id: "p" + (p.length + 1) }])}
                onRemove={(id) => setPages((p) => p.filter((x) => x.id !== id))}
                onMove={(i, d) => setPages((p) => { const n = [...p]; const j = i + d; if (j < 0 || j >= n.length) return p; [n[i], n[j]] = [n[j], n[i]]; return n; })} />
            </Card>
          ) : null}
        </div>
      </main>

      <StickyActionBar note={mobile ? c.autosaved : undefined} secondary={!mobile ? <Button variant="ghost" onClick={onPrev}>{c.prev}</Button> : undefined}>
        <Button variant="primary" size="lg" block={mobile} onClick={onNext}>{c.submit}</Button>
      </StickyActionBar>
    </div>
  );
}

Object.assign(window, { UploadStep });
