# Reading this codebase

This is the orientation document: what the code is, how one request becomes a
visa pack, what every file is for, how to run it, and where the work goes next.
It assumes you can read TypeScript and SQL and know nothing else about this
project.

Read [`PRODUCT.md`](PRODUCT.md) first if you want the *why* — who this is for
and what is settled. Read [`STATUS.md`](STATUS.md) for what is actually built
versus deliberately faked. Read [`AGENTS.md`](AGENTS.md) before changing
anything: it is one page, it is binding, and it is short because breaking those
rules is how this codebase would stop being coherent.

---

## 1. The system in sixty seconds

A customer answers a structured form. Some minutes later they get a folder of
official forms, filled-in templates, an itinerary and a checklist that all agree
with each other, after a person has looked at it.

The thing that produces the folder is an **untrusted agent** — a ~5 GB container
from the separate `visa-master` repo that browses the live web and runs code on
somebody's passport scan. Every architectural decision in this repo follows from
not trusting it:

```
  Trusted control plane                        Agent plane
  ─────────────────────                        ───────────
  apps/web        Next.js 16, pages; forwards    apps/conductor   claims jobs,
                  /api/v1 to apps/api            │              runs containers
  apps/api        FastAPI, every /api/v1 call    │
  packages/core   the rules, in one place        │
  packages/db     Postgres + RLS + storage       │
        │                                        │
        └────────── jobs table ───────────────────┘
                    (the only interface: the agent host
                     makes outbound connections only)
```

The database is the interface between the two planes. The backend (`apps/api`) enqueues a row
in `public.jobs`; the conductor claims it with `FOR UPDATE SKIP LOCKED`, runs a
container, uploads the result to private storage, and writes the outcome back.
There is no inbound port on the agent host and no service call between the
planes — which is why the conductor holds a Postgres connection rather than an
API client.

Four properties are worth knowing before you read any file:

- **Nothing user-facing is a sentence in code.** A failing rule emits
  `{path, key, params}`; the screen resolves the key against the active
  catalogue. Two build gates fail the build if that slips.
- **The web UI is one client of `/api/v1`, not a privileged insider.** There are
  zero Server Actions in the repository. A mini program or a mobile app would
  consume exactly the same contract.
- **Completion is judged by evidence, never by process exit.** The agent's
  final step starts a foreground server, so "the process ended" means nothing
  here. The conductor watches for the artifact, then reads the agent's own QA
  verdict before calling anything done.
- **The job payload carries the work and never the person.** No user id, no
  email, no token crosses into a container.

## 2. The shape of the repository

```
apps/
  web/          Next.js 16 App Router: pages, and one forwarder for /api/v1
  conductor/    the workflow state machine and its container executors
  app/          the Expo mobile client — README only, not started yet
  api/          FastAPI: every /api/v1 endpoint, services, the rules in Python (ADR-005)
packages/
  core/         the rules both sides import — schemas, route gate, message keys
  db/           migrations, pgTAP tests, Supabase local config
  executors/    the Executor adapter interface. Types only, no implementation
infra/          the agent plane as compose: internal network + Squid egress
scripts/        repo-level gates: the i18n catalogue check, and doc-reader (TOCs, diagrams, HTML readers)
.github/        one workflow: the generated-docs check (`pnpm doc:check`)
doc/            the architecture and plan in force: v0.4, v0.3, the v2 plan
  archive/      superseded versions, kept, with a README naming what replaced each
discussion/     the ADR ledger — every record in it is in force
  explorations/ the long-form arguments those records came out of
design/         product design, binding guidelines, the exported design system
```

Two of those folders answer "is this current?" by their shape: a document in
`doc/` is in force, one in `doc/archive/` was replaced, and the archive's README
says by what. Note that v0.3 sits in `doc/` even though v0.4 exists — v0.4
supersedes its framing and not its §5.2 egress rules, which
`infra/squid/squid.conf` implements. Version number is not the axis.

Six workspaces (`pnpm-workspace.yaml` is `apps/*` and `packages/*`; `app/` has no
`package.json` yet, so pnpm does not count it, and `api/` has one only so turbo's
lint, typecheck and test reach its Python), one
Turborepo task graph, no build step for internal packages — they export raw
TypeScript and Next transpiles `@visa-master/core` directly.

## 3. How one pack happens

This is the spine. Everything in §5 hangs off it.

**1. Can we help you at all?** `/{locale}/start` asks four questions — where you
live, where you are going, why, and what you do. `packages/core/src/routes/route-gate.ts`
holds the answer as data: V1 serves exactly one route (Chengdu consular
district → Spain, personal tourism, employed). An unsupported combination is
turned away *before* an application exists, with every failing part named at
once, and is recorded in a write-only `waitlist_entries` table.

**2. An application is a server-side draft.** `POST /api/v1/applications`
reaches apps/api, which re-runs the same gate — its Python port, held to
`route-gate.ts` by the conformance vectors; the form is not trusted — and inserts
a row.
The applicant only ever gets an id back.

**3. Twenty questions, one per page.** `packages/core/src/intake/questionnaire.ts`
declares the form as data; `INTAKE_SECTIONS` in `sections.ts` is derived from it.
Every answer POSTs to `/api/v1/applications/{id}/answers`, is validated by the
same rule the whole form uses (apps/api runs it from the exported `intake.json`),
is written into the `answers` JSONB at a dot-path together with its
`answer_sources` row and the intake contract version, and the server replies with the *next* question. The client never computes what comes
next; `last_step` records where the reader is going, so an interrupted session
resumes at the exact question. (Half the traffic is an in-app browser that gets
killed when a message arrives. This is designed for that.)

That covers answers already given. The question *in hand* is covered by
`/api/v1/applications/{id}/draft-answers`, which the form calls on a pause in
typing and on the tab being hidden. It keeps the raw keystrokes in
`applications.draft_answers` — unvalidated, possibly half a date — so a reload
costs nothing. The two paths are deliberately separate: one validates and
refuses, the other keeps whatever it is given, and `parseIntake` reads only
`answers`, so a value nobody confirmed cannot reach a submission.

**4. Documents.** `packages/core/src/rules/schengen-spain.ts` decides which
documents this applicant needs from the answers they gave — somebody whose
employer is paying is asked for the employer's proof of funds, nobody else is.
The upload is three calls: **announce** (`POST …/uploads` writes the row and
decides the storage path), **send** (the browser streams the bytes straight to
Supabase Storage in 6 MiB chunks over tus, under its own token — the API never
relays file content), **confirm** (`POST …/uploads/{id}/confirm`, where the
server finds the object in Storage's own records, as the caller, to prove the
bytes arrived and flips `status` to `stored` with its *own* authority). A
document counts as uploaded only after that last step: a client's word is not
evidence.

When `DOCUMENT_EXTRACTION=on`, confirming a passport scan also enqueues a
`doc_field_extraction` job; the conductor writes what was read back as *proposed*
answers (`answer_sources.source = 'document'`), which stay placeholders — refused
at submission — until the applicant confirms each one. It is off by default: with
no gateway, only the fixture reader (`EXTRACTION_EXECUTOR=fixtures`) can run it.

**5. Submission.** `POST /api/v1/applications/{id}/submit` runs the whole-form
schema (per-question checks cannot see rules that relate two answers), refuses
answers proposed from a document that the applicant has not confirmed, checks
document completeness, and — in one transaction with marking the application
submitted — enqueues one `produce_pack` job with
`idempotency_key = produce_pack:application:{id}`, so a double press bills once.
The payload is `{route, intake, intakeContract, documents}`: the documents by
upload id, never a storage path, and nothing that names the account.

**6. The conductor claims it.** `apps/conductor/src/lease.ts` claims one queued
row in a single statement with `FOR UPDATE SKIP LOCKED`, spending an attempt at
hand-out so a job that kills its worker is not retried for ever. A heartbeat
renews the lease; a reaper sweeps rows whose worker went quiet or whose
wall-clock deadline passed.

**7. The container runs.** `apps/conductor/src/executors/docker.ts` starts one
container per attempt on an `internal: true` network with no default route, its
environment built from an allowlist rather than inherited, one bind mount, no
docker socket. The only way out is a Squid proxy that denies link-local and
RFC1918, allows only ports 80/443, and denies cleartext write methods to hosts
nobody allowlisted.

**8. Completion, then judgement.** The run is done when `qa-report.json` *and*
`delivery/` both appear — the report alone means QA ran, the folder alone means
nothing was checked. The conductor uploads both to a private bucket with its own
credential, then `apps/conductor/src/qa.ts` reads the agent's own verdict:
`passed` and `visual-review-required` go forward, `failed` becomes `qa_failed`,
and a report that cannot be read becomes `validation_failed`. Only then is the
job `succeeded`, which today means "waiting for a person".

**9. The person.** Does not exist yet. That is week 4, and it is the largest
single gap in the product — see §7.

## 4. The disciplines, and where they are enforced

| Discipline | Enforced by |
|---|---|
| Validation emits keys, never sentences | `packages/core/src/validation/issue.ts`; `MESSAGE_KEYS` registry; `scripts/check-i18n.mjs` fails the build on a missing key or a parameter mismatch |
| No hardcoded copy in components | ESLint `i18next/no-literal-string` (Latin) and the CJK sweep in `check-i18n.mjs`; `turbo.json` makes `build` depend on `lint`, so both are build failures |
| Web is one client of `/api/v1` | ADR-004; zero `use server` in the repo; Server Components read through `lib/api/server.ts`, Client Components through `lib/api/client.ts` |
| Ownership is row-level security, not `where` clauses | apps/api runs every user-scoped query as `authenticated` with the caller's claims (`app/db.py` `as_user`); pgTAP asserts the policies; `tests/test_endpoints.py` exercises them through every endpoint |
| Server authority for what costs money or means "true" | `uploads.status = 'stored'`, answer sources and job enqueue are written under `service_role`, asked for by name (`as_service`, `with_service_authority`); column grants exclude those columns from `authenticated`. The web holds no server credential at all |
| One set of rules, in two languages | `packages/core` exports the rules' data and conformance vectors (`pnpm intake:export`); `apps/api/tests/test_conformance*.py` replays every vector |
| The container gets no identity and no credential | Sanitized `input` at enqueue; constructed env in `docker.ts`; `egress.test.ts` asserts it from inside the network |
| Completion is evidence | `artifactReady` requires both artifacts; `qa.ts` reads the verdict; `poll` never reads an exit code |
| Generated files are not edited | `doc/*.html`, `design/system/`, `packages/core/conformance/` and `apps/api/app/rules/generated/` are exports; `.prettierignore` says so, and `pnpm doc:check` (CI) and the conformance tests fail when a committed copy is stale |

---

## 5. File by file

### 5.1 The chassis (repo root)

- **`package.json`** — the only place versions are pinned (`pnpm@10.34.5`, Node ≥ 22.12). Six scripts delegate to Turborepo, five to the db package; `intake:export`/`intake:lock`/`check:intake` regenerate and check what packages/core exports to the backend, and `doc:*` builds and checks the generated half of `doc/`. `pnpm build` → `turbo run build` → `lint` first (turbo), then web's own `check:i18n && next build`, so both i18n gates fire. `pnpm test` reaches `packages/core`, `apps/conductor` and `apps/api` (pytest, inside `apps/api/.venv`); Playwright is deliberately outside the turbo graph and runs as `pnpm --filter web e2e`. `pnpm lint typecheck test` works because pnpm appends the extra words to the script — it expands to `turbo run lint typecheck test`.
- **`turbo.json`** — six tasks. `build.dependsOn: ["^build", "lint"]` is the load-bearing line: it makes the hardcoded-string rule a build failure. `check:i18n` is `cache: false` because its inputs cross the package boundary and Turborepo inputs are package-relative. Note `test` *is* cached while the conductor's tests depend on external state (Postgres, Docker, a 5 GB image) — an unchanged tree can replay a cached pass.
- **`pnpm-workspace.yaml`** — `apps/*` and `packages/*`. `infra/`, `scripts/`, `doc/`, `design/` are deliberately not workspaces.
- **`tsconfig.base.json`** — `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, `noEmit`, ES2022/Bundler. Internal packages are source-exported, so nothing compiles to `dist/`; this file is the whole build story for internal code.
- **`.prettierrc.json` / `.prettierignore`** — 100 columns, double quotes. The ignore list is the formatter-side expression of the generated-files rule: `design/prototypes/`, `design/system/`, `doc/*.html`, `apps/web/src/styles/tokens/`, `apps/web/public/`, the doc-reader shell, and the two exports `pnpm intake:export` writes (`packages/core/conformance/`, `apps/api/app/rules/generated/`).
- **`.gitignore`** — beyond the usual: `.env*` ignored with `!.env.example` re-included; `.next-stub/` (the e2e suite's second dev server); `packages/db/supabase/.temp`.
- **`AGENTS.md`, `PRODUCT.md`, `STATUS.md`, `README.md`, `CODEBASE.md`** — the five documents at the repo root, each an entry point; see §1.
- **`doc/archive/EXECUTION-PLAN-week1-2.md`** — 81 KB of history, not instruction, and the reason several root config files look the way they do (§3), the first three migrations (§7) and the two i18n gates (§5.3–5.4). Its §14, "read before objecting to the code", is where deviations are recorded.
- **`.claude/skills/visa-master-design`** — a tracked symlink to `design/system`, so the design skill loads the checked-in export rather than a copy.

### 5.2 `packages/core` — the rules

The only runtime dependency is zod. It reads no environment, touches no
database, and both planes import it so they cannot hold different opinions about
the same rule.

- **`src/i18n/message-keys.ts`** — the closed registry: 18 keys mapped to the ICU parameters each requires. The build fails when a key here is missing from either catalogue, or when a catalogue message does not carry the declared parameters. Everything else in the package is downstream of this file.
- **`src/i18n/locales.ts`** — `LOCALES`, `DEFAULT_LOCALE = "zh-CN"`, self-names (`简体中文`, `English` — a language names itself, never a flag), and the `/zh` `/en` route prefixes. Exposed as a subpath so the proxy and the i18n gate can import it without dragging in zod.
- **`src/validation/issue.ts`** — where zod errors become `{path, key, params}`. `issue.message` is never consulted: it is a sentence in one language. Two subtleties: the parsed input is passed alongside so a *missing* field can be told from a *wrongly typed* one without reading English, and `too_small` with `minimum === 1` reports `validation.required` because "fill this in" is the useful instruction.
- **`src/schemas/auth.ts`** — email and OTP. The smallest complete worked example of schema + custom `i18nIssue` + `toResult`. Both are forgiving on purpose: a pasted address keeps its trailing space out of the rejection, and a code pasted as `1 2 3 4 5 6` is a right code.
- **`src/routes/route-gate.ts`** — the commercial constraint as data: `SUPPORTED_ROUTE`, the five Chengdu-district areas, the destinations offered (so the waiting list records where demand actually is), and `checkRoute`, which accumulates *every* failing dimension rather than short-circuiting.
- **`src/intake/questionnaire.ts`** — the form, declared once: sections, questions, which named rule each uses, keyboard hints, option groups, and conditions as data. Everything else about the intake is derived from it; `HOW-TO-EDIT.zh.md` beside it is the editing guide for non-engineers.
- **`src/intake/rules.ts`** — the named rules: per-field normalisation (pinyin uppercased, passport number stripped and `^[A-Z0-9]{9}$`, mainland mobile, income stripped of `¥` and commas) and the cross-checks, including the two-phase passport check — against today when the question is asked, against the real return date at submission. Named so the backend can implement each one again under the same name.
- **`src/intake/schengen-tourism-v1.ts`** — the derived tables the screens and API read (`FIELD_BEHAVIOUR`, `QUESTION_SCHEMAS`, `QUESTION_OPTION_GROUP`), the per-section schemas, and `parseQuestion`/`parseIntake`.
- **`src/intake/sections.ts`** — the form as data: sections, questions, `readAnswer`, `sectionState`, `intakeProgress`, `resumePoint`, `nextQuestion`. Unbuilt sections are listed as `available: false` rather than hidden, because a form that hides its later half looks shorter than it is.
- **`src/intake/condition.ts`, `answers.ts`** — conditions written as data (so the questionnaire gate can check every answer a condition names) and the dot-path readers.
- **`src/intake/contract.ts`, `version.ts`, `contract.lock.json`, `declaration.ts`** — the intake contract: the core questions and checks, versioned and checksummed in the lock file, which only `pnpm intake:lock` writes; `declaration.ts` refuses a questionnaire the rest of the system cannot read.
- **`src/intake/provenance.ts`, `extraction.ts`** — where an answer came from: a value read off a document is a placeholder until confirmed, and `decideProposals` decides, deterministically, which read values may become proposed answers.
- **`src/conformance/` and `conformance/*.json`** — what the backend is held to: `export.ts` writes the rules' data to `apps/api/app/rules/generated/intake.json`, `vectors.ts` writes inputs and the outputs the TypeScript gives at a pinned clock. `pnpm intake:export` regenerates both; the tests fail when the committed copies are stale.
- **`src/rules/schengen-spain.ts`** — the document checklist and what "complete" means. Deterministic code, not a model's opinion. `documentCompleteness` counts only `stored` uploads: a `pending` row is one the browser announced and the server has not seen the bytes for.
- **`src/index.ts`** — the barrel; read it as the inventory of what the rest of the monorepo may depend on.
- **`src/validation/issue.test.ts`** — the discipline made mechanical: for every exported schema it feeds deliberately bad inputs and asserts every key is in the registry with exactly the declared parameters. One case serialises a schema given an English custom message and asserts the text never appears in the output.
- **`src/schemas/auth.test.ts`, `src/routes/route-gate.test.ts`, `src/intake/schengen-tourism-v1.test.ts`, `src/intake/questionnaire.test.ts`, `branching.test.ts`, `extra.test.ts`, `extraction.test.ts`, `src/rules/schengen-spain.test.ts`** — behaviour tests. The last one derives its expected mandatory set from the document table rather than hardcoding ids, so adding a document cannot silently pass.
- **`package.json` / `tsconfig.json` / `vitest.config.ts`** — source exports (`.` → `./src/index.ts`, plus `./locales` and `./message-keys`), the shared base config, node environment.

### 5.3 `packages/db` — schema, policies, and their tests

Migrations run in order; each pgTAP file pairs with one of them, except
`job_lease_owner` and `intake_draft_answers`, which add columns and are covered
by the grant tests (005, 008).

- **`0001_profiles.sql`** — `set_updated_at()` (shared by later tables), `profiles` keyed to `auth.users`, the new-user trigger, RLS select/update-own, and an update grant scoped to the `locale` column only.
- **`0002_jobs.sql`** — the queue. Attempt counters, idempotency key, budget columns, four indexes (including a partial one for `state='queued'` and a reaper index on `lease_expires_at`), RLS select-own, and `authenticated` granted select only — a client can watch a job and never write one.
- **`0003_usage_events.sql`** — per-call metering. RLS enabled with *no policy at all*, deliberately: if a grant is widened by accident there is still nothing to satisfy.
- **`20260811033840_applications.sql`** — `applications` (the mutable draft; four RLS policies and a column-scoped update grant that excludes `status` and `submitted_job_id`) and `waitlist_entries` (insert for `anon` and `authenticated`, no select — write-only by grant).
- **`20260811041953_server_role_grants.sql`** — DML for `service_role` on every table, `alter default privileges` so future tables inherit it, and the column-scoped insert grant on `applications`.
- **`20260811172121_job_lease_owner.sql`** — one statement: `jobs.lease_owner`.
- **`20260811182640_uploads.sql`** — the private `uploads` bucket with a size limit and MIME allowlist, four storage-object policies matching on the `userId/applicationId/…` path prefix, the `uploads` table with four more policies, and grants that exclude `status` from `authenticated`.
- **`20260819233145_artifacts_bucket.sql`** — the private `artifacts` bucket, with no client policy at all: only the conductor's service credential can reach it.
- **`20260910022332_intake_draft_answers.sql`** — `applications.draft_answers`, the raw keystrokes for the question in hand, with column grants; `parseIntake` cannot see it, so an unconfirmed value never reaches a submission.
- **`20261005134359_client_grants_baseline.sql`** — every client privilege on public tables restated outright: newer Supabase images default to table-wide grants that made the column-scoped ones gate nothing, so each table is reset for `anon`/`authenticated` and granted exactly what was intended. The one place to read a table's client posture.
- **`20261005141529_intake_provenance.sql`** — `applications.intake_version`/`intake_checksum`, and two tables clients may only read: `document_fields` (what was read off each document) and `answer_sources` (where each answer came from, and when it was confirmed). Writes are `service_role` only.
- **`20261005200000_api_login_role.sql`** — `visa_api`, the backend's login role: `noinherit`, granted `anon`, `authenticated` and `service_role` and nothing else, plus `api_private.account_is_active(user, session)`, a `security definer` function that is its only window onto auth. No password: one is set per project out of band, and locally by `seed.sql`.
- **`tests/001…010*.sql`** — 95 pgTAP assertions over policies and privileges, `010` on what the login role can and cannot do. Run with `pnpm db:test`.
- **`supabase/config.toml`** — the local stack: API on 54321, Postgres on 54322, Studio, Mailpit on 54324; and, under `[remotes.staging]`, the hosted project's auth configuration.
- **`supabase/seed.sql`** — sets the local `visa_api` password (`visa-api-local`). **`supabase/templates/otp.html`** — the sign-in email: digits, no link.

### 5.4 `packages/executors` — the adapter contract

- **`src/contract.ts`** — the whole package, types only: `Executor` (`start`/`poll`/`collect`/`destroy`), `JobRow`, `RunContext`, `RunHandle`, `RunStatus`, `CollectedRun`. Three constraints live in its comments: `input` is sanitized and carries no identity, `deadline_seconds` counts active run time so queue wait never consumes budget, and `poll` watches the artifact and *never* process exit. The point of the indirection is that swapping which worker runs a task is a routing-table edit.
- **`package.json`** — no dependencies and no test script, which is the manifest-level evidence that this is declarations and nothing else. Note there is no `.` export: consumers import `@visa-master/executors/contract`.

### 5.5 `apps/web` — the control plane

#### The library (`src/lib`) — read this before the routes

The web holds no business logic and no server credential (ADR-005): every
`/api/v1` call ends at apps/api (§5.6).

- **`api/backend.ts`** — where the backend is (`API_URL`, default `http://127.0.0.1:8000`) and the one place the cookie session becomes `Authorization: Bearer`: `getSession()` reads (and if need be refreshes) the session, and its access token is sent; whether it is any good is the backend's call.
- **`api/server.ts`** — `apiGet<T>` for Server Components: calls the backend directly as the request's session, `no-store`, and returns `{status, data, error}` with the backend's key.
- **`api/client.ts`** — the browser twin. Never throws: a failed fetch becomes `status: 0` with `errors.request`, a 204 becomes `{ok:true}`, and a failure splits into `issues` (422) or `error`. It never interprets a key.
- **`supabase/config.ts`** — env reader plus `isSupabaseConfigured()`. The app has to build and run with no Supabase project at all.
- **`supabase/server.ts`** — the request-scoped client, which owns the session cookies. Never hoist it to a module singleton: that hands one visitor another visitor's session.
- **`supabase/client.ts`** — the browser client; its only consumer is the uploader, which needs the session token to stream bytes straight to Storage.
- **`supabase/session.ts`** — three states, not two: signed-in, signed-out, *unavailable*. It calls `getUser()` rather than `getClaims()` because a deleted user's token stays cryptographically valid until it expires.
- **`supabase/proxy.ts`** — session refresh for the middleware, writing refreshed cookies onto both request and response and copying Supabase's cache-control headers (without them a CDN can cache somebody's session).
- **`src/proxy.ts`** (beside `lib/`) — Next 16's middleware: locale routing first, then the session refresh written onto the same response, and a redirect to sign-in for a signed-out reader on a protected path (`/dashboard` only).
- **`src/i18n/*`** (beside `lib/`) — next-intl routing, navigation and request config, and `use-session-navigation.ts`: after signing in or out the page is left with a full load, because the client router can replay a redirect it remembered from the other session.
- **`uploads/resumable.ts`** — tus in 6 MiB chunks with `findPreviousUploads`/`resume`. A monolithic upload that dies at 90% either fails outright or, worse, reports success for a passport scan that never arrived.

#### The API (`src/app/api/v1/[...path]/route.ts`) — one forwarder

Every `/api/v1` path the browser calls is forwarded to apps/api unchanged —
method, path, query, body — with the session's access token as Bearer, and the
backend's status and body come back unchanged. Two answers are translated,
because the session is the web's to keep: a verified sign-in code comes back as
tokens, which are stored as the session cookies while the browser gets a 204;
and a sign-out the backend carried out also clears the cookies. A backend that
cannot be reached is `503 {error:{key:"errors.request"}}`. No rule may be
decided here: the mobile app calls the backend directly and would never meet it.

#### The pages (`src/app/[locale]`)

Every page is an async Server Component that reads through `apiGet` and hands
the result to a small `"use client"` form that POSTs back.

- **`layout.tsx` (root)** — a deliberate no-op: `<html>`/`<body>` belong to the locale layout, because `lang` selects the per-script line height the type tokens carry.
- **`[locale]/layout.tsx`** — the real shell: locale validation (an unknown locale is a 404, not a silent fallback to Chinese), `setRequestLocale`, chrome, and the i18n provider.
- **`[locale]/error.tsx` / `not-found.tsx` / `global-not-found.tsx`** — Next's own fallback is English, which is the wrong answer for a reader who has been in Chinese all the way to the failure. The global 404 sits outside the locale layout and prints both languages, because at that point the reader's language is genuinely unknown.
- **`[locale]/page.tsx`** — the landing shell. Explicitly a placeholder for real marketing copy.
- **`[locale]/start/page.tsx` + `route-check-form.tsx`** — the four-question gate, reachable without signing in: whether the product can help is the first thing anyone wants to know. On 401 the form parks its answers in `sessionStorage` and sends the reader to sign in, then restores them.
- **`[locale]/login/page.tsx` + `login-form.tsx`** — two-step OTP on one route, one `<form>` with `name="intent"` submit buttons. The code field is `autoComplete="one-time-code"` so the OS offers it from the notification. On success it leaves with a full page load (`useSessionNavigation`), not a router push.
- **`[locale]/dashboard/page.tsx`** — the canonical `apiGet` page, and the only path the proxy protects. Its three-way render (error / empty / list) exists because a list that could not be loaded must never look like an account with nothing in it.
- **`[locale]/applications/[id]/page.tsx`** — the hinge between "still editable" and "sent". A sent application must not lead back into the form that was sent.
- **`…/intake/page.tsx`** — the hub: section list, progress, and the resume button computed by `resumePoint`.
- **`…/intake/[section]/[question]/page.tsx` + `question-form.tsx`** — one question per page. The URL is validated against the schema *before* any fetch. Which widget renders comes from `FIELD_BEHAVIOUR`, not from the screen. The question is both the `<h1>` and the field's label, so a screen reader announces it on focus.
- **`…/intake/review/page.tsx` + `review-form.tsx`** — everything read back verbatim with a Change link per answer, then submit. Whole-form failures are listed here, each naming the answer it is about.
- **`…/documents/page.tsx` + `document-item.tsx`** — the checklist and the three-step upload. A permanent quiet note says only legibility was checked, because claiming more is the kind of overclaim this product cannot afford.

#### Components, styles, catalogues

- **`components/chrome/*`** — `site-header` (session-agnostic; the page injects the action), `site-footer` (carries the service-boundary disclaimer in plain sight), `language-switcher` (self-names, preserves the current path, always present in the footer), `sign-out-button` (navigates only when the session actually ended), `wordmark` (the repo's one sanctioned hardcoded string, tagged `i18n-exempt`).
- **`components/ui/*`** — `button` + `button-style` (variants and sizes as tables; interaction state in React rather than CSS pseudo-classes), `link-button`, `input`, `date-input` (three numeric fields plus a hidden ISO value), `radio-group` (full-width tappable rows), `callout` (five tones), `card`, `error-summary` (takes focus on mount and links to the offending field), `icon` (CSS-mask over self-hosted Lucide SVGs).
- **`src/styles/tokens/*`** and **`app/globals.css`** — the design-token layer copied verbatim from the design system; `globals.css` re-exports tokens to Tailwind with every value dereferencing a custom property, because a raw hex here would be a second source of truth.
- **`messages/en.json` and `messages/zh-CN.json`** — 249 keys each, identical shape and order. Every user-facing sentence in the product is in these two files.
- **`next.config.ts`** (next-intl plugin, `transpilePackages`, `globalNotFound`, `distDir` so the e2e suite can run a second server), **`eslint.config.mjs`** (the `no-literal-string` rule), **`playwright.config.ts`** (two projects; the backend and two web dev servers), **`tsconfig.json`**, **`postcss.config.mjs`**, **`.env.example`**.

#### The end-to-end suite (`apps/web/e2e`)

Twelve specs, 46 cases at runtime (one, extraction, skipped unless
`DOCUMENT_EXTRACTION=on`). They refuse to trust the browser: uploads,
submissions and job payloads are asserted with `psql` inside the
`supabase_db_db` container, and the sign-in code is read out of Mailpit over
HTTP, so the whole account journey runs with no human.

- **`global-setup.ts`** — fails the run with a fixable message when the local stack is down.
- **`support/mailpit.ts`** — a fresh address per run, and `readSignInCode` polling the inbox.
- **`stub-mode.spec.ts`** — proves the app is usable with Supabase entirely unconfigured (this is the second dev server, on 3100).
- **`i18n-routing.spec.ts`**, **`language-switcher.spec.ts`** — locale routing, `<html lang>`, the 404, switching without losing the page.
- **`auth-otp.spec.ts`** — the whole sign-in/sign-out journey in both locales, including that the email carries digits and not a magic link, and that signing out and back in within one tab lands on the dashboard.
- **`route-check.spec.ts`** — accept, refuse-with-every-reason, validate, and read without an account.
- **`intake.spec.ts`** — the hub, per-answer rules, the passport-expiry rule, and resume after losing the session.
- **`documents.spec.ts`** — the checklist is route-specific, a document counts only once the server saw the bytes, and submission is gated on documents.
- **`submit.spec.ts`** — all twenty questions through the browser, asserted against the queued job row.
- **`stale-session.spec.ts`** — a cryptographically valid session for a deleted account is treated as signed out.
- **`provenance.spec.ts`** — an answer read from a document is held back until the applicant confirms it.
- **`extraction.spec.ts`** — a passport scan read into proposed answers the applicant confirms; needs `DOCUMENT_EXTRACTION=on` and the fixture reader.
- **`support/intake.ts`** — shared helpers for filling the intake.
- **`api-contract.spec.ts`** — the same journey with no browser at all: the shape a mini program or mobile app will consume.

### 5.6 `apps/api` — the backend (FastAPI, ADR-005)

Every `/api/v1` endpoint. Routers parse and call one service; services hold the
logic, each mirroring the Next.js service it replaced check for check and key
for key, so the contract suite that described those describes these.

- **`app/main.py`** — the app factory: settings, database, JWKS, Supabase client, routers, and the exception handlers that are the wire format — `ValidationFailure` → 422 `{issues}`, `ApiError` → its status with `{error:{key,…}}`, anything else → a logged 500 `errors.request`.
- **`app/auth.py`, `app/deps.py`** — Bearer only, ES256/RS256 only, verified against the project's JWKS; then the account must exist, not be banned, and — when the token names its session — that session must still exist, so a signed-out token stops working at once. Every refusal is `401 route.sessionExpired`. `Session` resolves the caller only when the service asks, so a malformed request is told what is malformed with or without a session.
- **`app/routers/`** — `auth`, `routes`, `applications`, `health`: thin adapters that parse, call one service and map the result. 17 operations, all under `/api/v1`, including `GET /health`.
- **`app/config.py`, `app/errors.py`** — every setting from the environment (including `DOCUMENT_EXTRACTION`, off by default), and the two wire failure shapes.
- **`app/db.py`** — asyncpg, connected as `visa_api`, a login role that can do nothing until it switches role (migration `20261005200000_api_login_role.sql`; it reaches auth only through `api_private.account_is_active`). `as_user(caller)` is a transaction under `authenticated` with the caller's claims (what PostgREST does), so RLS and the column grants still apply; `as_anonymous()` for the waiting list; `as_service()` and `with_service_authority(connection)` for the writes only the server may make, the latter inside the caller's transaction so an answer and its source row land together. The pool is opened by the first request as well as by the lifespan, because Vercel's Python runtime runs no lifespan; a connect timeout bounds it, and a failure logs its error type.
- **`app/supabase.py`** — the two HTTP calls left: Auth (send a code, verify it, sign out) and Storage (delete an object, as the caller).
- **`app/services/`** — `auth`, `routes`, `applications`, `intake`, `uploads`, `submission`. Two strengthenings over the Next.js versions, both atomic where those were not: an answer and its `answer_sources` row commit together, and a job and the application's `submitted` mark commit together. An id that is not a UUID is a 404, not a 502.
- **`app/rules/`** — the rules as this service runs them: data from `generated/intake.json`, named rules and evaluators re-implemented, held to packages/core by the conformance vectors.
- **`api/index.py`, `vercel.json`** — the Vercel entrypoint (serves `app` with paths intact; no rewrite) and the project's own build config: `uv pip install -r requirements.txt`, no workspace install.
- **`scripts/py.sh`** — runs every package script inside `.venv`, or says to create it with `pnpm --filter @visa-master/api venv` (needs uv and Python 3.12).
- **`tests/`** — 94 tests: wire format, token verification, the OpenAPI snapshot, conformance, `test_db_integration.py` (the login role, RLS through `as_user`, the pool opening without a lifespan), and `test_endpoints.py`: every endpoint against the real local Postgres, with Auth and Storage as recording doubles.
- **`openapi.json`** — the contract, generated (`pnpm --filter @visa-master/api openapi`) and checked by the test suite.

### 5.7 `apps/conductor` — the state machine

One long-running Node process, run straight from TypeScript by `tsx`. It is the
only thing allowed to decide a job's outcome.

- **`src/index.ts`** — the supervisor loop in about 120 lines: sweep, claim, run, sleep. It is also where the product decides what a default checkout does: the docker executor is used **iff** `HERMES_JOB_COMMAND` is set, otherwise the fake one with a warning, because until a model credential exists there is no honest default for that command. Shutdown is cooperative — SIGINT flips a flag and takes effect between jobs, never mid-run. With `EXTRACTION_EXECUTOR=fixtures` it also registers the fixture document reader for `llm_gateway`; otherwise nothing runs extraction jobs.
- **`src/config.ts`** — every env var and timing default (lease 90s, heartbeat 15s, heartbeat timeout 60s, reaper 30s, idle poll 2s). The 90/15/60 spread is deliberate: a lease outlives several missed heartbeats, while a dead process is noticed in under a minute. Its header explains why this process holds a database connection instead of an API client.
- **`src/lease.ts`** — all the queue SQL, plus the failure taxonomy. `claimNextJob` is one statement (`FOR UPDATE SKIP LOCKED`, `attempt = attempt + 1` at hand-out). `FailureCode` is seven values (`input_unavailable` when a job's documents cannot be staged); `isRetryable` returns `code !== "budget_exceeded"`; `failJob` maps `wall_clock_exceeded` to `timed_out` and everything else to `failed`, and requeues while attempts remain.
- **`src/run.ts`** — one job's lifecycle: stage the job's documents into the scratch (or fail `input_unavailable`), start, then the ways out of the poll loop — deadline, lease lost, executor failure, collection failure, a refused QA verdict, a refused write-back, success. `destroy()` is in a `finally` — a container left behind is a container still holding documents.
- **`src/qa.ts`** — the QA gate (§3 step 8). Accepts `passed` and `visual-review-required`; `failed` is `qa_failed`; unreadable, unrecognised or self-contradictory is `validation_failed`. Its header records what it is *not*: v0.4 §3.3 puts the QA report fourth in a six-step validation whose first three steps have nowhere to run yet.
- **`src/watchdog.ts`** — the reaper. Deadline sweep first, abandoned-heartbeat second, deliberately: a job can be both late and abandoned, and the more specific explanation is the useful one.
- **`src/router.ts`** — a pure `task_type → executor_kind → Executor` lookup. By default only `hermes` is registered, so six of the eight task types would fail as `validation_failed`; `EXTRACTION_EXECUTOR=fixtures` also registers `llm_gateway`, with a reader that only knows how to extract.
- **`src/artifacts.ts`** — a 30-line Supabase Storage adapter. The conductor uploads with its own credential *after* the run; the job container never held one, which is the point.
- **`src/executors/docker.ts`** — the real executor: one detached container per attempt named from `(jobId, attempt)`, `--cpus`/`--memory`/`--pids-limit 512`/`--security-opt no-new-privileges`, one bind mount, an environment constructed from literals. `artifactReady` requires both `qa-report.json` and `delivery/`. `poll` checks the artifact first, then `docker inspect`; the exit code is never read.
- **`src/executors/fake.ts`** — the stand-in that made the state machine buildable before any VM existed. It watches for an artifact rather than for itself, for the same reason the real one does.
- **`src/executors/scratch.ts`** — one function; the attempt number in the path is what makes a retry start from an empty directory.
- **`src/documents.ts`** — resolves the job's upload ids to bytes with the conductor's own credential, checked against the job's owner and `stored`, and stages them in `documents/` with a `documents.json` that carries no path and no account.
- **`src/writeback.ts`** — for tasks whose output is data: validates an extraction report and writes `document_fields` and proposed answers, deciding through `decideProposals` in packages/core.
- **`src/executors/extraction-fixture.ts`** (+ `fixtures/extraction`) — a document reader that answers from hand-written fixtures, standing where the gateway call will stand.
- **`Dockerfile`, `scripts/`** — the conductor as an image for `compose.vm.yml`, plus `enqueue:placeholder` and `run:job` for driving one job by hand.
- **`src/lease.test.ts`** (11), **`src/run.test.ts`** (16), **`src/documents.test.ts`** (7, one of them only with a Storage secret key), **`src/writeback.test.ts`** (5), **`src/qa.test.ts`** (12), **`src/executors/docker.test.ts`** (5), **`src/executors/egress.test.ts`** (5) — lease, run, documents and writeback need Postgres; qa needs nothing; egress needs Docker; docker needs Postgres, Docker and the `visa-master-hermes` image. They cannot be mocked: what is being checked is what Postgres does when two statements race, and what a container can actually reach.

### 5.8 `infra/` and `scripts/`

- **`infra/compose.local.yml`** — the v0.3 egress boundary in ~15 lines: `vm-egress-internal` (`internal: true`, so a container attached only to it has no default route), `vm-egress-external`, and one dual-homed Squid aliased `proxy`. The names match the conductor's defaults, so the two agree with no env set. The LLM gateway is deliberately absent from both compose files.
- **`infra/compose.vm.yml`** — the same topology on the VM, plus the conductor as a supervised service; written and reviewed, never applied to a host.
- **`infra/placeholder-job/`** — a job image that writes a pack-shaped nothing (`qa-report.json` and `delivery/`), so the real docker path can be proven with no model (see `infra/README.md`).
- **`infra/squid/squid.conf`** — the shortest file that explains the whole security model. Deny link-local and RFC1918; ports 80/443 only; deny cleartext POST/PUT/PATCH/DELETE off the allowlist; allow and log everything else.
- **`infra/squid/allowlist.txt`** — comments only, on purpose: an empty allowlist means no cleartext write leaves a job at all. It gets *looser* by exactly one host when the gateway lands.
- **`scripts/check-i18n.mjs`** — 200 lines, no framework, exit 1 on any problem: catalogue parity both ways, ICU validity, ICU argument parity across locales, coverage of `MESSAGE_KEYS` including declared parameters, no empty messages, and a CJK sweep over `src/` with an `i18n-exempt` escape hatch. It catches Chinese; Latin-script copy is ESLint's job.
- **`scripts/doc-reader/`** — builds the HTML readers, TOCs and diagram SVGs in `doc/`; `pnpm doc:check` fails on a stale one, and CI runs it.

---

## 6. Running it locally

Everything runs on one machine, and nothing below needs the deployment to
exist — that is why a fresh checkout can be made to work in about ten minutes.
The control plane is also deployed (two Vercel projects — apps/web at app.wdnx.world
and apps/api at api.wdnx.world — and a hosted Supabase project, see
[STATUS.md](STATUS.md)), but development does not go through it: the local
stack has its own database, its own auth, and Mailpit instead of real mail.
There is still no VM, so the agent plane runs only here.

### What you need

Node 22.12+, pnpm 10, uv with Python 3.12 (for apps/api), the Supabase CLI, and
Docker running. Docker is needed
three separate times: for the local Supabase stack, for the conductor's
container tests, and for the agent plane in `infra/`.

### First run

```bash
pnpm install
pnpm --filter @visa-master/api venv   # once: apps/api/.venv (needs uv)
pnpm db:start        # boots Postgres, Auth, Studio and Mailpit; prints the URL and keys
```

Put the printed values into `apps/web/.env.local` and `apps/api/.env` — the names
are in each `.env.example`, and both files are gitignored. The backend connects
as `visa_api` (locally `postgresql://visa_api:visa-api-local@127.0.0.1:54322/postgres`),
never as `postgres`. Then:

```bash
pnpm dev             # apps/web on :3000, apps/api on :8000, and the conductor
```

The web app runs with **no** Supabase configuration at all (stub mode): the
landing page renders and the sign-in screen says plainly that it is not
configured rather than pretending to work. That path is covered by
`stub-mode.spec.ts`, so it stays true.

`pnpm dev` also starts the conductor, which exits immediately unless
`DATABASE_URL` is set — in `apps/conductor/.env.local` (names in its
`.env.example`) or your shell. `pnpm db:status` prints the value. Without `HERMES_JOB_COMMAND` it runs the fake
executor, which is what you want until you have a provider credential: it
produces a QA report after five seconds and no real pack.

Sign-in emails never leave the machine — Mailpit catches them at
<http://127.0.0.1:54324>, so a local login needs no mail provider.

### What to check, and what each check proves

```bash
pnpm lint typecheck test     # expands to `turbo run lint typecheck test`
pnpm --filter web build      # the catalogue gate, then the Next build
pnpm db:test                 # pgTAP: the policies behave as specified
pnpm --filter web e2e        # Playwright against the real local stack
```

That is the bar `AGENTS.md` states, and the expected shape of a green run is:

| Layer | Expect | Needs |
|---|---|---|
| `lint` / `typecheck` | 6 workspaces each | the api's `.venv` |
| `packages/core` | 113 passed | nothing |
| `apps/api` | 94 passed | the local stack for the database tests (they skip without it) |
| `apps/conductor` | 61 (one skipped without a Storage secret key) | Postgres for most; Docker for 10, 5 of those also the Hermes image; the 12 QA-gate tests need nothing |
| pgTAP | 10 files, 95 assertions | the local stack |
| Playwright | 46 cases at runtime, three of them looped over both locales; extraction skipped unless `DOCUMENT_EXTRACTION=on` | the stack, plus the backend and two web dev servers Playwright starts itself |

Five traps worth knowing before you read a green run as proof:

1. **The docker executor tests return early rather than skipping** when
   `visa-master-hermes` is absent. On a machine without that 5 GB image the
   suite goes green having tested nothing. Build it from the `visa-master` repo
   if you are touching the executor.
2. **`turbo` caches `test`**, while the conductor's tests depend on Postgres,
   Docker and that image. An unchanged tree can replay a cached pass.
3. **Playwright starts a second dev server on :3100** with the Supabase
   variables emptied, to exercise stub mode. If :3100 is busy, that project
   fails for reasons that have nothing to do with your change.
4. **The e2e suite talks to Postgres directly** (`docker exec supabase_db_db
   psql`) to assert what the browser cannot see. If the container name differs
   on your machine, those assertions are what break first.
5. **A fresh worktree has no `apps/web/.env.local`** — it is gitignored, so it
   does not come with a `git worktree add`. The app then runs in stub mode and
   the suite fails with 503s everywhere, which looks like a broken app and is a
   missing file. Write the two Supabase values from `pnpm db:status` (and `apps/api/.env`, which
   is gitignored the same way) and re-run.

### Seeing a job run end to end

With the stack up and the web app signed in, submit an application; the row
lands in `public.jobs` as `queued`. Start a conductor against the same database
and it will claim it, run the fake executor, write a QA report, pass the gate,
and land on `succeeded`:

```bash
# the local stack's own default; `pnpm db:status` prints it as DB_URL
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  pnpm --filter @visa-master/conductor start
```

To watch the real container path instead, build `infra/placeholder-job`, bring up
the egress plane (`docker compose -f infra/compose.local.yml up -d`), and set
`HERMES_IMAGE=visa-master-placeholder-job:latest` and
`HERMES_JOB_COMMAND=/usr/local/bin/run.sh` (`infra/README.md` §3). The real
Hermes command, which would produce a pack, does not exist yet — see §7.

---

## 7. Where the work goes next

[`STATUS.md`](STATUS.md) is the authority; this is the orientation version of it.

### The next thing to build

**The review gate and delivery (week 4).** Today a job that passes QA reaches
`succeeded`, and `succeeded` means "waiting for a person" — but the person has
no queue to work from and the applicant has no page to download from. That is:
the `progress`/`job_events` stage machine and its timeline, `/admin/review` with
approve → `delivered` and reject → a structured reason, a migration for
`packs`/`reviews`/`audit_log`, and a delivery page with signed URLs. The private
`artifacts` bucket it will deliver from already exists.

**The LLM gateway** is the other half of week 3 and the reason no real pack has
ever been produced: a version-pinned LiteLLM service holding the provider key,
Hermes pointed at it, and the Squid allowlist reduced to the gateway alone.

### Known gaps in what is built

These are real, in shipped code, and easy to mistake for done. The current list
lives in `STATUS.md`; at the time of writing it is:

- **The egress tripwire is cleartext-only.** Squid cannot see a method inside a
  `CONNECT` tunnel, so rule 3 does not fire on HTTPS. Reading the tunnel is v0.3
  §5.2 rule 4 — TLS interception, phase 2 by design.
- **One path leaks scratch.** `executor.start()` runs before the `try`/`finally`
  that owns `destroy()`.
- **No write-completion barrier.** `artifactReady` can fire while the container
  is still writing into `delivery/`, so a partially written pack can be
  collected — and with the QA gate in place, a half-written pack can now produce
  a genuine `qa_failed` for a run that would have succeeded seconds later.
- **A crashed conductor leaks a container** holding the applicant's documents.
- **Metering is schema-only.** Nothing writes `tokens_in`/`tokens_out` or reads
  the budget columns, so `budget_exceeded` cannot be emitted.
- **Executor kind vocabularies disagree** — the contract says `llm-gateway`, the
  router and `jobs.executor_kind` say `llm_gateway`; by default only `hermes` is
  registered (the fixture reader adds `llm_gateway` when asked for).

### Three loose ends this document turned up

- **Three paths are named for the QA report and none of them agree.** The agent
  toolchain writes `<delivery-folder>/qa/qa-report.json`; the docker executor
  polls `<scratch>/qa-report.json`; architecture v0.4 says
  `workspace/<case>/qa-report.json`. Nothing has run end to end, so this has
  never had to be true. Whoever writes `HERMES_JOB_COMMAND` resolves it.
- **A repaired pack can present a stale verdict.** A targeted QA re-run writes
  `qa-report-<document>.json` and does not delete the full report, so the
  earlier failing `qa-report.json` survives on disk — which is exactly the file
  the executor reads.
- **`pass` versus `passed`.** Architecture v0.4 §3.2 and §3.3 spell the clean
  status `pass`; the producer writes `passed`. The gate accepts what the
  producer writes and rejects `pass`, with a test pinning the discrepancy. The
  document is the thing that is wrong.

### Everything else not built

Weeks 5–8 in [`doc/platform-and-dev-plan-v2-en.md`](doc/platform-and-dev-plan-v2-en.md):
the gateway executor and its step library, per-user budgets, a requirements
cache, CI/CD beyond the generated-docs check (`.github/workflows/docs.yml`; there
is no lint/typecheck/test workflow yet), container hardening beyond four flags,
observability, notifications, retention enforcement, a restore drill, and
payments. Of deployment, the control plane is live (hosted Supabase, two Vercel
projects); the Hetzner VM for the agent plane is blocked on accounts and spend,
not on code. The CN-entity items (ICP filing,
WeChat Pay, +86 SMS, a Mini Program) all hang off one prerequisite this
repository cannot supply.
