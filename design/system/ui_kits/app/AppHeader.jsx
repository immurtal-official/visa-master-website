const { SiteHeader, Sheet, LanguageSwitcher, Locale } = window.VisaMasterDesignSystem_744fbe;

/* App header. The language switcher sits in the desktop nav; on mobile it lives inside
   the collapsed nav sheet, so it never takes a top-level mobile nav slot. */
function AppHeader({ mobile, lang = "zh-CN", onLang, nav, action }) {
  const c = APP_TEXT[lang] || APP_TEXT["zh-CN"];
  const items = nav || [{ label: c.help }];
  const [menu, setMenu] = React.useState(false);
  const setLang = (l) => { Locale.set(l); onLang && onLang(l); };
  return (
    <React.Fragment>
      <SiteHeader compact={mobile} nav={items} action={action} onMenu={() => setMenu(true)}
        language={<LanguageSwitcher value={lang} onChange={setLang} />} />
      <Sheet open={mobile && menu} mode="sheet" title={c.menu} onClose={() => setMenu(false)}>
        <nav style={{ display: "grid", gap: 2, marginBlockEnd: "var(--space-5)" }}>
          {items.concat(items.some((n) => n.label === c.myApp) ? [] : [{ label: c.myApp }]).map((n) => (
            <a key={n.label} href="#" style={{ minHeight: "var(--touch-min)", display: "flex", alignItems: "center", fontSize: 16, color: "var(--text-body)", textDecoration: "none" }}>{n.label}</a>
          ))}
        </nav>
        <div style={{ paddingBlockStart: "var(--space-4)", borderBlockStart: "1px solid var(--border-subtle)" }}>
          <LanguageSwitcher value={lang} onChange={setLang} placement="nav" />
        </div>
      </Sheet>
    </React.Fragment>
  );
}

Object.assign(window, { AppHeader });
