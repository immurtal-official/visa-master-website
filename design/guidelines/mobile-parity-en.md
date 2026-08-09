# Mobile Parity

**Status:** Standing directive, decided 2026-08-09 — overrides any older document that assumes a single device
**The directive:** **Mobile-first as build sequence; both devices equal in standing.** The mobile web supports **100% of product functionality at an experience as good as desktop** — discovery, route check, account, the full intake, document capture and upload, payment, progress, the additional-documents loop, and pack delivery all complete on a phone. Desktop carries the same 100% plus its own native strengths (§3.11). Neither device is a degraded version of the other, and a journey may cross between them at any point (§3.12).
**Companion:** [`design-system-selection-en.md`](design-system-selection-en.md) §7 — the component-level rules this document's requirements imply
**Consumed by:** `apps/web`; the release process (§4)

> 中文版：[移动端平权（中文）](mobile-parity-zh.md)

---

## 1. Two devices, equal standing, one build order

Most customers find this product inside Xiaohongshu and WeChat, on phones —
discovery is phone-dominant because the acquisition channel is. But discovery
device does not determine completion device. All four combinations are real
and supported: phone throughout, computer throughout, discover on a phone and
finish on a computer, or start on a computer and photograph documents with a
phone. **Neither device is the "real" one.**

Why mobile still leads the build order: responsive design is asymmetric.
Narrow → wide is addition (more columns, more density, more shown at once)
and it composes safely. Wide → narrow is subtraction — cutting navigation,
collapsing columns, hiding content — and it is where responsive layouts
break. So we design the narrow case first and widen it. That is a statement
about sequence and risk, **not** about which customer matters.

The failure this guards against is asymmetric too: a desktop-assuming stage
(upload without camera capture, zip-only delivery, a payment redirect that
dies inside WeChat) silently amputates the journey for the largest entry
cohort while every aggregate metric still looks plausible.

Three practical consequences bind everything below:

- **Acceptance criteria name behaviour on both devices.** A feature is not
  "done desktop, mobile later" — nor "done mobile, desktop falls out". Both
  paths belong to the definition of done.
- **No functionality is exclusive to either device.** Every capability is
  reachable on both; §3.11 covers what desktop does *better*, never what it
  does *only*.
- **Funnel metrics are reported per device, both of them.** Intake
  completion, start-to-submit time, and conversion are split by device with
  neither as the headline number, so a failure on either side cannot hide
  inside a blended aggregate.

## 2. The mobile environment we ship into

The constraints below are facts about mainland-China mobile web, not choices.
They are listed here because they are unfamiliar and they bite; desktop's
environment is ordinary by comparison, which is why §3.1–§3.10 read as
mobile-specific. That asymmetry is about *unfamiliarity*, not importance.
Every requirement in §3.1–§3.10 traces back to one of these.

| # | Constraint | Consequence |
|---|---|---|
| E1 | WeChat's webview is **XWeb** on Android and **WKWebView** on iOS; Xiaohongshu ships its own webview. All are modern engines (File API, canvas, `visualViewport`, `dvh`), but none is approximated by desktop devtools emulation | Test on the real matrix (§4) |
| E2 | `<input type="file">` with camera capture **works natively** in all target webviews; the WeChat JS-SDK is not needed for capture and is worse (9-image limit, forced compression) | Camera capture is a first-class path with no SDK dependency |
| E3 | Arbitrary **file downloads are dead inside the WeChat webview** — no download manager, zip links dead-end, `Content-Disposition: attachment` blanks on iOS. Sole exception: navigating to a single PDF/DOCX opens WeChat's document previewer with "open with other app" | Delivery cannot depend on downloads (§3.8) |
| E4 | The standard mainland mitigation for anything blocked in-webview is the **full-screen overlay pointing at the ··· menu** ("在浏览器打开" / "在Safari中打开"), plus an out-of-band link. Users recognise it | Ship this overlay as a shared component |
| E5 | localStorage/cookies survive normal use but are **wiped by WeChat's cache-clean and lost on webview eviction**; the webview process is routinely killed when the user switches to a chat and back | Client storage is a cache; the server is the record (§3.2) |
| E6 | **Sessions do not cross contexts**: cookies set in a webview are invisible to the system browser and vice versa | Every escape hatch carries an auth handoff token (§3.2) |
| E7 | **Payment inside the WeChat webview:** only WeChat Pay JSAPI works, and it requires a CN entity, a verified 服务号, a WeChat Pay merchant account, and OAuth for openid — none available in V1. Alipay app-scheme jumps are **blocked** inside WeChat, so Stripe's Alipay flow fails there | In-webview checkout = escape hatch, never a redirect (§3.5) |
| E8 | **Outside WeChat**, Alipay H5 via Stripe works, but the app-jump-and-return leg is unreliable | Payment state is webhook-driven, never redirect-driven (§3.5) |
| E9 | **No push channel exists in-webview** (no web push in WKWebView-in-WeChat or XWeb) | Async notification is SMS/email in V1; OA template messages are V2 (§3.6) |
| E10 | **Xiaohongshu organic notes cannot carry tappable external links**; only ads and brand accounts can. The XHS webview blocks downloads and most app-scheme jumps | Acquisition assumes search-and-type entry (§3.1) |
| E11 | iOS file inputs may deliver **HEIC**; iOS usually transcodes when the accept list excludes it, but not always | Server-side HEIC handling stays mandatory (§3.4) |
| E12 | **Domain reachability is a live constraint**: `*.vercel.app` is intermittently blocked; un-ICP'd overseas domains load slowly and are more readily flagged by WeChat's link-security system, which can interstitial or hard-block a domain | Custom domain, mainland monitoring, backup domain (§3.10) |
| E13 | Without a verified Official Account (CN entity), links shared into WeChat render as **bare-URL cards** — no custom share title/thumbnail | Limited link virality until an OA exists; plan for it, don't depend on it |

## 3. Requirements by journey stage

§3.1–§3.10 specify the mobile path (the unfamiliar one). §3.11 specifies what
desktop must do natively rather than inherit, and §3.12 specifies moving
between the two mid-journey.

### 3.1 Entry and discovery

- Every page detects its container (MicroMessenger UA for WeChat, XHS UA for
  Xiaohongshu, plus feature checks) and renders context-appropriate
  affordances: download buttons become escape-hatch guidance inside WeChat,
  payment CTAs route through the handoff interstitial, and ordinary browsers
  get full functionality.
- The zero-commitment funnel — home, route checker, how-it-works, sample pack,
  pricing, FAQ — is **100% functional inside the WeChat and XHS webviews**: no
  downloads, no payments, no external redirects required to build trust. The
  sample pack is browsed as pre-rendered page images, not files.
- Because organic XHS notes cannot link out (E10), acquisition assumes
  **search-and-type entry**: a short memorable domain, a brand name that
  survives XHS search, and landing pages that work when the URL is typed or
  pasted.

### 3.2 Auth and session

- Primary identity is **mainland mobile number + SMS OTP** (email secondary).
  Login completes inside a webview in under 30 seconds; the OTP input uses
  `inputmode="numeric"` with `autocomplete="one-time-code"`. Operational
  dependency to sequence early: reliable +86 SMS delivery requires a mainland
  SMS provider, which requires a CN entity.
- **Every escape hatch mints a single-use, short-expiry handoff token** (URL
  or 6-digit code) that signs the user into the system browser and lands them
  on the exact page they left — checkout, delivery, or a specific file (E6).
- **All draft and application state persists server-side on every change**;
  localStorage is a write-through latency cache only (E5). Every flow is fully
  re-enterable from a cold start via login.

### 3.3 Intake on a phone

- The intake decomposes into **one-question-per-page screens** (1–3 fields, no
  scrolling to reach the CTA) with a GOV.UK-style **task-list hub** showing
  per-section completeness and jump-in; progress shows step position and
  overall percent. The desktop layout is the adaptation of this, not the
  reverse.
- **Input ergonomics are field-type-driven** (bound to the `packages/core` zod
  schemas): passport numbers get `autocapitalize=characters`,
  `autocorrect=off`, alphanumeric validation; dates are three numeric fields,
  never native date wheels (punitive for far-past dates); phone uses
  `inputmode=tel`; money uses `inputmode=decimal`; pinyin fields
  auto-uppercase; Chinese name fields never fight the IME. All masks tolerate
  pasted input with spaces.
- **Autosave** fires on blur, on step transition, and on a 5-second typing
  debounce, with a visible saved-state indicator; reopening resumes at the
  exact last incomplete question. Inside WeChat, interruption is the median
  session (E5) — this is the difference between a completable form and an
  abandoned one.
- **Keyboard handling:** the sticky bottom CTA repositions via
  `visualViewport`; the focused input scrolls above the keyboard; inputs are
  ≥16px; no fixed element may trap or overlap the keyboard in WKWebView.
- Every question carries its explanation **inline beneath it**; uncertain
  fields offer an explicit "我不确定" option; no tooltips or hover-dependent
  disclosure anywhere in the flow.

### 3.4 Document capture and upload

- **Phone-camera capture is the primary document path** — a plain
  `<input type="file">` accepting `image/*`, HEIC, and PDF, without forcing
  `capture=environment`, so the OS chooser offers camera, album, and Files
  (E2). Bank statements often already exist as screenshots or exports on the
  phone; the album/Files options matter as much as the camera.
- **Per-document capture guidance:** a passport frame guide with
  MRZ-visible and glare warnings; a statement guide showing stamp and
  full-page requirements.
- **Client-side quality gating before upload** — blur detection, brightness
  and glare heuristics, minimum resolution — producing an instant retake
  prompt naming the specific problem. A rejected photo discovered days later
  in human review costs a round-trip; a retake prompt costs three seconds.
  Server-side re-validation feeds the per-item status on the upload checklist,
  and that status claims only what is actually checked.
- **Multi-page documents are ordered page sets:** an add-page capture loop
  with thumbnails, reorder, per-page delete and retake, a page counter, and a
  short-count hint (a 6-month statement is rarely 2 pages). Pages combine
  server-side into one logical document.
- **Formats and size:** accept HEIC/JPEG/PNG/PDF; downscale and compress
  client-side to roughly 1–2MB per page (long edge ≈2600px, preserving MRZ
  legibility); transcode HEIC server-side as fallback (E11).
- **All uploads are chunked and resumable** (tus against Supabase Storage's
  resumable endpoint or equivalent) with retry, backoff, per-file progress,
  and sessions that survive reload and webview process death. A document
  counts as uploaded **only on server confirmation**, and step completion
  blocks on it. A monolithic POST that silently loses a passport scan while
  the UI claims success is the worst possible failure in a trust product.

### 3.5 Payment

- **Inside the WeChat/XHS webview, checkout never attempts a redirect** (E7).
  It renders the branded escape-hatch interstitial (E4) carrying the handoff
  token, so the system browser lands directly on an authenticated Stripe
  checkout with Alipay.
- **Outside WeChat,** checkout uses Stripe with Alipay H5, but treats the
  return leg as unreliable (E8): payment confirmation is **webhook-driven**,
  and every application page — including one later reopened inside WeChat —
  refetches status, so the paid state appears regardless of how the
  app-jump-and-return ended.
- Checkout copy states plainly that V1 payment is **Alipay, in the system
  browser**. WeChat Pay JSAPI is a documented V2 item gated on a CN entity, a
  verified 服务号, and a merchant account; no QR-based partial flow on mobile.

### 3.6 Progress and notifications

- The ~10-minute generation and hours-scale human review are **fully
  asynchronous on mobile**: the progress page is safe to close at any moment,
  state lives server-side, and any link re-entry (including from a WeChat chat
  message) deep-links to current status with auth handoff if needed.
- **Status-change notifications go out via SMS in V1** (email secondary; OA
  template messages once an Official Account exists). Without an outbound
  channel, review completions and document requests sit unseen for days (E9).

### 3.7 The additional-documents loop (补材料)

- The loop is **fully mobile-native**: notification → deep link (with auth
  handoff) → a screen listing each missing or contradictory item with the
  reviewer's reason → the same capture and page-set components → resubmit.
  **No step may require a desktop.** The artifacts requested — a clearer
  passport photo, one more statement page — are precisely what a phone camera
  produces in seconds; forcing this to desktop turns a 2-minute fix into a
  next-evening task.

### 3.8 Pack delivery

- The delivery page **works fully inside the WeChat webview as an in-browser
  pack viewer**: a file tree where every file is browsable via pre-rendered
  page images (reusing the pipeline's QA rendering), every DOCX paired with a
  PDF rendition, and the read-first checklist, print/sign/submit reminders,
  sources, and caveats rendered as native pages — reading the pack requires
  no download at all (E3).
- **Download paths, in priority order:** (1) "email me the pack" sends a
  signed **link** (not an attachment) for later desktop use; (2) per-file
  signed-URL downloads in the system browser after the escape hatch (iOS
  Files unzips natively; per-file matters more than zip on phones); (3)
  inside WeChat, download buttons are replaced by guidance plus the email
  option. WeChat's single-file previewer is acceptable for one file, never
  for the pack.
- **One consolidated print-bundle PDF per pack:** all printable pages merged
  in submission order, signature pages flagged in the index, A4-sized,
  presented as "发给打印店的文件". Mainland printing reality is a print shop
  fed one file over WeChat — forwarding one merged PDF is a two-tap task;
  forwarding nine mixed DOCX/PDF files is not. This artifact is what makes
  phone-only completion true end-to-end.
- **All delivery links are short-expiry signed URLs** that re-authenticate
  and regenerate rather than 404; the emailed link requires login or the
  handoff token. Links get forwarded through WeChat chats (spouses, print
  shops); an eternally valid URL to a full-PII pack is a PIPL incident
  waiting to happen. Delivery artifacts follow the same retention and
  purge-on-request schedule as uploads.

### 3.9 Operator and review surfaces

- Scoped parity, stated deliberately: the customer-facing product is 100%;
  the internal reviewer tool (one user) owes **responsiveness, not
  pixel-parity**. Three functions must work on a phone: the review queue with
  statuses and SLA timers; reading an application including pack preview
  images; creating and sending a 补材料 request. Deep review work
  (side-by-side comparison, QA report reading) stays desktop-first; approval
  works on mobile via the same previews but is not optimised for it. On
  mobile the queue renders as cards, which is cheaper than making a
  hand-built table responsive.

### 3.10 Performance and reachability

- **Custom domain always** (never `*.vercel.app`), every asset self-hosted,
  zero blocked or flaky third-party origins (no Google Fonts/gstatic, no
  unpkg/jsdelivr). One blocked font origin can hang first paint for 10+
  seconds behind the GFW.
- **Chinese text renders in the system CJK stack** (PingFang SC / HarmonyOS
  Sans / MiSans / Noto Sans CJK); no Chinese webfont ever (multi-MB,
  disqualifying); a small subsetted Latin webfont is the only allowance.
- **JS budget on the intake route ≈250KB gzipped**; marketing pages
  statically rendered. Measure TTFB/LCP from mainland carriers on real
  devices; evaluate a China-reachable CDN tier; plan ICP filing as soon as a
  CN entity exists (E12).
- **Manage WeChat domain reputation actively:** never trigger link-spam
  patterns, monitor for the interstitial warning state, and hold a
  pre-configured backup domain with a tested migration path — for a product
  whose funnel and delivery both run through WeChat links, a domain block is
  a total outage.

### 3.11 What desktop does natively

Desktop is not the mobile layout stretched wide. These capabilities are
designed for the large screen and the pointer, and they are the reason a
customer might deliberately choose a computer for part of the journey. None
of them is desktop-*only* — each has a working mobile path in §3.1–§3.10 —
but on desktop they are the primary interaction:

- **Multi-file drag-and-drop upload.** Dropping twelve statement pages onto
  the upload area at once, with the same page-set model, ordering, and
  server-confirmed completion as the mobile capture loop.
- **The scanner path.** A flatbed or sheet-fed scan is often the highest-
  quality version of a bank statement or employment letter. Accept
  multi-page PDFs as a first-class document source, not as an afterthought
  of the photo pipeline.
- **Side-by-side comparison.** Two panes — the pack file against the intake
  data that produced it, or a generated template against the uploaded
  evidence — is the review posture a phone cannot offer. It serves both the
  customer checking a draft and the operator reviewing (§3.9).
- **The full file tree at once.** The pack's structure — 00 through 04 with
  03's six evidence folders — is legible in a single view, where mobile
  necessarily paginates it.
- **Direct printing and local editing.** The print bundle prints from the
  browser; the DOCX templates open in a local Word/WPS. State the desktop
  path plainly instead of routing everyone through the phone's
  send-to-print-shop flow (§3.8).
- **Keyboard efficiency in intake.** Tab order, Enter-to-advance, paste into
  every field, and typed dates as an alternative to the three-field control.
  A confident typist should be able to complete a step without reaching for
  the mouse.

The design-system consequence: these are variants of the same components,
built from the same tokens and the same `packages/core` schemas — not a
second interface.

### 3.12 Crossing devices mid-journey

Switching devices is a **normal user choice**, not only a workaround for a
blocked webview (§3.5). "Fill this in on my computer tonight", "photograph
the passport with my phone, finish on the laptop", and "check progress on my
phone, print from my desk" are all supported flows.

- **State lives server-side, so continuity is the default** (§3.2). Any
  application resumes on any device at the exact step it was left, with
  uploads, drafts, and payment state intact.
- **A deliberate "continue on another device" action** exists at every long
  step — the intake, the upload screen, and the delivery page. It produces a
  short-expiry signed link (send to my email / show a QR code the desktop
  user scans with a phone) landing on the same step, authenticated. The
  WeChat escape hatch (§3.5) is one caller of this mechanism, not its
  definition.
- **The phone as the camera for a desktop session.** A desktop user on the
  upload step can display a QR code, capture documents on their phone, and
  watch them appear in the desktop session — the highest-quality path for a
  paper document without a scanner, and it belongs to both devices at once.
- **Never lose work on switch.** Handoff never discards an in-progress
  upload or an unsaved answer; a device that reconnects to an application
  already being edited elsewhere shows current server state rather than
  overwriting it.

## 4. Release definition of done

- **Device matrix, every release:** WeChat iOS (WKWebView), WeChat Android
  (XWeb), Xiaohongshu iOS and Android, Safari iOS, Chrome Android — at
  375×667 and 390×844 (E1); plus desktop Chrome, Safari, and Edge at 1280×800
  and 1920×1080. None of the webviews is testable in desktop devtools.
- **Five fragile flows smoke-tested every release:** camera capture with
  multi-page upload; resumable-upload recovery under network interruption;
  the payment handoff to the system browser; delivery preview and
  print-bundle access (including printing from a desktop browser); and a
  cross-device handoff mid-intake (§3.12) resuming at the same step.
- **Re-entrancy by construction:** after a webview kill and reload, the user
  returns to the same step with state restored, in-flight uploads resumed or
  cleanly re-promptable; no flow depends on in-memory state across more than
  one screen. A user answering a chat message mid-intake is the median
  session, not an edge case.
