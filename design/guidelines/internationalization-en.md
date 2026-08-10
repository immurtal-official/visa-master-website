# Internationalization

**Status:** Standing directive, decided 2026-08-09
**The directive:** **Every user-facing surface ships in Simplified Chinese and English — the whole site, not the marketing pages.** The architecture must make adding any further language a translation job, never a rebuild.
**Ships in V1:** `zh-CN`, `en`. **Must be ready for:** any locale, including scripts and reading directions we do not yet serve.
**Companion:** [`design-system-selection-en.md`](design-system-selection-en.md) (typography, components) · [`mobile-parity-en.md`](mobile-parity-en.md) (the switcher on each device)
**Consumed by:** `apps/web`, `packages/core` (validation messages), the release process (§9)

> 中文版：[国际化（中文）](internationalization-zh.md)

---

## 1. Three language axes — never conflate them

This product has three independent notions of "language". Collapsing them is the single most damaging mistake available here, because the product's entire promise is that the documents are correct.

| # | Axis | Determined by | Does the language switcher change it? |
|---|---|---|---|
| **A** | **UI language** — what the user reads while using the product | The user | **Yes.** This is the only thing it changes. |
| **B** | **Pack language** — what language each delivered document is written in | The route: destination country, consulate, and the form versions it publishes | **No. Never.** |
| **C** | **Input language** — what the user types (employer name, address) versus what a generated document needs | The document template and the consulate's requirement | **No.** A transliteration/translation step in the pipeline, unrelated to the UI. |

**Why this matters more than it looks.** A user who switches the UI to English will reasonably assume their pack arrives in English. If it doesn't, we look broken. Worse in the other direction: a user on the Chinese UI may conclude they don't need the English-language documents the consulate requires. Either misunderstanding damages exactly the trust the product is sold on.

**Therefore, non-negotiable:**

- The language switcher carries a permanent one-line note: *"Switches the interface language only. The language of your document pack is set by the destination country's requirements."*
- The pack preview, the sample-pack page, and the delivery page **label each file with its own language**, independently of the UI language.
- Route selection and the checkout summary state the pack's language(s) explicitly before payment.

## 2. What is translated, and what is not

Translating the wrong string is worse than leaving it English.

**Translated:** every piece of interface text — navigation, buttons, questions and their inline explanations, validation errors, empty states, progress copy, notifications (SMS/email), help centre, legal pages, FAQ, and the per-item rationale on the upload checklist.

**Never translated — render verbatim in the source language, in every UI locale:**

- **Official document and form names.** The consulate publishes a form under a specific name; a user searching for it, or a clerk receiving it, needs that exact string. Show the official name verbatim, with an explanatory gloss beside it in the UI language.
- **Consulate, visa-centre, and authority names**, and their addresses.
- **The applicant's own data** — name, employer, address as they entered it.
- **File names inside the delivered pack.** The pack's folder and file names are part of the deliverable's structure and are stable across UI locales; the UI may show a translated *label* next to them, never instead of them.

**Legal text needs an authoritative language.** The privacy policy, terms, and the service-boundary statements ("we do not guarantee visa approval") carry weight. Publish both, and state on each which language governs if the two ever disagree. Machine translation is not acceptable for these pages in any language.

## 3. Architecture — what makes the third language cheap

Everything below exists so that adding a locale is "write a catalogue and review it", never "touch the components".

- **No user-facing string is written inside a component.** Every string comes from a message catalogue keyed by a stable identifier. A literal in JSX is a defect, caught in review and by lint.
- **Library:** `next-intl` on the Next.js App Router, with **locale-prefixed routes** (`/zh/...`, `/en/...`). Path prefixes, not a cookie alone: a user can share a link in their language, and each locale is independently indexable.
- **Catalogue format: ICU MessageFormat.** Not string concatenation. Plurals, gender, ordinals, and embedded numbers/dates are language-specific and cannot be assembled from fragments — Chinese has no plural agreement, English has two forms, other languages have up to six. ICU is also the format professional translation vendors expect, which matters the day this stops being hand-written.
- **Validation messages are keys, not sentences.** The zod schemas in `packages/core` are the single source of truth for what is valid — that rule is unchanged. What changes is that a schema emits a **message key plus parameters** (`passport.expiry.tooSoon` with `{monthsRequired: 3}`), never a human-readable string. The front end resolves the key against the active locale. This preserves "no component may fork validation" while making every error translatable, and it is the one piece that is genuinely expensive to retrofit — build it this way from the first schema.
- **Formatting comes from `Intl`**, never hand-rolled. Dates, times, numbers, and currency are formatted per locale; date *entry* stays the three-field numeric control ([`mobile-parity-en.md`](mobile-parity-en.md) §3.3) so input is unambiguous regardless of locale conventions.
- **Locale is a user setting, not a session guess.** First visit may infer from `Accept-Language`; once chosen it persists on the account and follows the user across devices ([`mobile-parity-en.md`](mobile-parity-en.md) §3.12). An operator applying on someone else's behalf keeps their own UI language.
- **Server-rendered content is locale-aware**, including page titles, meta descriptions, and share-card metadata — the marketing pages must be indexable in both languages.
- **Outbound notifications carry the recipient's locale**, resolved server-side at send time from the account, not from whatever locale the triggering request happened to use.

## 4. Typography — one system, several scripts

The type scale is **one system with per-script font stacks**, not a Chinese design that English borrows.

- **CJK renders in the system stack** — PingFang SC, then HarmonyOS Sans / MiSans / Noto Sans CJK. **Never a Chinese webfont**: it is multiple megabytes on mainland networks, which is disqualifying.
- **Latin renders in a small subsetted webfont** (the only webfont allowed), with a system fallback.
- **Design and review the scale in both scripts.** CJK and Latin at the same nominal size do not have the same optical size, and CJK needs more line height for the same comfort — roughly 1.7–1.8 against 1.5 for Latin. Set line height per script, not globally.
- **Do not fake weights.** Synthetic bold on CJK is mush; use the weights the system stack actually ships.
- **No text in images.** Every string must be able to change language.

## 5. Layout — design for expansion you have not shipped yet

Chinese is the most compact of the languages under consideration; **every other language is longer**. Against Chinese, English typically runs 40–60% longer, and German, French, and Russian can run 60–100% longer. A layout tuned to Chinese character counts breaks the day a third language arrives — which is precisely the outcome this directive exists to prevent.

- **Budget +100% over the Chinese string** for every button, label, nav item, and badge. If the component only works at the Chinese length, it is not finished.
- **The 375px hero has to survive it.** The mobile stack order in [`05_Content_Strategy_Homepage.md`](../product/05_Content_Strategy_Homepage.md) §5 is specified against Chinese copy; verify the same stack with the English strings, which are longer, before calling that spec done.
- **Buttons and inputs grow, never truncate.** No fixed widths on anything containing text; no ellipsis on an action label.
- **The 2×2 trust-point grid must tolerate two-line cells.**
- **Never concatenate sentences from fragments** — word order differs by language. One key per complete sentence, with parameters.
- **Use CSS logical properties throughout** (`margin-inline-start`, `padding-inline`, `text-align: start`) rather than left/right. This costs nothing today and is most of what a future right-to-left language would otherwise require.

## 6. The language switcher

A small component with outsized responsibility.

- **Placement.** Desktop: in the header, and repeated in the footer. Mobile: inside the collapsed navigation and in the footer — it must not consume one of the few top-level mobile nav slots ([`03_Information_Architecture.md`](../product/03_Information_Architecture.md) §2).
- **Always reachable**, including mid-intake, on the delivery page, and in the operator surfaces — a user who mis-set their language on the first screen must not have to abandon a half-filled application to fix it.
- **Each language names itself in its own language** — 简体中文, English — never a flag. Flags denote countries, not languages, and get this wrong in both directions.
- **Switching preserves state.** It re-renders the current page at the same step with the same draft data, at the same scroll position; it never restarts the intake, never discards an in-flight upload, and never loses a partially answered step.
- **It carries the pack-language note from §1.** This is the component's most important job.
- On a locale-prefixed route, switching updates the URL so the link the user shares is in the language they chose.

## 7. Content that must be authored twice, not translated once

Some copy is a product decision in each language rather than a translation of the other:

- **The homepage hero.** [`05_Content_Strategy_Homepage.md`](../product/05_Content_Strategy_Homepage.md) §10's Chinese headline is tuned for compactness and tone. The English hero should be written as English marketing copy that makes the same argument — not a rendering of the Chinese sentence.
- **The four trust points**, for the same reason and under a harder length constraint.
- **The intake questions.** Each question's phrasing and its inline explanation are the product; a literal translation of a Chinese question often produces an English sentence that asks something subtly different. These need a pass by someone who understands both the visa domain and the language.

Everything else — labels, errors, help articles — is ordinary translation.

## 8. Readiness for languages not yet shipped

Adding a locale should require a catalogue, a font-stack entry, and review. To keep it that way, these must already be true on the day zh and en ship:

- Message keys carry no assumptions about grammar, word order, or pluralization.
- No layout depends on a string's length.
- Logical properties everywhere, so right-to-left is a stylesheet concern rather than a rewrite.
- Font stacks are per-script and data-driven, so a new script is a configuration entry.
- The locale list is a single source of truth that routing, the switcher, `Intl` formatting, and `<html lang>` all read from — adding a locale touches one place.
- Catalogues are complete and machine-checkable: a missing key fails the build rather than falling back silently, so an untranslated string can never reach a user unnoticed.

## 9. Definition of done

- **Both locales, every release.** A feature is not done in Chinese and translated later; both catalogues ship together.
- **No hardcoded strings.** Lint enforces it; review catches what lint misses.
- **The device matrix runs in both languages** ([`mobile-parity-en.md`](mobile-parity-en.md) §4) — at minimum the four fragile flows plus the language switcher mid-intake, verified to preserve state.
- **Layout is verified against the longest available string** for each key, not the Chinese one.
- **Pack-language labelling is verified independently of UI language** — switch the UI to English on a Spanish-Schengen pack and confirm every document still reports its own actual language.
