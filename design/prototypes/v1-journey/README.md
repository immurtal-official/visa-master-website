# V1 journey prototype

**What it is:** a click-through prototype of the whole V1 journey — 20 screens,
route check through pack delivery — produced in Claude Design against the Visa
Master Design System. Every screen renders at 375px and 1280px and switches live
between 简体中文 and English.

**What it is for:** answering *"why is this screen shaped like this?"* when the
real front end gets built. It is the visual and interaction specification for
`apps/web`. It is **not** production code and nothing in it is imported — see
the ground rule in [`../../README.md`](../../README.md).

## Screens

Twenty screens across seven groups — 路线 (route check, waitlist, application
creation, third-party consent), 填写资料 (task-list hub, three intake steps, a
staged validation error, device handoff), 上传材料 (checklist, resumable-upload
recovery, pre-submit check), 支付 (checkout, the WeChat escape-hatch
interstitial, webhook-pending confirmation), 处理与复核 (pipeline progress,
structured rejection, resubmission), and 交付. **The sidebar inside the
prototype is the authoritative list**; this paragraph is orientation, not an
inventory.

## What is deliberately fake

Read the prototype for intent, not for values. All of the following exist only
so the thing runs:

- **All data and state.** Applications, uploads, payment status, QA findings,
  and the pack contents are hard-coded. Nothing persists, nothing is fetched.
- **All validation.** The passport error on 填写资料 02 is staged to demonstrate
  the error-summary pattern. Production validation comes from the shared zod
  schemas in `packages/core` and from nowhere else.
- **The QR code** on 换设备继续 is a placeholder `qrSrc`; the real one carries a
  signed one-time token that only the server may mint. The typed code shown
  beside it (`H4K 92T`) is a fixed string, and it is deliberately presented as
  an equal path rather than a fallback.
- **Prototype-only copy** is registered under `proto.*` in the design system
  catalogue. Structured screen copy — question option sets, the upload
  checklist, the pack tree, consistency readings — lives in per-kit `copy.jsx`
  objects rather than the catalogue, because the prototype catalogue holds flat
  strings only. In production this is a non-issue: option labels come from the
  schema and resolve through ICU message keys like any other string.
- **The pack-language claim.** The route-check screen states this route
  delivers Spanish and English documents (「这条路线交付西班牙语与英语文件」).
  The *pattern* — pack language named per route, independent of UI language —
  is exactly right and is the thing to copy. The *specific combination* is the
  prototype's invention: no document in this repo has verified what languages
  the Chengdu consulate actually requires. Verify against the official
  requirements before this string ships anywhere real.
- **The employment gate, route support, pricing (¥299), and the 180-day pack
  retention** reflect the V1 decisions in
  [`../../product/04_MVP_Scope_V1_V2.md`](../../product/04_MVP_Scope_V1_V2.md)
  at the time of capture. The scope doc governs, not this file — if a number
  here disagrees with the scope doc, the prototype is the one that is wrong.

## What it says nothing about

The backend. State names, job lifecycle, retention, and the review gate come
from [`../../../doc/architecture-v0.4-en.md`](../../../doc/architecture-v0.4-en.md)
and the platform plan. The prototype fakes all of it and must never be read as
a source for it.

## Rebuilding against it

Read a screen, understand the intent, then write the real thing in `apps/web`
against the real schemas. In particular: the intake's field rules, error
messages, and option sets all originate in `packages/core`, with the schema
emitting message keys rather than sentences
([`../../guidelines/internationalization-en.md`](../../guidelines/internationalization-en.md) §3).
A second copy of "what is a valid passport number" living in a component is the
bug this whole arrangement exists to prevent.
