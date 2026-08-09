# Design System Selection

**Status:** Decided for V1
**Decision:** **Radix UI primitives + Tailwind CSS** for implementation, with **GOV.UK Design System** borrowed as a *pattern* reference only — no wholesale adoption of any vendor system.
**Supersedes:** the recommendation in [`design-system-options-zh`](../../discussion/withchatgpt/design-system-options-zh.md) — see §6, which keeps most of it and reverses one part
**Informs:** [`../product/03_Information_Architecture.md`](../product/03_Information_Architecture.md) (page structure) · [`../product/05_Content_Strategy_Homepage.md`](../product/05_Content_Strategy_Homepage.md) (visual keywords, colour direction)
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

## 3. Options considered

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
per-item rationale, and the additional-documents request flow.

## 5. What we take from GOV.UK, and what we don't

The GOV.UK Design System is the best public reference in existence for
**high-stakes forms filled in by people who are anxious and only do this once**.
That is exactly the intake form. We borrow its *patterns* and reject its *skin*.

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

## 7. Consequences

**Accepted costs.** Starting from unstyled primitives means more up-front work
than adopting a styled kit — we build the token set and the base components
before the first screen looks finished. This is a deliberate trade: the intake
form is long-lived, and fighting someone else's opinions across dozens of screens
costs more than the initial setup.

**Mobile-first is not optional.** The product design pack barely discusses
mobile, which is its largest gap. Discovery for these customers is
overwhelmingly on a phone (Xiaohongshu, WeChat search), so the home page and the
route checker must be designed mobile-first. Steering document upload to a
desktop session is acceptable; a broken first screen on a phone is not.

**No component may fork validation.** Whatever the design system, form
components take their rules from the shared zod schemas in `packages/core`, per
the ground rule in [`../README.md`](../README.md). A component that carries its
own copy of "what is a valid passport number" is a defect, not a convenience.

**Revisit when:** we add a second route family (V2, US B1/B2) and discover the
intake form needs genuinely different branching, or if a design partner joins
who works in Figma against a specific kit.
