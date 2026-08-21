# Status — where the build stands

**As of:** 2026-08-12 · branch `feat/week1-foundations`, 30 commits, all work verified locally.
Companion documents: [EXECUTION-PLAN-week1-2.md](EXECUTION-PLAN-week1-2.md) (the plan these
commits executed), [doc/platform-and-dev-plan-en.md](doc/platform-and-dev-plan-en.md) (the
eight-week plan this tracks against).

---

## Done

### Week 1 — foundations (complete)

- pnpm + Turborepo monorepo: `apps/web`, `apps/conductor`, `packages/core`, `packages/db`,
  `packages/executors`.
- i18n skeleton shipped with the first screen: `next-intl`, locale-prefixed routes `/zh` `/en`,
  ICU catalogues in both languages, and **two build-failing gates** — a missing key in either
  catalogue, or a hardcoded user-facing string, fails the build (not just lint).
- Supabase Auth email OTP sign-in/sign-out; dashboard behind row-level security.
- Migrations `0001_profiles`, `0002_jobs` (architecture v0.4 Chapter B form, deviations
  recorded), `0003_usage_events`.
- Design-token layer copied from the design system verbatim; owned UI components ported
  against the skill's contracts (Button, Input, Callout, Card, ErrorSummary, DateInput,
  RadioGroup, LanguageSwitcher, chrome).

### Week 2 — intake and documents (complete)

- Route gate in `packages/core`: Chengdu district → Spain, personal tourism, employed. Every
  failing part reported, each as a message key. Unsupported routes go to a write-only
  waiting list and never create an application.
- Applications as server-side drafts; 20-question intake across 7 sections, one question per
  page, autosave on every answer, resume at the exact question after sign-out/kill.
- Validation emits **message key + params only** (`validation.passport.expiry.tooSoon` +
  `{monthsRequired: 3}`); the screen resolves keys against the active locale. No component
  carries a rule.
- Document checklist driven by `packages/core` rules keyed to the applicant's answers;
  chunked **resumable uploads** (tus) to a private bucket; a document counts as uploaded only
  after the server confirms the object exists — the status column is not client-writable.
- Submission gate: whole-form validation + document completeness, then a `produce_pack` job
  enqueued with the server's own authority (idempotency key = the application, so a double
  press bills once). The job payload carries the work, never the account identity.
- Application detail page mapping job states to the fixed status vocabulary.

### Week 3 — brought forward, in part (conductor state machine complete)

- `apps/conductor` is real: claim via `FOR UPDATE SKIP LOCKED`, heartbeat-renewed leases,
  wall-clock enforcement in the run loop **and** a reaper as backstop, failure taxonomy with
  per-class retry policy (`budget_exceeded` never auto-retries), completion judged by the
  artifact appearing — never by process exit — and scratch destroyed on every path out.
- The executor behind it is deliberately fake (writes a `qa-report.json` after a delay), so
  the state machine was built and tested before any VM, image, or provider key exists.
  Swapping in the real container executor is invisible to the conductor — that is what the
  adapter contract in `packages/executors` buys.

### Verification (all green locally)

| Layer | Count |
|---|---|
| Playwright end-to-end (real sign-in via Mailpit API, real uploads into the bucket, full journey to a queued job) | 34 |
| `packages/core` unit tests | 49 |
| `apps/conductor` integration tests (against real Postgres — the point is what Postgres does under races) | 20 |
| pgTAP RLS/privilege assertions | 49 |

Plus the two i18n build gates and `supabase db reset` applying all 7 migrations cleanly.

## Where we are

The full journey runs locally end to end: sign up → route check → create application →
20-question intake → upload documents → review → submit → conductor claims the job → status
reaches "being reviewed by a person". Local-first by decision: no hosted Supabase, no
Vercel project, nothing pushed to any cloud, zero spend so far.

## Not done yet

- **Real executor + agent-plane compose** (week 3 remainder): `egress-internal` network,
  Squid egress proxy with the v0.3 §5.2 rules, LiteLLM gateway, docker executor driving
  `visa-master-hermes` (image already present locally, arm64). First three steps need no
  API key; the first real pack run does (a few dollars).
- **Progress UI + review gate + delivery** (week 4): stage timeline, `/admin/review`
  queue with approve → `delivered` / reject → structured `failure_reason`, migration
  `packs`/`reviews`/`audit_log`, delivery page with signed URLs.
- **Gateway executor, budgets, requirements cache** (week 5).
- **CI/CD, hardening, observability** (week 6) — deferred with deployment.
- **Notifications, retention enforcement, restore drill** (week 7); **payments** (week 8).
- **Deployment**: hosted Supabase (staging), Vercel project, domain; then the Hetzner VM.
  Blockers are accounts and spend, not code.
- **CN-entity-gated items** (tracked, not blocking): ICP filing, WeChat Pay, +86 SMS, any
  WeChat Mini Program — all hang off the same prerequisite.

## Architecture decisions made along the way

- Backend shape examined in depth (Next.js fullstack vs separate FastAPI-class service):
  staying **Next.js as frontend + request/response backend**, with a hard **API-first
  discipline** adopted going forward — every core business capability behind a stable
  `/api/v1/**` HTTP contract with a service layer, the web UI being one client of it, so a
  mobile app or WeChat Mini Program consumes the same contract and a future backend
  extraction is a re-homing, not a rewrite. Implementation starts on `feat/api-first`;
  the decision record and document revisions land with it.
- The agent plane stays one VM until a written trigger fires (isolation review → per-job
  microVMs; capacity → second VM). The gateway stays co-located with the conductor: it
  holds the provider keys and is the job containers' only inference route.
- A second client does not force a backend split. What a WeChat Mini Program actually
  forces is China infrastructure — ICP-filed domains (mini programs cannot call
  `supabase.co` directly) and therefore the CN entity — which no framework choice avoids.
