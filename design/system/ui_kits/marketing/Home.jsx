const { Button, Card, Badge, Callout, Icon, SiteHeader, SiteFooter, TrustRow, PackFileTree, ConsistencyReport, CitationPanel, LanguageSwitcher, Sheet, Locale } = window.VisaMasterDesignSystem_744fbe;

function Section({ children, tone, pad = 80, mobile }) {
  return (
    <section style={{ background: tone === "soft" ? "var(--surface-page)" : tone === "navy" ? "var(--surface-inverse)" : "var(--white)", padding: `${mobile ? 48 : pad}px ${mobile ? "var(--gutter-mobile)" : "var(--gutter-desktop)"}` }}>
      <div style={{ maxInlineSize: "var(--container-max)", marginInline: "auto" }}>{children}</div>
    </section>
  );
}

function Hero({ mobile, onStart, c }) {
  return (
    <Section pad={mobile ? 40 : 88} mobile={mobile}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.05fr .95fr", gap: mobile ? 36 : 64, alignItems: "center" }}>
        <div>
          <Badge tone="info" icon="shield-check">{c.badge}</Badge>
          <h1 style={{ marginBlockStart: 20, fontSize: mobile ? 32 : "var(--type-display-size)", lineHeight: mobile ? 1.35 : "var(--type-display-lh)", fontWeight: "var(--fw-semibold)", color: "var(--text-heading)" }}>
            {c.title}
          </h1>
          <p style={{ marginBlockStart: 16, fontSize: mobile ? 16 : 18, lineHeight: "var(--type-body-lh)", color: "var(--text-muted)", maxInlineSize: "32em" }}>{c.lede}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBlockStart: 28 }}>
            <Button variant="primary" size="lg" block={mobile} onClick={onStart}>{c.cta}</Button>
            <Button variant="secondary" size="lg" block={mobile} iconAfter="arrow-right">{c.secondaryCta}</Button>
          </div>
          <TrustRow style={{ marginBlockStart: 28 }} items={c.trust} />
        </div>
        <Card elevation={2} padding="0" header={<span style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="folder-open" size={18} style={{ color: "var(--blue-600)" }} />{c.packHeader}</span>}>
          <div style={{ padding: "12px 8px" }}><PackFileTree tree={c.pack} selectedId="f4" languageNote={false} /></div>
          <div style={{ padding: "12px 16px", borderBlockStart: "1px solid var(--border-subtle)", background: "var(--ink-50)", fontSize: "var(--fs-12)", color: "var(--text-faint)" }}>{c.packFoot}</div>
        </Card>
      </div>
    </Section>
  );
}

function How({ mobile, c }) {
  return (
    <Section tone="soft" mobile={mobile}>
      <h2 style={{ fontSize: mobile ? 24 : 30, lineHeight: "var(--type-h2-lh)" }}>{c.howTitle}</h2>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 20, marginBlockStart: 28 }}>
        {c.steps.map((s) => (
          <Card key={s.n}>
            <div style={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: "50%", background: "var(--surface-accent-soft)", color: "var(--blue-700)", fontFamily: "var(--font-num)", fontWeight: 600 }}>{s.n}</div>
            <h3 style={{ marginBlockStart: 14, fontSize: 18 }}>{s.t}</h3>
            <p style={{ marginBlockStart: 8, fontSize: 14, lineHeight: "var(--lh-loose)", color: "var(--text-muted)" }}>{s.d}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Consistency({ mobile, c }) {
  return (
    <Section mobile={mobile}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : ".85fr 1.15fr", gap: mobile ? 28 : 56, alignItems: "start" }}>
        <div>
          <h2 style={{ fontSize: mobile ? 24 : 30, lineHeight: "var(--type-h2-lh)" }}>{c.consistencyTitle}</h2>
          <p style={{ marginBlockStart: 14, fontSize: 16, lineHeight: "var(--lh-loose)", color: "var(--text-muted)" }}>{c.consistencyBody}</p>
          <Callout tone="quiet" icon="info" style={{ marginBlockStart: 20 }}>{c.consistencyNote}</Callout>
        </div>
        <ConsistencyReport summary={c.consistencySummary} items={c.checks} />
      </div>
    </Section>
  );
}

function Sources({ mobile, c }) {
  return (
    <Section tone="soft" mobile={mobile}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 28 : 56, alignItems: "start" }}>
        <CitationPanel checkedAt="2026-08-01" sources={c.sources} caveats={c.caveats} />
        <div>
          <h2 style={{ fontSize: mobile ? 24 : 30, lineHeight: "var(--type-h2-lh)" }}>{c.sourcesTitle}</h2>
          <p style={{ marginBlockStart: 14, fontSize: 16, lineHeight: "var(--lh-loose)", color: "var(--text-muted)" }}>{c.sourcesBody}</p>
        </div>
      </div>
    </Section>
  );
}

function CTA({ mobile, onStart, c }) {
  return (
    <Section tone="navy" pad={64} mobile={mobile}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ maxInlineSize: "34em" }}>
          <h2 style={{ color: "var(--white)", fontSize: mobile ? 22 : 28, lineHeight: "var(--type-h2-lh)" }}>{c.ctaTitle}</h2>
          <p style={{ marginBlockStart: 10, fontSize: 15, color: "var(--blue-200)" }}>{c.ctaBody}</p>
        </div>
        <Button variant="primary" size="lg" block={mobile} onClick={onStart} style={{ background: "var(--white)", color: "var(--blue-900)", border: "1px solid var(--white)" }}>{c.cta}</Button>
      </div>
    </Section>
  );
}

function Home({ mobile, onStart, lang = "zh-CN", onLang }) {
  const c = HOME_TEXT[lang] || HOME_TEXT["zh-CN"];
  const [menu, setMenu] = React.useState(false);
  Locale.set(lang);
  const setLang = (l) => { Locale.set(l); onLang && onLang(l); };
  return (
    <div style={{ background: "var(--white)" }} lang={lang}>
      <SiteHeader compact={mobile} nav={c.nav} onMenu={() => setMenu(true)}
        language={<LanguageSwitcher value={lang} onChange={setLang} />}
        action={<Button size="sm" onClick={onStart}>{c.cta}</Button>} />
      <Sheet open={mobile && menu} mode="sheet" title={c.menu} onClose={() => setMenu(false)}>
        <nav style={{ display: "grid", gap: 2, marginBlockEnd: "var(--space-5)" }}>
          {c.nav.map((n) => (
            <a key={n.label} href="#" style={{ minHeight: "var(--touch-min)", display: "flex", alignItems: "center", fontSize: 16, color: "var(--text-body)", textDecoration: "none" }}>{n.label}</a>
          ))}
        </nav>
        <Button variant="primary" block onClick={onStart}>{c.cta}</Button>
        <div style={{ marginBlockStart: "var(--space-5)", paddingBlockStart: "var(--space-4)", borderBlockStart: "1px solid var(--border-subtle)" }}>
          <LanguageSwitcher value={lang} onChange={setLang} placement="nav" />
        </div>
      </Sheet>
      <Hero mobile={mobile} onStart={onStart} c={c} />
      <How mobile={mobile} c={c} />
      <Consistency mobile={mobile} c={c} />
      <Sources mobile={mobile} c={c} />
      <CTA mobile={mobile} onStart={onStart} c={c} />
      <SiteFooter note={c.footerNote} record="沪ICP备00000000号-1" columns={c.footerCols}
        language={<LanguageSwitcher value={lang} onChange={setLang} placement="footer" />} />
    </div>
  );
}

Object.assign(window, { Home });
