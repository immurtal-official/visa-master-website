# Design System Selection

**Status:** Decided for V1
**Decision:** **Radix UI primitives + Tailwind CSS** for implementation, with **GOV.UK Design System** borrowed as an *interaction-pattern* reference only — no wholesale adoption of any vendor system.
**Supersedes:** the recommendation in [`design-system-options-zh`](../../discussion/withchatgpt/design-system-options-zh.md) — see §6, which keeps most of it and reverses one part
**Informed by:** [`../product/03_Information_Architecture.md`](../product/03_Information_Architecture.md) (page structure) · [`../product/05_Content_Strategy_Homepage.md`](../product/05_Content_Strategy_Homepage.md) (visual keywords, colour direction)
**Companion:** [`mobile-parity-en.md`](mobile-parity-en.md) — the standing mobile directive and the stage-by-stage requirements behind §7
**Consumed by:** `apps/web` in the monorepo described in [`../../doc/platform-and-dev-plan-en.md`](../../doc/platform-and-dev-plan-en.md)

> 中文版：[设计系统选型（中文）](design-system-selection-zh.md)

---

## 1. What this decision has to serve

Visa Master is not a content site with a contact form. It is a **high-trust,
multi-step workflow product** where the user hands over a passport scan, bank
statements, and employment details, and receives a pack they will physically
print and submit to a consulate. The front end is therefore dominated by two
surfaces, and the design system has to be good at both:

1. **A marketing front page** that has to establish credibility in ten seconds.
2. **A long, branching, resumable intake form** — the product's actual core.

Both surfaces are built narrow-first and widened. A standing directive
(2026-08-09) sets **mobile-first as build sequence, both devices equal in
standing**: the mobile web carries 100% of product functionality at an
experience equal to desktop, and desktop carries the same 100% plus its own
native strengths. §7 carries what that binds at the design-system level; the
full statement lives in [`mobile-parity-en.md`](mobile-parity-en.md).

The product design pack states the visual target directly: *trustworthy, clear,
modern, lightly professional, low-anxiety, procedural, explainable*. It also
names what to avoid: neon-on-black, heavy AI-purple gradients, travel-agency
carousels, over-governmental, over-enterprise-dashboard.

That last list matters more than it looks. It rules out adopting any large
vendor design system wholesale, because each one carries its parent company's
brand personality with it.

## 2. Selection criteria

| Criterion | Why it matters here |
|---|---|
| Visual neutrality | The brand must read as *our* trustworthy service, not as a Google, Shopify, or IBM product |
| Form and validation depth | The intake form is the product; weak form primitives are disqualifying |
| Accessibility out of the box | Focus management, ARIA, and keyboard navigation are expensive to retrofit and legally relevant |
| Next.js / React fit | `apps/web` is Next.js; server components and hydration behaviour are real constraints |
| Escape hatch cost | We will need components no system ships (pack file tree, consistency-check report, source-citation panel) |
| Bundle weight on mainland networks | Customers are in mainland China; heavy CSS-in-JS runtimes are a real cost |
| Survival inside mainland webviews | Much of the journey runs inside WeChat (WKWebView / XWeb) and Xiaohongshu in-app browsers, whose keyboard, focus, and fixed-position behaviour diverge from desktop Chrome |

## 3. Options considered

The question this section answers is not "which system ranks best" but
"should we adopt any system wholesale at all". The answer is no; the verdicts
below record why each candidate fails that question, not a preference order.

| Candidate | Verdict | Reasoning |
|---|---|---|
| **Radix UI (+ Tailwind)** | **Selected** | Unstyled, accessible primitives. We keep full visual control, which is exactly what a custom trust-oriented brand needs. Largest ecosystem overlap with Next.js. Typically consumed via shadcn/ui, so components are copied into the repo and owned, not vendored |
| Chakra UI | Runner-up | Styled and fast to start, but its opinions show through, and customising away from them costs more than starting neutral. Runtime styling adds weight |
| Material Design | Rejected | Unmistakably Google. Its density and motion language reads as a consumer app, not a professional filing service |
| Shopify Polaris | Rejected | Excellent, but its every pattern assumes a merchant admin. Commerce genes leak into the vocabulary |
| IBM Carbon / Microsoft Fluent / Atlassian | Rejected | Enterprise-tool personality — precisely the "over-enterprise-dashboard" failure mode the content strategy warns against |
| Adobe Spectrum / AWS Cloudscape | Rejected | Same reason, plus narrower community support for a small team |
| GOV.UK Design System | **Adopted as patterns only** | See §5 |

## 4. The decision

**Build on Radix UI primitives, styled with Tailwind, with components brought
into the repo via shadcn/ui rather than consumed as an opaque dependency.**

Concretely:

- **Radix** supplies behaviour and accessibility: dialogs, popovers, selects,
  radio groups, tooltips, focus traps, keyboard semantics.
- **Tailwind** supplies the visual layer, driven by design tokens that encode the
  colour direction already agreed in the content strategy — blue / teal / deep
  navy primary, white and light blue-grey backgrounds, green for success, amber
  for warning, red for error but deliberately de-escalated.
- **shadcn/ui** is the delivery mechanism, not a dependency. Components land as
  source files we own and can bend, which matters because several of our core
  screens have no equivalent in any shipped library.

The components no vendor system provides — and which we will therefore design
ourselves — include the pack file-tree preview, the consistency-check report,
the source-and-caveat citation panel, the document-upload checklist with
per-item rationale, the additional-documents request flow, the resumable
uploader, and the multi-page camera-capture loop with thumbnail reorder (the
last two are mobile requirements; see §7). Each is designed as a stacked,
touch-first list and then widened into its desktop two-pane form — one
component with two first-class layouts, not a layout and its fallback.

## 5. What we take from GOV.UK, and what we don't

The GOV.UK Design System is the best public reference in existence for
**high-stakes forms filled in by people who are anxious and only do this once**.
That is exactly the intake form. We borrow its *patterns* and reject its *skin*.
(USWDS, its American sibling, is a secondary reference for the same material.)

Borrowed:

- **One thing per page.** Directly supports the "tax-software, not web form"
  principle in the personas document.
- **Question protocol** — ask the question as a sentence, put the explanation
  next to it, not in a tooltip.
- **Error message conventions** — an error summary at the top linking to each
  field, plus inline messages that say what to do rather than what went wrong.
- **Progress and resumability** — showing where you are in a long task, and
  supporting "save and come back".
- **Plain-language rules** for anything that carries consequence.

Not borrowed: the visual language. GOV.UK looks governmental by design, and the
content strategy explicitly rules that out. Take the interaction research, not
the typography and black bars.

## 6. The prior analysis, and the one part we reverse

An earlier options review — [`design-system-options-zh`](../../discussion/withchatgpt/design-system-options-zh.md) — reached a
three-layer conclusion: Tailwind + shadcn/ui for the marketing site, light
form-friendly components for intake, and **Ant Design for the logged-in
dashboard and the reviewer/admin portal**. Most of it we keep, and its closing
observation is the sharpest thing written about this decision so far:

> the risk is *brand-name design system bias* — assuming that the bigger the
> company behind it, the better the fit. Design system choice is task matching,
> not brand worship.

Kept from it: the marketing site should not wear any vendor's default skin; the
intake flow needs low information density, not enterprise density; Adobe
Spectrum is worth studying for restraint but wrong as our visual genome;
government design systems are the right reference for high-stakes forms.

The prior review also carried a structural contradiction worth naming: it
ranked seven systems in order (1st Ant Design … 7th Fluent) while concluding
that none should be adopted wholesale — a reader skimming the ranking walks
away with "use Ant Design", which its own conclusion does not support. This
document deliberately answers the question that ranking obscured: not "which
system ranks best" but "should we adopt any at all" (§3).

**Also rejected: "Material-like patterns" for the intake step.** The prior
review proposed shadcn for marketing but Material-like form patterns for
intake. There is exactly one visual system across marketing → intake →
dashboard, because the moment a visitor crosses from the marketing page into
the intake form is the conversion-critical trust moment — a visible change of
visual language at that seam reads as being handed to a different company,
precisely when the user is deciding whether to type in their passport number.
And "Material is mobile-friendly" is not an argument for Material: responsive,
touch-first behaviour comes from our own Tailwind layer (§7) without importing
Google's brand language.

**Reversed: Ant Design for the admin and reviewer portal.** The argument for it
is real — Table, Steps, Upload, Drawer, Descriptions, Timeline, and Tag are
exactly the reviewer portal's vocabulary, and internal tools have no brand
requirement to protect. It would genuinely be faster in isolation. But the
development plan settles the question against it: `apps/web` hosts the Next.js
front end **and the review actions**, and the monorepo is `apps/web`,
`apps/conductor`, `packages/*`, `infra/` — there is no separate `apps/admin`.
So Ant Design would not be a second design system in a second application; it
would be a second design system, a second token set, and a second component
vocabulary **inside the same bundle as the customer-facing pages**, shipped to
customers in mainland China who never see the admin screens.

That trade is only worth making if the reviewer portal is split into its own
app. It may well deserve that later — reviewer tooling has different users,
different release cadence, and different security posture. **If and when
`apps/admin` is split out, reopen this decision;** Ant Design is the leading
candidate for that app specifically. Until then, the reviewer portal is built
from the same Radix primitives, accepting that we hand-build a data table.

## 7. Mobile-first as build order, both devices equal in standing

A standing directive (2026-08-09) governs everything in this section: **the
mobile web supports 100% of product functionality, at an experience as good as
desktop** — intake, camera document capture, payment, progress, the
additional-documents loop, and pack delivery included — **and desktop carries
the same 100% plus its own native strengths.** Neither device is a teaser for
the other; a journey may cross between them at any point, and cross-device
continuity is a designed flow rather than a workaround. We build narrow-first
because widening composes safely and narrowing does not — that is a statement
about sequence, not about which customer matters.

Two facts about the shipping environment drive the rules below. First, the
in-app browsers customers arrive in — WeChat's XWeb on Android, WKWebView on
iOS, the Xiaohongshu webview — are modern engines where file input and camera
capture work natively, but where file downloads and Alipay handoffs are
blocked, sessions do not carry into the system browser, and no push channel
exists. Second, WeChat routinely kills and reloads the webview when the user
switches to a chat, so client-side state is a cache, never the record. The
journey-level consequences — escape-hatch overlays with auth handoff, SMS
notifications, server-side drafts, resumable uploads, the in-browser pack
viewer, the print-bundle PDF — are specified stage by stage in
[`mobile-parity-en.md`](mobile-parity-en.md).

What binds the design system itself:

- **Overlays.** Dialogs become bottom sheets on mobile (shadcn's Drawer /
  Vaul); a centered modal over an open keyboard is a known WKWebView failure
  mode.
- **Selects.** Radix Select does not ship to touch devices — styled native
  `<select>` for short lists, a bottom-sheet picker for long ones (city,
  nationality). Radix Select may remain on desktop.
- **No hover-dependent disclosure.** Tooltip and HoverCard are banned from the
  intake and delivery flows; explanations sit inline beneath the question,
  which is the GOV.UK protocol §5 already adopts — mobile makes it mandatory
  rather than stylistic.
- **Touch targets** are minimum 44×44pt with 8px separation between adjacent
  tappable rows, encoded as Tailwind tokens, not left to per-screen judgment.
- **Inputs** are minimum 16px font size (defeats iOS focus auto-zoom), and
  every field's `inputmode` / `autocomplete` / `autocapitalize` belongs to its
  type definition bound to the `packages/core` zod schemas — keyboard
  behaviour is schema-driven, not screen-by-screen.
- **Viewport handling is token-level:** `dvh` instead of `vh`, safe-area
  utilities wrapping `env(safe-area-inset-*)`, and one shared sticky-action-bar
  component that owns `visualViewport` keyboard repositioning so individual
  screens never reimplement it.
- **Type renders in system CJK fonts** (PingFang SC first — design and review
  the type scale there). No Chinese webfont, ever, on mainland networks; a
  small subsetted Latin webfont is the only allowance.
- **Document preview is server-rendered page images**, reusing the pipeline's
  existing QA rendering step — no pdf.js on mobile, and DOCX preview becomes
  uniform with PDF preview.
- **Desktop layouts are specified, not inherited.** The wide variant of each
  custom component is its own design with its own affordances — two-pane
  comparison, the whole pack tree in one view, multi-file drag-and-drop, full
  keyboard traversal of the intake ([`mobile-parity-en.md`](mobile-parity-en.md)
  §3.11) — built from the same tokens and the same schemas. A component whose
  desktop state is "the mobile stack, centered, with whitespace either side"
  is unfinished.
- **Definition of done:** every base component is verified in WeChat iOS
  (WKWebView) and WeChat Android (XWeb) *and* at desktop widths before it
  ships — focus management, keyboard interaction, and fixed positioning,
  exactly what Radix primitives own, are where these webviews diverge from
  desktop Chrome, and pointer/keyboard affordances are where the desktop
  variant earns its keep. Releases smoke-test the full device matrix in
  [`mobile-parity-en.md`](mobile-parity-en.md).

## 8. Consequences

**Accepted costs.** Starting from unstyled primitives means more up-front work
than adopting a styled kit — we build the token set and the base components
before the first screen looks finished, and the mobile variants of every
overlay and input component (§7) are part of that base build, not a later
adaptation. This is a deliberate trade: the intake form is long-lived, and
fighting someone else's opinions across dozens of screens costs more than the
initial setup.

**No component may fork validation.** Whatever the design system, form
components take their rules from the shared zod schemas in `packages/core`, per
the ground rule in [`../README.md`](../README.md). A component that carries its
own copy of "what is a valid passport number" is a defect, not a convenience.

**Revisit when:** we add a second route family (whichever route ships next) and
discover the intake form needs genuinely different branching, or if a design
partner joins who works in Figma against a specific kit.
