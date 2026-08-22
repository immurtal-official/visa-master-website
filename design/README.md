# Design — UI/UX specifications and prototypes

This folder holds the front-end design work for Visa Master: interaction
guidance, written UX rationale, visual specs, and prototype code — most of it
produced with Claude on the web, where a design can be explored and looked at
quickly.

It is kept in version control so that later, when the real application is built,
we can answer *"why is this screen shaped like this?"* — not just *"what does it
look like?"*.

## The rule: reference only, never imported

**Nothing in this folder is production code. Nothing here is ever imported,
copied wholesale, or built as part of the application.**

Prototype code generated on the web is deliberately self-contained: styles are
inlined, state is faked, types are local, data is hard-coded, and there is no
build step. That is exactly what makes it a good *specification* — it runs
instantly and shows the intent — and exactly what makes it bad *production code*.

If a prototype is pulled into `apps/web`, three things go wrong, and all of them
are expensive later:

1. **Validation forks.** The prototype carries its own field checks; production
   must derive them from the shared zod schemas in `packages/core`. Two copies of
   "what is a valid intake" is the bug that ships.
2. **The design system forks.** Inlined styles drift from whatever the real app
   uses, and the divergence compounds screen by screen.
3. **Types stop being shared.** The prototype's local shapes have no relationship
   to the database or the API contract, so nothing catches a mismatch.

So: read the prototype, understand the intent, then **write the real thing** in
`apps/web` against the real schemas. Treat this folder the way you would treat a
Figma file — you don't import a Figma file.

## Layout

| Path | Contents |
|---|---|
| `product/` | Product design material — personas, user journey, information architecture, MVP scope, content strategy (zh-CN) |
| `guidelines/` | Written design and interaction guidance — layout rules, copy tone, component behaviour, states |
| `system/` | The exported design system — tokens, components, UI kits, and its `SKILL.md`. This is the durable artifact; the prototypes are snapshots against it |
| `prototypes/` | Generated prototype code and self-contained HTML/React pages |
| `assets/` | Screenshots, exported images, and anything visual worth keeping |

Start with [`product/00_INDEX_Visa_Master_Product_Design.md`](product/00_INDEX_Visa_Master_Product_Design.md),
then [`guidelines/design-system-selection-en.md`](guidelines/design-system-selection-en.md)
for what we build the interface out of and why, and
[`guidelines/mobile-parity-en.md`](guidelines/mobile-parity-en.md) for the
standing directive that the mobile web carries 100% of the product at
desktop-equal quality — it overrides any older document that assumes desktop —
and [`guidelines/internationalization-en.md`](guidelines/internationalization-en.md)
for the directive that every screen ships in Chinese and English, which
overrides any older document that assumes a Chinese-only interface.

Each prototype should carry a short note saying what it demonstrates and what is
deliberately fake, so a reader can tell the intended behaviour from the
scaffolding that was only there to make it run.

## How design reaches production

The intended bridge is **`packages/core`**. The intake flow designed here becomes
the `IntakeSchengenTourismV1` zod schema, which is then imported by both the
front-end form and the backend that validates and stores the submission — one
definition, two consumers. Design that with the schema in mind: the fields, their
types, which are required, and which are conditional on the route.

The production code lives outside this folder, in the monorepo laid out in
[`../doc/archive/platform-and-dev-plan-en.md`](../doc/archive/platform-and-dev-plan-en.md):
`apps/web` (Next.js front end and API routes), `apps/conductor` (the orchestrator),
`packages/*` (shared schemas, rules, database, executors), and `infra/`.

For product context — what a pack is, who the customer is, and what is already
decided — see [`../PRODUCT.md`](../PRODUCT.md).
