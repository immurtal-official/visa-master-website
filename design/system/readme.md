# Visa Master 签证大师 — Design System

Visa Master is a visa application-pack service for Chinese applicants. A user answers a long structured intake, uploads a passport / bank statement / employment documents, pays, and receives a consistency-checked, human-reviewed pack of documents they print and submit to a consulate. It is a web app only (Next.js + Tailwind + Radix primitives via shadcn/ui, components owned in the product repo). The interface ships in Simplified Chinese and English — Chinese is the source language, English is a peer, and both are designed and reviewed together. Neither is the language of the documents in the pack; see **Internationalization**.

Two surfaces carry the product:

- **Marketing site** — must establish trust in about ten seconds. Represented here by `ui_kits/marketing/`.
- **Intake + delivery app** — a long, resumable, one-question-per-page form, then the delivered pack. Represented here by `ui_kits/app/`.

Mobile web and desktop web are equally first-class, and a large share of traffic arrives inside the WeChat and Xiaohongshu in-app browsers. Every screen is built narrow-first and widened; desktop is never the mobile stack centred in whitespace.

## Sources

No codebase, Figma file, or brand assets were provided. This system was authored from the written brief alone: product description, tone constraints, colour direction, the CJK typography rule, the GOV.UK-derived interaction model, the list of product-specific components, and verbatim Chinese copy for the homepage hero and the pack sections. Every value here is a proposal, not a recovered fact — see **Open substitutions** at the bottom.

Interaction model is borrowed from the [GOV.UK Design System](https://design-system.service.gov.uk/): one thing per page, the question asked as a sentence with its explanation inline beneath it, an error summary at the top linking to each field plus inline messages that say what to do, visible progress, save-and-resume, plain language everywhere.

---

## Content fundamentals

Chinese is the source language and English is authored, not translated: an English sentence is written from the same principles, not run through the Chinese one. The two voices below are peers, and a string exists in both before it ships.

### Chinese voice

**Person.** Second person 你, never 您. 您 reads as a service counter; 你 reads as a person explaining something. The product refers to itself as 我们 sparingly and only where agency matters (「我们会再核对一次」).

**Register.** Plain modern Mandarin, no 公文 vocabulary, no four-character officialese. Write 「请检查后重新填写」, not 「请核查相关字段」. Say what the reader should do, then why, in that order.

**Sentence shape.** Short declaratives. One idea per sentence. Explanations run one or two sentences and sit inline — never in a tooltip, because hover does not exist on touch and half the traffic is in an in-app browser.

**Questions are sentences.** 「你这次去申根国家主要做什么？」 not 「出行目的」. The field label form is only used for compact desktop panels.

**Errors are instructions, and they are calm.** 「护照号码需要 9 位，请检查后重新填写」 not 「输入无效！」. A conflict between two documents is written as the next action: 「两处日期不一致。请以社保记录为准，或让公司出具一份更正说明。」 Missing material is 待你补充, never 失败 or 错误.

**Reassurance is specific, not warm.** 「已保存。你可以随时关闭页面，之后继续填写。」 Not 「别担心～」.

**We say what we do not do.** Every surface that makes a claim carries the limit next to it: 「本服务不代办签证，也不影响使领馆的审批结果。」 Caveats are visible, never behind a link.

**Casing and punctuation.** Full-width Chinese punctuation (，。、「」) in Chinese sentences; half-width for Latin and numerals. A space between Chinese and Latin/digits: 「共 14 份文件」. No exclamation marks. No trailing 哦 / 呢 / ～. Latin product terms stay in their own casing (PDF, ZIP, B1/B2).

**Numbers.** Dates are ISO in data contexts (2026-08-01) and 年/月/日 in questions. Counts are digits (「还差 3 份材料」). Money is ¥ with a thousands separator.

**Emoji: never.** Not in product UI, not in marketing copy, not in success states.

### English voice

The reader is an applicant preparing a high-stakes submission in a second language. The voice is the same as the Chinese one — calm, specific, procedural — reached by different means.

**Person.** Second person, "you". The product is "we", used sparingly and only where something is actually done on the reader's behalf ("We check every requirement against the consulate's own page"). Never "Visa Master will…" in running copy; a service that refers to itself in the third person sounds like terms and conditions.

**Contractions: yes, in copy the reader reads; no, in copy the reader must not misread.** "You can close this page" and "we'll email you" are right. Negations stay expanded — "do not", "cannot", "is not" — because "don't" and "can't" are the words an anxious reader skims past, and in this product a missed negation is a rejected application.

**Sentence shape.** One idea per sentence. Aim for 12–18 words; a sentence over 25 words is a sign two sentences are stuck together. Explanations run one or two sentences and sit inline, never in a tooltip. No sentence depends on the one before it to be understood.

**Questions are questions.** "What are you mainly going to do in the Schengen area?" — a full question with a question mark, not the label "Purpose of travel". Labels are for compact desktop panels only.

**Errors are instructions.** Name what is wrong, then what to do, in that order: "Your passport number needs 9 characters. Check it and enter it again." Never "Invalid input", never an exclamation mark, never blame ("you forgot"). A conflict between two documents is written as the next action, not as a verdict.

**Register.** Plain English at roughly a GOV.UK reading level. Use the common word: "send", not "submit", unless submitting to the consulate is literally meant; "so that", not "in order to"; "before", not "prior to". No legal register, no marketing intensifiers ("seamless", "effortless", "powerful"), no metaphors, no idioms — an idiom is the first thing a second-language reader loses.

**What we never say.** No praise for routine actions ("Great job!", "Perfect!"). No apologies for the process ("Sorry, one more thing"). No urgency the process does not have ("Hurry", "Act now"). No promise about the outcome — never "approved", "guaranteed", or "your visa"; the limit sits next to every claim: "We do not apply on your behalf, and we do not influence the consulate's decision." No "simply", "just", or "easy" in front of a step someone is struggling with.

**Casing and punctuation.** Sentence case everywhere — buttons, headings, table headers, badges. No Title Case, no ALL CAPS outside the wordmark. Serial comma. No exclamation marks. Curly quotes and apostrophes. Latin product terms keep their own casing (PDF, ZIP, B1/B2).

**Numbers.** Dates spelled to avoid ambiguity between conventions — "8 August 2026", never 08/08/2026 — with ISO (2026-08-08) in data contexts and filenames. Digits for counts ("3 documents left"). Money keeps its currency symbol and separator (¥1,280). Plurals come from `t(key, { count })`, never from a bare "s" appended in code.

**Length is a design constraint, not a copy one.** English runs 40–60% longer than the Chinese it sits beside; write the shorter sentence where it costs nothing, and see **Layout rule: survive +100% text expansion** for what the layout owes it.

---

## Visual foundations

**The feeling.** Trustworthy, clear, lightly professional, procedural, explainable, low-anxiety. Deliberately avoided: neon-on-black, AI-purple gradients, travel-agency photo carousels, government-website austerity, enterprise-dashboard density.

**Colour.** Deep navy `--blue-900 #0b2545` anchors the brand and owns the footer and the closing CTA. `--blue-600 #175a94` is the action colour. Teal (`--teal-500 #1d9a8e`) is the progress and reassurance accent — it appears in the progress bar, the autosave notice and trust ticks, and never competes as a second brand colour. Backgrounds are white and `--ink-50 #f6f8fb`, a blue-tinted grey; there are no pure greys anywhere. Semantics: green `#1b8a4b` success, amber `#b87a00` warning, and a **de-escalated brick red `#b3453e`** for error — a missing document is a task, not a catastrophe, so the colour carries less weight than the copy. At most two background colours per view.

**Type — two scripts, one scale.** The product ships in Simplified Chinese and English. Every Han glyph renders from the device stack: PingFang SC, then HarmonyOS Sans SC, MiSans, Noto Sans CJK SC, Source Han Sans SC, Microsoft YaHei, Heiti SC. A Chinese webfont is never loaded — it would cost megabytes on a mainland connection. The only webfont is a Latin-only subset of **Public Sans**, self-hosted from `assets/fonts/` (four weights, ~14 KB each) and placed first in the stack so digits, passport numbers and Latin words pick it up while Han falls through; `--font-latin` names the same face with a full system fallback for Latin-only contexts, and `--font-cjk` is the Han-first stack. The CJK families are named explicitly, in this order, on purpose: Android's default Han fallback varies by vendor and can land on a serif or a poor face, which reads as broken here. Naming a family in a stack never implies shipping it — none of the CJK families has an `@font-face` rule and none ever will. Sizes are shared across scripts — 12 / 14 / 15 / 16 / 18 / 20 / 24 / 30 / 36 / 44 / 56, reviewed in PingFang SC.

**Line height is per script, and it is not negotiable.** A Han glyph fills its em box and has no ascender or descender relief, so it needs more leading than Latin at the same nominal size; Latin set at CJK leading looks loose and unfocused. CJK body is 1.75 (`--lh-cjk-body`, range 1.7–1.8), Latin body 1.5 (`--lh-latin-body`); display 1.3 CJK against 1.15 Latin. The semantic roles (`--type-body-lh`, `--type-display-lh`, …) carry the Chinese values by default and re-resolve to the Latin values under `[lang^="en"]`, so a component never chooses a leading itself — set `lang="en"` (or `en-US`) on `<html>`, markup you have to get right anyway for assistive tech and indexing, and the whole document follows; put it on a fragment and only that fragment follows. No second attribute is needed and there is nothing to forget. `[data-lang="en"]` carries the same overrides as an optional hatch for a fragment that cannot take `lang`; it is never required. Tracking is the same story: slight positive tracking on small CJK text, none on Latin. Semibold 600 is the heaviest weight used; bold is not part of the voice.

**Spacing and layout.** 4px base scale. Gutters 16px mobile / 32px desktop. The intake question column is capped at `--measure-question: 34em`; prose at 38em; page containers at 760px (narrow) and 1200px (wide). Controls are 36 / 44 / 52px tall, and 44×44 is the floor for anything tappable. Inputs never render below 16px, so iOS Safari does not zoom on focus. `dvh` and `env(safe-area-inset-*)` are used for the sticky bar and sheets.

**Backgrounds.** Flat colour only. No photography, no illustration, no gradient meshes, no repeating pattern, no texture, no grain. Sections alternate white and `--ink-50`; the closing CTA and footer are navy. If imagery is ever added it should be documentary and cool-toned, not stock travel.

**Cards.** White, 1px `--ink-200` border, 12px radius, `--shadow-1` at rest. The border does the separating; shadow is reserved for things that genuinely float (`--shadow-2` for the hero pack preview, `--shadow-3` for a desktop dialog, `--shadow-sheet` for a bottom sheet). All shadows are navy-tinted `rgba(11,37,69,…)`, never neutral black. No coloured left-border accent cards.

**Radii.** 8px controls, 12px cards, 16px on the top corners of a bottom sheet, pill only for badges and the progress bar. Nothing is fully rounded that contains a paragraph.

**Borders.** Hairline `--ink-200` for structure, `--ink-300`/`--ink-400` for inputs, 2px `--blue-600` when a control is selected or focused. The GOV.UK inset-text shape — a 4px left rule on a soft tint — is the one recurring decorative device, used by `Callout` and `ErrorSummary`.

**Animation.** Short and flat. 140ms for hover and press, 200ms base, 320ms for progress and page changes, 280ms for a sheet rise. Easing is `cubic-bezier(.2,0,.2,1)`. Nothing bounces, springs, or scales up on entrance — motion on a control reads as instability to someone who is nervous. Everything collapses to 0ms under `prefers-reduced-motion`.

**Hover / press / focus.** Hover is one step darker on the ramp (never opacity, never a lighter tint). Press is two steps darker, with no shrink or lift. Focus is a 3px `--blue-600` outline at 2px offset, always visible, because full keyboard traversal of the intake is a requirement. Disabled is `--ink-100` fill with `--ink-500` text and a hairline border.

**Transparency and blur.** Used exactly twice: the overlay scrim behind a sheet or dialog (`rgba(11,37,69,.44)` with a 2px blur), and the thumbnail number chip in the camera loop. Nowhere else — no frosted headers, no glass panels.

**Fixed elements.** One sticky bottom action bar per view, and it survives the keyboard. The header scrolls away. Nothing else pins.

---

## Layout rule: survive +100% text expansion

Chinese is the most compact language this product will ever carry. The same sentence in English runs 40–60% longer, and future languages longer still. **Every component must stay usable at twice the length of its Chinese string.** That means, without exception:

- **No fixed widths on anything containing text.** Buttons, badges, table headers, nav items, status chips — they size to their content and are allowed to wrap. `min-inline-size: 0` where a flex child holds text.
- **No truncated action labels.** A clipped action is an unreadable action; ellipsis is allowed only on user-supplied filenames, never on our own copy.
- **No sentence assembled from fragments.** Never concatenate 「还差」 + n + 「份材料」 in code. One string per sentence, with the number interpolated, so a translator can move it.
- **Logical properties everywhere.** `padding-inline`, `margin-inline-start`, `border-inline-start`, `inset-inline`, `text-align: start` — never `left`/`right`. A right-to-left language then becomes a stylesheet change, not a component rewrite. `tokens/layout.css` sets the defaults.
- **Demos show both scripts.** Every component card shows its Chinese and English strings together, not Chinese alone — an unexpanded demo hides exactly the bug this rule exists to prevent. See the *Text expansion* card under **Layout**. Both UI kits and all three templates carry a 简体中文 / English toggle for the same reason: the layouts are reviewed against the longer strings, not only the compact ones. Screen copy lives in `ui_kits/<kit>/copy.jsx` keyed by language.

## Internationalization

The product carries **two interface languages** — 简体中文 (`zh-CN`) and English (`en`) — and an open-ended set of **pack languages**. They are unrelated, and conflating them is the most expensive mistake available in this product. Read this before designing any file list, delivery view, or language control.

**Interface language** is what the reader is reading: chosen by the user, remembered per session, set as `lang` on `<html>`, which also switches the Latin leading and tracking tokens. All of it comes from the catalogue (see **Copy lives in the catalogue**).

**Pack language** is what each delivered document is written in: set by the destination country's requirements, decided per file, and not the user's to choose. A French consulate wants the form in French whether the applicant reads the site in Chinese or English. So:

- **Every file in `PackFileTree` carries its own `language`**, and the tree renders it on the row, in that language's own script (`de` → Deutsch), identically in both interfaces. Never encode it in `status`; never let a filename that happens to look German be the only signal.
- **Any new file list, preview, download view or delivery email inherits this rule.** If a screen names a document, it names that document's language.
- **Language self-names are never translated** (`components/core/languages.js`). 中文 is 中文 and Deutsch is Deutsch in every interface.

### The switcher

The interface language and the language of the delivered documents are two different things, and users assume they are one. `LanguageSwitcher` therefore carries a permanent one-line note — never a tooltip, never dismissible — saying that it changes the interface only, and that the language of the documents in the pack is set by the destination country's requirements. **Do not remove that line as redundant copy; it is the reason the component exists.**

Placement: header **and** footer on desktop; inside the collapsed nav **and** the footer on mobile, so it never takes a top-level mobile nav slot. Each language names itself in its own language — 简体中文 / English — never a flag, never a country name.

The same rule binds the pack itself: **every file in `PackFileTree` carries its own `language`** and shows it on the row, in that language's own script. The destination country sets it. A filename that happens to be German does not satisfy this — the label has to be there whatever the interface is set to, so that no applicant can read the interface language as the language of what they are about to submit.

---

## Copy lives in the catalogue

Every user-facing string is a key in `components/core/strings.js`, read with `t("key")`. No component holds copy, in either language. Chinese is the source language; `en` is a peer, not an afterthought.

```jsx
t("packStatus.ready")                    // 已生成 / Generated
t("progress.stepOfTotal", { step, total })
t("file.pages", { count })               // picks file.pages_one / file.pages_other
```

**A missing translation breaks the build. It never falls back.** Two Chinese strings once reached the English UI because a component could hold its own copy and a fallback could swallow the gap; both holes are closed. `t()` throws on a key missing from the active locale, and `node .build/check-i18n.mjs` fails on:

- a Chinese string literal anywhere under `components/`, a JSX text node, or a literal in `aria-label` / `placeholder` / `title` / `alt` / `label` / `hint`
- a `t("key")` with no catalogue entry
- a key missing from, or empty in, any locale in `LOCALES`
- placeholders that differ between locales for one key (`{when}` in Chinese, nothing in English)

Run it in CI before the build. The rare literal that genuinely is not copy takes `// i18n-exempt` with a reason. Adding a locale means adding it to `LOCALES` and translating every key — the check will list what is missing, and the build stays red until it is done.

Language self-names (`languages.js`) are the one exception: 中文 is 中文 and Deutsch is Deutsch in every locale, so they are not translated.

### Reaching it from a consuming app

```js
const { t, has, registerStrings, Locale, I18n } = window.VisaMasterDesignSystem_744fbe;
```

The compiled bundle only publishes capitalised exports, so `I18n` is the guaranteed handle (`I18n.t`, `I18n.has`, `I18n.registerStrings`, `I18n.languageName`); the lowercase names are published onto the namespace as well (`components/core/expose.js`, which also publishes `isWeChat`), so either form works. Do not reimplement the lookup — a second implementation is a second place for a fallback to creep back in.

### Adding your own strings

**Never mutate `CATALOGUE` directly.** The bundle can re-execute — hot reload, a second `<script>`, a re-bound design system — and a fresh `CATALOGUE` drops whatever was written into the old one, while your own "already registered" flag stays latched and never re-registers. `t()` then throws on the first lookup. Use:

```js
registerStrings("zh-CN", { "checkout.title": "确认订单" });
registerStrings("en", { "checkout.title": "Confirm your order" });
registerStrings({ "zh-CN": { … }, en: { … } });   // or both at once
```

Entries are held on the host global and re-merged every time the module runs, so re-execution is the system's problem, not yours. It is idempotent, it accepts a new locale tag (which joins `LOCALES`), and it warns when a key lands in one locale but not another — consumer strings are outside `check-i18n.mjs`, so that warning is the only guard they get.

---

## Iconography

**Lucide 0.475.0, self-hosted in `assets/icons/`** (61 SVGs copied from the Lucide repo) and drawn through the `Icon` component, which masks the SVG and fills it with `currentColor` so a glyph always matches the text beside it. Sizes: 16 inline in text, 18 inside buttons, 20–24 standalone. Stroke weight is Lucide's default 2 at 24px, which reads as a 1.5px hairline at our common 16–18px sizes.

This is a **substitution** — no icon set was supplied. Lucide was chosen for its uniform stroke, its rounded terminals (warmer than Heroicons' outline set without being playful) and its coverage of the document, upload and comparison metaphors this product needs: `file-text`, `folder`, `folder-open`, `upload`, `camera`, `paperclip`, `printer`, `files`, `circle-check`, `triangle-alert`, `circle-alert`, `info`, `git-compare-arrows`, `book-open-text`, `cloud-check`, `user-check`, `shield-check`, `chevron-*`.

**Icons ride inside the bundle.** The glyph source is embedded in `components/core/icons.data.js`, generated from `assets/icons/*.svg`, so it compiles into `_ds_bundle.js`: a consuming project that loads the bundle has every icon already, with no `assets/` copy step and no second request. Add or replace an SVG in `assets/icons/`, then run `node .build/build-icons.mjs` — an icon that is only on disk is not shipped. A name missing from the embedded set still falls back to fetching `assets/icons/<name>.svg` (base folder resolved from the bundle's own `<script src>`, or `window.VM_ICON_BASE`), and warns in the console rather than rendering blank.

**Nothing is loaded from a third-party origin.** Not icons, not fonts, not scripts in production. Mainland networks make unpkg and jsDelivr unreliable or blocked, and a hanging icon or font request delays first paint. (The React and Babel `<script>` tags in the preview HTML here are a preview-only convenience — the product is a Next.js build.)

No icon carries meaning on its own — every one is paired with text. Emoji are never used. Unicode characters are not used as icons; the only decorative glyph in copy is the interpunct `·` used as a separator in trust rows and metadata lines.

**No logo file was supplied, and none was drawn.** Wherever a mark would go, `Wordmark` sets 签证大师 in the system stack with a small teal `VISA MASTER` beside it. Replace it when the real mark exists. `assets/` is therefore empty of brand marks by design.

---

## Index

| File | What it is |
| --- | --- |
| `styles.css` | The single entry point consumers link. Imports only. |
| `tokens/` | `fonts.css` `colors.css` `typography.css` `spacing.css` `radius.css` `elevation.css` `motion.css` `layout.css` `base.css` |
| `guidelines/` | 22 foundation specimen cards (Colors, Type, Spacing, Layout, Brand) |
| `assets/icons/` | 61 self-hosted Lucide SVGs, embedded into the bundle by `.build/build-icons.mjs` |
| `assets/fonts/` | Public Sans latin subset, 4 weights |
| `templates/` | Starting folders consumers copy: `marketing-home/`, `intake-step/`, `pack-delivery/` — each bilingual |
| `components/` | Reusable primitives, grouped below |
| `ui_kits/marketing/` | Homepage at 1280 and 375, 简体中文 / English |
| `ui_kits/app/` | Intake step, upload step, pack delivery — click-through, 简体中文 / English |
| `thumbnail.html` | Homepage tile for the design-system picker |
| `.build/` | Build checks. `check-i18n.mjs` (copy discipline), `build-icons.mjs` (embed icons) |
| `SKILL.md` | Agent Skills wrapper |

### Components

**core/** — `Icon`, `Button`, `IconButton`, `Card`, `Badge`, `Callout`, plus `t` / `Locale` (i18n), `strings.js` (the catalogue), `languages.js` (language self-names)

**forms/** — `Question`, `Input`, `Textarea`, `Select`, `RadioGroup`, `CheckboxGroup`, `ChoiceRow`, `DateInput`, `ErrorSummary`

**navigation/** — `SiteHeader`, `Wordmark`, `SiteFooter`, `StepProgress`, `PipelineProgress`, `TaskList`, `BackLink`, `StickyActionBar`, `LanguageSwitcher`

**feedback/** — `Sheet`, `SaveResumeNotice`, `WeChatEscape`, `DeviceHandoff`

**pack/** — `PackFileTree`, `FilePreview`, `ConsistencyReport`, `CitationPanel`, `UploadChecklist`, `ResumableUploader`, `CameraCaptureLoop`, `TrustRow`

Each component directory holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md` and one `@dsCard` HTML showing its states.

### Intentional additions

The brief named the five product-specific components (pack file tree, consistency report, citation panel, upload checklist with rationale, camera capture loop, resumable uploader). The rest of the inventory is the standard set a from-scratch system needs, sized to this product. Three deliberate departures:

- **`Icon`** — a wrapper so a glyph set can be swapped in one file when the real one arrives, and so the self-hosted asset path is resolved in one place.
- **`LanguageSwitcher`** — the product ships in Chinese and English, and the interface/pack language distinction needs a permanent home. See *Internationalization* above.
- **`Locale` + `t`** (`components/core/i18n.jsx`) — component microcopy (status chips, autosave notice, uploader hints, `第 n / m 步`) is read from the catalogue with `t("progress.stepOfTotal", { step, total })`. `Locale.set("en")` switches locale and sets `lang` on `<html>`, which is also what makes the Latin leading tokens apply. Neither is a component; both are exported so kits, templates and the app can drive them.
- **No `Tooltip`.** The interaction model forbids it; explanations are inline. A tooltip component would be trusted and misused.
- **No `Toast`.** Confirmation in this product is a persistent notice (`SaveResumeNotice`) or a state change, not a message that disappears before an anxious reader finishes it.
- **`Sheet` covers both dialog and bottom sheet** rather than shipping two components, so no one can accidentally centre a modal on a phone.

### Open substitutions — please confirm

1. **Public Sans** is standing in as the Latin subset face. It is a plain, institutional grotesque that pairs cleanly with PingFang SC. It is self-hosted in `assets/fonts/` (latin subset, four weights). If you have a licensed Latin face, send the woff2 and `tokens/fonts.css` is a one-file change.
2. **Lucide** is standing in for an icon set.
3. **No logo.** The wordmark lockup is a placeholder, not a brand proposal.
4. **The name 签证大师** is my literal reading of "Visa Master". If the registered Chinese name differs, it appears in `Wordmark`, `thumbnail.html` and the footer.
5. **Colour ramps** are proposals built to the stated direction. The de-escalated red in particular is a judgement call worth a look.
