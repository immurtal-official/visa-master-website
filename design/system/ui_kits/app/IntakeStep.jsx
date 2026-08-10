const { Button, Callout, Question, RadioGroup, Input, DateInput, ErrorSummary, StepProgress, BackLink, StickyActionBar, SaveResumeNotice, Sheet, Locale } = window.VisaMasterDesignSystem_744fbe;

function IntakeStep({ mobile, index = 0, lang = "zh-CN", onLang, onNext, onPrev, onExit }) {
  const c = APP_TEXT[lang] || APP_TEXT["zh-CN"];
  Locale.set(lang);
  const q = c.questions[Math.min(index, c.questions.length - 1)];
  const [radio, setRadio] = React.useState("tour");
  const [date, setDate] = React.useState({ year: "2026", month: "09", day: "" });
  const [pass, setPass] = React.useState("E12345");
  const [showErr, setShowErr] = React.useState(false);
  const [sheet, setSheet] = React.useState(false);
  const invalid = q.id === "passport-no" && showErr;

  const control = q.kind === "radio"
    ? <RadioGroup name="purpose" value={radio} onChange={setRadio} options={q.options} columns={1} />
    : q.kind === "date"
      ? <DateInput value={date} onChange={setDate} hint={q.dateHint} />
      : <Input id="passport-no" width="md" value={pass} onChange={(e) => setPass(e.target.value)} error={invalid ? q.error : undefined} inputMode="text" />;

  return (
    <div lang={lang} style={{ minHeight: mobile ? 720 : 760, display: "flex", flexDirection: "column", background: "var(--surface-page)" }}>
      <AppHeader mobile={mobile} lang={lang} onLang={onLang}
        action={<Button variant="ghost" size="sm" icon="save" onClick={onExit}>{c.saveExit}</Button>} />
      <div style={{ padding: mobile ? "12px var(--gutter-mobile)" : "16px var(--gutter-desktop)", background: "var(--white)", borderBlockEnd: "1px solid var(--border-subtle)" }}>
        <div style={{ maxInlineSize: "var(--container-narrow)", marginInline: "auto" }}>
          <StepProgress section={c.sectionNow} step={q.step} total={34} sections={mobile ? [] : c.sections} />
        </div>
      </div>

      <main style={{ flex: 1, padding: mobile ? "8px var(--gutter-mobile) 24px" : "24px var(--gutter-desktop) 48px" }}>
        <div style={{ maxInlineSize: "var(--container-narrow)", marginInline: "auto" }}>
          <BackLink onClick={(e) => { e.preventDefault(); onPrev && onPrev(); }} />
          {invalid ? <ErrorSummary errors={[{ field: "passport-no", message: q.error }]} /> : null}
          <Question question={q.question} hint={q.hint} footnote={q.footnote} error={invalid ? q.error : undefined}>
            {control}
          </Question>
          {q.id === "purpose" ? (
            <Callout tone="quiet" icon="info" style={{ marginBlockStart: 28, maxInlineSize: "var(--measure-question)" }}>{c.purposeNote}</Callout>
          ) : null}
          <div style={{ marginBlockStart: 28, maxInlineSize: "var(--measure-question)" }}>
            <SaveResumeNotice email="ling@example.com" onSend={() => setSheet(true)} />
          </div>
        </div>
      </main>

      <StickyActionBar note={mobile ? c.autosaved : undefined}
        secondary={!mobile ? <Button variant="ghost" onClick={onPrev}>{c.prev}</Button> : undefined}>
        <Button variant="primary" size="lg" block={mobile}
          onClick={() => { if (q.id === "passport-no" && pass.length < 9) { setShowErr(true); return; } setShowErr(false); onNext && onNext(); }}>
          {c.next}
        </Button>
      </StickyActionBar>

      <Sheet open={sheet} title={c.sendTitle} description={c.sendBody} onClose={() => setSheet(false)}
        actions={<><Button variant="primary" block={mobile} onClick={() => setSheet(false)}>{c.send}</Button><Button variant="ghost" block={mobile} onClick={() => setSheet(false)}>{c.cancel}</Button></>}>
        <Input label={c.email} defaultValue="ling@example.com" width="full" />
      </Sheet>
    </div>
  );
}

Object.assign(window, { IntakeStep });
