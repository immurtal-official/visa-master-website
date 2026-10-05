# Status — where the build stands

**As of:** 2026-10-05 · everything described here is on `main`, through PR #38, and the
control plane is hosted and working again (see [Staging deployment](#staging-deployment)). Weeks 1–2 arrived in PR #4;
the API-first work — six commits, `22cbfe1` through `fa36fbd` — missed that crossing, because
PR #5 merged into a base that had already been merged, and followed in PR #6.
Companion documents: [doc/archive/EXECUTION-PLAN-week1-2.md](doc/archive/EXECUTION-PLAN-week1-2.md) (the plan weeks 1–2
executed), [doc/platform-and-dev-plan-v2-en.md](doc/platform-and-dev-plan-v2-en.md) (the active
eight-week plan — v1 is superseded), [AGENTS.md](AGENTS.md) (the constraints this is built under).
The questionnaire rework has its own stage table below, under
[The questionnaire layer](#the-questionnaire-layer).

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
  RadioGroup, LanguageSwitcher, Icon, LinkButton, chrome).

### Week 2 — intake and documents (complete)

- Route gate in `packages/core`: Chengdu district → Spain, personal tourism, employed. Every
  failing part reported, each as a message key. Unsupported routes go to a write-only
  waiting list and never create an application.
- Applications as server-side drafts; 20-question intake across 7 sections, one question per
  page, autosave on every answer, resume at the exact question after sign-out/kill.
- The question in hand is kept too: typing is saved to `applications.draft_answers` on a pause,
  on the tab being hidden (by beacon, which a cancelled fetch is not), and on leaving the
  question — so a reload no longer costs whatever was half-typed, including half a date. Draft
  values are unvalidated and deliberately invisible to `parseIntake`, so a value nobody pressed
  Continue on cannot reach a submission; each is cleared as its answer is confirmed, and all of
  them at submit.
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

### Week 3 — conductor, real executor, egress boundary (gateway still out)

- `apps/conductor` is real: claim via `FOR UPDATE SKIP LOCKED`, heartbeat-renewed leases,
  wall-clock enforcement in the run loop **and** a reaper as backstop, failure taxonomy with
  per-class retry policy (`budget_exceeded` never auto-retries), completion judged by the
  artifact appearing — never by process exit — and scratch destroyed on every path out of the
  run loop.
- The **real Docker executor** (`apps/conductor/src/executors/docker.ts`) replaced the fake as
  the intended path: one detached container per attempt, image and network and proxy from
  config, `--cpus` / `--memory` / `--pids-limit 512` / `--security-opt no-new-privileges`, one
  bind mount (the job scratch at `/opt/data/job`) and no docker socket, an environment built
  from an allowlist rather than inherited, and force-removal plus `rm -rf` of the scratch when
  the run loop unwinds.
- The **egress boundary** exists and is asserted from inside it: `infra/compose.local.yml`
  puts the job container on an `internal: true` network with no default route, dual-homed
  Squid as the only way out, and `infra/squid/squid.conf` implements v0.3 §5.2 rules 1–3
  (link-local and RFC1918 denied, ports 80/443 only, write methods denied off-allowlist).
  `egress.test.ts` proves each denial, and that the network leaks nothing without the proxy.
  Note what rule 3 can and cannot see: the method restriction bites on cleartext only, and
  `CONNECT` to any public host on 443 is allowed, so an HTTPS body passes unread. Reading it
  is v0.3 §5.2 rule 4 — TLS interception, phase 2 by design, not built.
- Artifact collection: the conductor uploads `qa-report.json` and the whole `delivery/` tree
  to the private `artifacts` bucket under its own credential (migration
  `20260819233145_artifacts_bucket`, no client policy — only the conductor can reach it).
- **The QA gate** (`apps/conductor/src/qa.ts`): `validating` now means something. The
  conductor reads the agent's own `qa-report.json` before marking anything succeeded.
  `passed` and `visual-review-required` go forward — the second is the ordinary outcome and
  is exactly what a review gate is for. `failed` becomes `qa_failed`. A report that is
  missing, unparseable, self-contradictory, or written in a status this conductor does not
  know becomes `validation_failed` instead: an unreadable verdict is not evidence of a good
  pack, and an operator needs to see contract drift as something other than a bad pack. Both
  retry while attempts remain, as everything except `budget_exceeded` does.

  What it does not do: v0.4 §3.3 puts the QA report fourth in a six-step validation, behind
  manifest role-completeness, recomputed checksums and format sanity. There is no manifest
  yet, so a pack can still pass this gate missing a document the applicant needs. Until the
  week-4 human gate exists this stops only the case where the machine already knew.

### The backend as its own service (ADR-005, PRs #28–#31)

- **Every `/api/v1` endpoint now runs in `apps/api` (FastAPI, Python 3.12)** — fifteen, the
  same paths, bodies and keys as before. `apps/web/src/lib/services/` and the fourteen Next.js
  route handlers are gone; the web's one route handler forwards `/api/v1/**` to the backend
  with the cookie session's access token as `Authorization: Bearer`, and holds no server
  credential at all. Server Components call the backend directly as the request's session.
- The backend accepts Bearer tokens only (ES256/RS256 against the project's JWKS), then
  requires the account to exist and — new — the token's session to still exist, so a signed-
  out token stops working at once rather than at expiry.
- Postgres directly (asyncpg), every user-scoped query as `authenticated` with the caller's
  claims, so row-level security and the column grants are still the second line. Two writes
  that were separate are now atomic: an answer with its `answer_sources` row, and a job with
  the application's `submitted` mark.
- The rules stay written once, in `packages/core`: their data is exported to
  `apps/api/app/rules/generated/intake.json`, the named rules are re-implemented in
  `apps/api/app/rules/`, and 6,910 conformance vectors (1,764 of them a branching probe) are
  replayed by the Python suite.
- Zero `use server` directives anywhere. The wire protocol is unchanged:
  `422 {issues:[{path,key,params?}]}` for rule failures, `{error:{key}}` otherwise.
- `apps/web/e2e/api-contract.spec.ts` still pins the contract through the web; the Playwright
  config now starts the backend too. `apps/api/tests/test_endpoints.py` exercises every
  endpoint against the real local Postgres. `apps/api/openapi.json` is the committed contract.
- **Its own database role.** The backend connects as `visa_api`, not `postgres`: `noinherit`, a
  member of `anon`, `authenticated` and `service_role` only, so it can read and write nothing
  until it switches, and cannot become an administrator. The one thing it asks before
  switching — whether a token's account and session are still live — is a `security definer`
  function in a schema of its own (`api_private.account_is_active`), so it has no access to
  `auth` at all. The tests connect the app as this role, and pgTAP asserts what it lacks.
- **Not deployed yet.** Hosting `apps/api` needs its own Vercel project (root directory
  `apps/api`, its own domain) and the web's `API_URL` pointed at it — account work, listed
  under Not done yet.

### Agent plane packaged to run (PR #14)

- `apps/conductor/Dockerfile` builds the conductor from the repository root; it carries the
  docker CLI, not the daemon, and `.dockerignore` keeps `.env.local` out of every layer.
- `infra/placeholder-job` is a busybox image that produces a pack-shaped nothing through the
  executor's exact contract, so the loop from a queued job to an artifact in the private bucket
  can be closed without a model.
- `infra/compose.vm.yml` is the local egress topology plus the conductor as a supervised
  service, publishing no port. Not yet done, as `infra/README.md` records: no job has gone
  end to end against the hosted database, and no VM exists.

### The job's documents reach its scratch

The job's input lists the applicant's documents by upload id (PR #23). Before an executor
starts, the conductor resolves each id — only an upload that is `stored` and belongs to the
job's owner — downloads it with its own credential, and writes it to `documents/` in the
scratch beside a `documents.json` naming which checklist item and page each file is. Every
document is staged or none is: anything missing fails the attempt as `input_unavailable`
before a container starts, and the scratch goes with it. Neither the container nor the
manifest ever holds a storage path, a user id or a key.

### Documents read into proposed answers (stage 9, fixtures in place of a model)

A checklist item declares which answers it can supply (`extracts`: the passport data page
supplies the number, both dates, the pinyin name and the birth date). With the web app run
with `DOCUMENT_EXTRACTION=on`, confirming such an upload queues a `doc_field_extraction` job
carrying the document by reference and the fields to read. The conductor stages the document,
and — with `EXTRACTION_EXECUTOR=fixtures` — a fixture reader answers from
`apps/conductor/fixtures/extraction/<item>.json` where the gateway call will go. What the
reader reports is validated and written back by deterministic code (`decideProposals` in
packages/core, `writeback.ts` in the conductor), in one transaction holding the application
row: every requested field is recorded in `document_fields`; a value becomes a proposed answer
only for a question that is asked, has not been answered by the applicant, passes the
question's own rule, and only while the application is a draft. Proposals are marked
document-sourced and unconfirmed, so the stage-8 gate holds the submission until the applicant
confirms each. The job keeps a count of what was done, never the values read.
`pnpm --filter @visa-master/conductor run:job <id>` runs one queued job by hand.

### Layout for the mobile app (PR #15)

`apps/app` (React Native + Expo, a client of `/api/v1`) holds only a README and is not a
workspace yet. `apps/api` started the same way and is now the backend (above).

### Questionnaire gate (PR #16)

`packages/core/src/intake/questionnaire.test.ts` fails when the questionnaire's tables and its
wording disagree — a question without copy in either catalogue, copy left behind by a removed
question, an option without a label, a document without its name or reason, a question without
a rule or a field behaviour, repeated ids, an empty section. Failures are written for whoever
is editing the questionnaire, not for an engineer. It runs in turbo `test` and on its own as
`pnpm check:intake`, without Docker. The option set each choice question uses is now declared
(`QUESTION_OPTION_GROUP`) rather than guessed from the end of its path.

## The questionnaire layer

The goal: a non-technical partner edits the intake on his own branch — wording, order, steps,
questions, branching, the document checklist — and whatever he breaks stays inside the
questionnaire layer, never reaching the job contract, the conductor, row-level security or the
queue. **There is no `/admin` editor; that is decided.** The obstacle is not capability but
that one question lives in five to seven files across two packages, and the common mistakes
are silent.

| Stage | What | Estimate | State |
|---|---|---|---|
| 1 | Survive a reload: `applications.draft_answers` + debounced draft saves | 1 day | done (PR #12) |
| 2 | Questionnaire gate in vitest / turbo `test` | half a day | done (PR #16) |
| 3 | One declarative questionnaire instead of three tables; zod derived from it | 2–3 days | done (PR #19) |
| 4 | Unlock the partner: an `extra.*` namespace, errors written for non-engineers | 1 day | done (PR #20) |
| 5 | Document checklist `appliesWhen` as declarations, not string comparisons | half a day | done (PR #21) |
| 6 | Migration: `document_fields` / `answer_sources` / `intake_version` / checksum | 1–2 days | done (PR #22) |
| 7 | `jobs.input` carries upload references (ids only, never paths) | half a day | done (PR #23) |
| 8 | Branching `showIf`, and a gate on placeholder answers | 3–4 days | done (PR #24) |
| 9 | Extraction write-back, driven by hand-made fixtures | 1–2 days | done (PRs #25, #26) |
| 10 | Real extraction | — | blocked on the LLM gateway |

Stages 1–9 are on `main`. The partner's guide is
`packages/core/src/intake/HOW-TO-EDIT.zh.md`. Stage 10 swaps the fixture reader for a model
call through the gateway; nothing downstream of the reader changes.

Order matters in three places. **2 before 3**: the gate passing before and after the merge is
what shows the merge did not change the copy contract. **6 before 8**: branching changes what
one questionnaire is, so applications need to record which version they were answered against
first. **9 before 10**: the write-back path is proven with fixtures, so the gateway only changes
where the values come from.

## What the checked-in default actually runs

The docker executor is selected only when `HERMES_JOB_COMMAND` is set; unset — which is how
`.env.example` ships — the conductor falls back to the fake executor with a warning. The real
kickoff command is not in this repo: it lands together with the provider credential. So a
`pnpm start` today produces no real pack, by design. What stops a model call is that absence,
not the proxy: no credential reaches the container and nothing inside it knows what to run.

## Verification

| Layer | What it is | Needs |
|---|---|---|
| Playwright end-to-end, 12 spec files, **45 cases at runtime** | real sign-in via the Mailpit API, real uploads into the bucket, full journey to a queued job, the headless API contract — all through the web's forwarder to the backend. `extraction.spec.ts` runs only with `DOCUMENT_EXTRACTION=on` and is skipped otherwise | Docker + the local Supabase stack + `apps/api/.venv`; Playwright starts the backend and both web dev servers |
| `packages/core` unit tests, **113** | schemas, the route gate, the document rules, the questionnaire gate, branching, extraction decisions, and the check that the exported rules and conformance vectors are current | nothing — runs without Docker (`pnpm check:intake`) |
| `apps/api` tests, **93** | token verification and the wire format; 6,910 conformance vectors replayed against the Python rules; every endpoint against real Postgres with Auth and Storage as doubles (`test_endpoints.py`, 35) | the database tests need the local stack and are reported as skipped without it |
| `apps/conductor` tests, **61** | lease and run-loop races against real Postgres; document staging and extraction write-back; the QA gate's verdicts as a pure table; the docker executor and the egress denials against real containers | local Postgres; the container cases also need Docker, and some the `visa-master-hermes` image |
| pgTAP, 10 files, **95 assertions** | row-level security and privilege grants, including the client-grant baseline, the provenance tables, and what the backend's login role can and cannot do | the local stack (`pnpm db:test`) |

Plus the two i18n build gates: `pnpm --filter web build` runs the catalogue check directly,
and the hardcoded-string rule reaches a build only through turbo, whose `build` depends on
`lint` — so `pnpm build` runs both and the filtered form runs one.

**Last full run: 2026-10-05**, on `main` after PR #31, against the local stack in a cloud
container — `lint`, `typecheck` and `test` 15/15 turbo tasks (`packages/core` 113 passed,
`apps/api` 91 passed, `apps/conductor` 60 passed and 1 skipped), the web build through the
i18n gate, pgTAP 84 of 84, and Playwright 44 passed and 1 skipped (`extraction.spec.ts`,
without `DOCUMENT_EXTRACTION=on`; with it, that spec passed on the PR #31 branch, conductor
included). Two things worth knowing about it:

- **The container cases prove less than they look.** The `docker.test.ts` cases that need the
  5 GB `visa-master-hermes` image **return early rather than skipping** when it is absent, so a
  machine without the image goes green without exercising the container path. The last run
  known to have exercised it is 2026-08-21, on the founder's machine.
- **The contract-suite flake of 2026-08-21 has not been seen since,** and the code it was in is
  gone: the headless journey in `api-contract.spec.ts` once got a 500 where the contract says
  422, on the first request of a run, under the Next.js handlers PR #31 removed. The same
  journey now runs through the forwarder and the FastAPI backend, and has passed every run.

## Staging deployment

The trusted half of the system is hosted at **https://app.wdnx.world**, web and backend,
and **sign-in works end to end** again — checked on 2026-10-05 with a real Gmail address:
code received, signed in, signed out and back in within the same tab.

It was down from PR #31 until then. The web project deploys `main` on every merge, so #31
moved the browser's `/api/v1` calls to a backend that was not yet deployed, and every call
answered `503`. Getting it back took, in order: the `visa_api` migration pushed and its
password set; the `visa-master-api` project; `apps/api/vercel.json` (#36), because the root
`vercel.json` made the project build as Next.js and its Python packages were never
installed; opening the database pool on the first request (#37), because Vercel's Python
runtime runs no lifespan events; a `DATABASE_URL` the pooler accepts; `API_URL` on the web;
and a full-page navigation on sign-in and sign-out (#38), because a client-side push right
after the session changed could leave the reader on the sign-in form, signed in.

What the deployment consists of:

- **Vercel** (team MUSICO, Pro) carries two projects from this one repository, each
  deploying `main` to production on every merge and every branch to a preview, and each
  skipping builds that do not touch its directory:
  - `visa-master-api` — root directory `apps/api`, FastAPI, functions in `pdx1` (Oregon,
    beside the database), at `visa-master-api-musico.vercel.app`; `api.wdnx.world` is
    attached and waits on its CNAME at Cloudflare, which holds the zone. Environment:
    `DATABASE_URL` (the `visa_api` role through the Supabase transaction pooler, set by the
    owner), `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `ENVIRONMENT`,
    `DOCUMENT_EXTRACTION=off`. Vercel Authentication covers its previews only, since the
    web's server calls production directly; the API does its own Bearer checks.
  - `visa-master-website` — `apps/web`, with `API_URL` pointing at the backend. The project's Root Directory is `apps/web`, so the
  workspace installs from the repository root and Next is found where it actually lives;
  build command and output directory are left to auto-detection for the reason recorded in
  `vercel.json`'s commit. The domain is a first-party one rather than `*.vercel.app`,
  which is what [architecture v0.4](doc/architecture-v0.4-en.md) §B.4 asks for on the
  China-reachability grounds recorded there.
- **Supabase** (project `rmsdyqmuztydicfintbs`, `us-west-2`, Free plan) carries Postgres,
  Auth and Storage. All eleven migrations are applied — the last three, including the
  client-grant baseline and the provenance tables, pushed on 2026-10-05 and checked by
  reading the grants back — and both private buckets were created by them rather than by hand — the `storage.buckets` inserts run unmodified against a
  hosted project.
- **The hosted project's auth configuration lives in `config.toml`**, in a
  `[remotes.staging]` block pushed with `supabase config push`, not in the dashboard. That
  is what keeps the OTP template, `enable_confirmations = false`, and the rate limits
  reviewable next to the code that depends on them.
- **Resend** sends the mail, over SMTP, from `no-reply@wdnx.world` on a verified domain. The
  account is the Vercel Marketplace integration on team MUSICO (Free: 3,000 a month, 100 a
  day), reached from Vercel → Integrations → Resend. Delivery to a university mailbox
  (umbc.edu) was accepted by its server and then filtered out of sight; Gmail receives it.
  A DMARC record for `wdnx.world` is the usual next step for institutional mailboxes.
  Supabase's built-in SMTP allows two emails an hour, which is not a sign-in flow.

**Sign-in is verified end to end against this deployment**: a real address, a code that
arrived, a session, and the dashboard rendering behind row-level security. That exercises
more than auth — the dashboard reads through `lib/api/server.ts`, so the loopback API hop
works under Vercel's proxy headers, and `/api/v1/applications` returned an RLS-filtered
result. The `profiles` row follows from the `on_auth_user_created` trigger, whose failure
would have aborted the signup itself.

**That verification predates ADR-005**: it exercised the Next.js backend that PR #31 removed,
and it is what is broken now.

What is **not** deployed: the backend (`apps/api`) and the whole agent plane. No conductor, no Hetzner VM, no egress
proxy, no job containers. A pack cannot be produced by anything running in the cloud today,
and submitting an application there enqueues a job that nothing will claim.

## Where we are

The full journey runs locally end to end: sign up → route check → create application →
20-question intake → upload documents → review → submit → conductor claims the job → status
reaches "being reviewed by a person", with the web, the FastAPI backend and the
conductor as three processes. Hosted, the front half runs — web and backend, sign-in
through creating and answering an application; everything from the conductor rightwards has
nowhere to execute. Vercel is on the team's Pro plan; Supabase is still Free, which is why the
staging database has no backups and pauses after seven idle days.

## Known gaps in what is built

These are real, unfixed, and worth knowing before the first paying pack. None blocks the
current milestone.

**Client grants on the hosted project.** The migrations assumed new public tables give
`anon`/`authenticated` no DML; current Supabase images give them `arwdDxtm`, which let a
signed-in client set its own upload to `stored` and write the submission columns on its own
application. PR #18 (`20261005134359_client_grants_baseline`) restates every client grant and
closes the default ACL, and `008_client_grants.sql` asserts it. Fixed on `main`, locally, and
on the hosted project since the push of 2026-10-05.

- **A new column on `applications` needs its own column grant.** Inserts and updates there are
  granted per column, and Postgres does not extend a grant to a column added later; the symptom
  is a 42501 on first write. `20260910022332_intake_draft_answers.sql` is the worked example.

Elsewhere:

- **The egress tripwire is cleartext-only.** Rule 3 denies POST/PUT/PATCH/DELETE off the
  allowlist, but Squid cannot see a method inside a `CONNECT` tunnel, and tunnels to any
  public host on 443 are allowed. The prompt-injection tripwire the runbook is meant to watch
  therefore fires on plain HTTP and not on HTTPS.
- **One path leaks scratch.** `executor.start()` runs before the `try`/`finally` that owns
  `destroy()`, so a failure inside it — after the docker executor has created the scratch and
  written the sanitized intake into it — leaves that directory on disk.
- **No write-completion barrier.** `artifactReady` can fire while the container is still
  writing into `delivery/`, so a partially written pack can be collected.
- **A crashed conductor leaks.** The container is started without `--rm` and only `destroy()`
  cleans up, so a conductor killed mid-run leaves a live container holding the applicant's
  documents, and a scratch directory on disk, while the reaper only rewrites the row.
- **Metering is schema-only.** `jobs.tokens_in`/`tokens_out` and the whole `usage_events` table
  are never written or read; `max_tokens_total` and `max_cost_usd` are written by their column
  defaults and selected on every claim, but nothing ever compares anything to them.
  `budget_exceeded` is in the taxonomy and nothing can emit it yet.
- **Executor kind vocabularies disagree.** The contract says `llm-gateway`, the router says
  `llm_gateway`, and only `hermes` is registered — six of eight routed task types would fail
  as `validation_failed` today.

## Not done yet

- **LLM gateway** — the largest piece of week 3 still missing: the version-pinned LiteLLM
  service, the provider key it holds, Hermes pointed at it, and the Squid allowlist reduced to
  the gateway itself. The first real pack run waits on this (and costs a few dollars). Week 3
  also still owes `infra/compose.vm.yml`, the rest of the container hardening, and per-job
  token metering; the conductor, the executor and the egress boundary are what is done.
- **Progress UI + review gate + delivery** (week 4): the `progress`/`job_events` stage machine
  and its timeline, `/admin/review` with approve → `delivered` / reject → structured
  `failure_reason`, migration `packs`/`reviews`/`audit_log`, the pre-review validator, and the
  delivery page with signed URLs. The `artifacts` bucket it delivers from already exists.
- **Gateway executor, budgets, requirements cache** (week 5) — including the budget predicate
  that would make the metering columns mean something.
- **CI/CD, hardening, observability** (week 6) — `.github/workflows/docs.yml` is the only
  workflow, and it guards the generated documents rather than the code: there is no `ci.yml`
  running lint/typecheck/test, no migration check, and no deploy pipeline. Container
  hardening has four flags and no non-root user, read-only rootfs, or dropped capabilities.
  Note what the Vercel build is and is not: it runs the app's own `build` script, so the
  catalogue gate runs on every deploy, but the hardcoded-string lint rule does not — that
  one reaches a build only through turbo, whose `build` depends on `lint`. Half a gate is
  worth knowing about precisely because it looks like a whole one.
- **Notifications, retention enforcement, restore drill** (week 7); **payments** (week 8).
- **Deployment**: the control plane is up (see above); the agent plane is not. Still owed
  are the Hetzner VM, `infra/compose.vm.yml`, and the systemd units — and, before anyone
  outside the team uses it, Supabase Pro (Free has no backups and pauses when idle). Vercel is
  already on the team's Pro plan. Blockers are accounts and spend, not code.
- **Hosting loose ends**: the `api` CNAME for `api.wdnx.world` at Cloudflare, then `API_URL`
  on the web switched to it; `SUPABASE_SECRET_KEY` removed from the web project, which no
  longer reads it; a DMARC record for `wdnx.world`.
- **CN-entity-gated items** (tracked, not blocking): ICP filing, WeChat Pay, +86 SMS, any
  WeChat Mini Program — all hang off the same prerequisite.

## Architecture decisions made along the way

- Backend shape examined in depth (Next.js fullstack vs separate FastAPI-class service):
  staying **Next.js as frontend + request/response backend**, with a hard **API-first
  discipline** — every core business capability behind a stable `/api/v1/**` HTTP contract
  with a service layer, the web UI being one client of it, so a mobile app or WeChat Mini
  Program consumes the same contract and a future backend extraction is a re-homing, not a
  rewrite. This is now implemented and binding, not planned: the decision is
  [ADR-004](discussion/ADR-004-api-first-control-plane.md), the rules are [AGENTS.md](AGENTS.md),
  and the plan revision is [v2](doc/platform-and-dev-plan-v2-en.md), which now also exists
  in [Chinese](doc/platform-and-dev-plan-v2-zh.md).
- **The backend became its own service** ([ADR-005](discussion/ADR-005-fastapi-backend-service.md)):
  FastAPI in `apps/api`, on the grounds of visible ownership and one house pattern with
  nihao-pet/platform rather than ADR-004's triggers. The contract did not change; the rules
  still have one home, held to it by conformance vectors.
- The agent plane stays one VM until a written trigger fires (isolation review → per-job
  microVMs; capacity → second VM). The gateway stays co-located with the conductor: it
  holds the provider keys and is the job containers' only inference route.
- A second client does not force a backend split. What a WeChat Mini Program actually
  forces is China infrastructure — ICP-filed domains (mini programs cannot call
  `supabase.co` directly) and therefore the CN entity — which no framework choice avoids.
