# Status — where the build stands

**As of:** 2026-10-05 · everything described here is on `main`, through PR #16. Weeks 1–2 arrived in PR #4;
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

### API-first control plane (ADR-004, complete)

- Fourteen route handlers under `/api/v1/**` over six services in `apps/web/src/lib/services/`
  (seven modules — the seventh holds the two error classes). Handlers are thin — parse, call
  one service, map the result; the longest route file is 13 lines.
- **Zero `use server` directives remain anywhere in the repo.** Server Components read through
  `lib/api/server.ts`, Client Components call through `lib/api/client.ts`; no page or component
  imports a service or touches the database directly.
- The wire protocol carries catalogue keys, never sentences: `422 {issues:[{path,key,params?}]}`
  for rule failures, `{error:{key}}` otherwise, produced in one place (`lib/api/http.ts`).
- `apps/web/e2e/api-contract.spec.ts` pins the contract, including the whole journey
  (create → answer → gate → submit, exactly once) driven headlessly with no browser UI.
- [AGENTS.md](AGENTS.md) states the discipline as six rules under a heading that points at its
  record; [ADR-004](discussion/ADR-004-api-first-control-plane.md) is the decision itself, in
  ten numbered points, and the v2 plan carries the revision.

### Agent plane packaged to run (PR #14)

- `apps/conductor/Dockerfile` builds the conductor from the repository root; it carries the
  docker CLI, not the daemon, and `.dockerignore` keeps `.env.local` out of every layer.
- `infra/placeholder-job` is a busybox image that produces a pack-shaped nothing through the
  executor's exact contract, so the loop from a queued job to an artifact in the private bucket
  can be closed without a model.
- `infra/compose.vm.yml` is the local egress topology plus the conductor as a supervised
  service, publishing no port. Not yet done, as `infra/README.md` records: no job has gone
  end to end against the hosted database, and no VM exists.

### Layout for the mobile app and a future API service (PR #15)

`apps/app` (React Native + Expo, a client of `/api/v1`) and `apps/api` (empty on purpose:
ADR-004 keeps the backend in Next.js) hold only READMEs. Neither has a `package.json`, so
neither is a workspace yet.

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
| 3 | One declarative questionnaire instead of three tables; zod derived from it | 2–3 days | in progress |
| 4 | Unlock the partner: an `extra.*` namespace, errors written for non-engineers | 1 day | to do |
| 5 | Document checklist `appliesWhen` as declarations, not string comparisons | half a day | to do |
| 6 | Migration: `document_fields` / `answer_sources` / `intake_version` / checksum | 1–2 days | to do |
| 7 | `jobs.input` carries upload references (ids only, never paths) | half a day | to do |
| 8 | Branching `showIf`, and a gate on placeholder answers | 3–4 days | to do |
| 9 | Extraction write-back, driven by hand-made fixtures | 1–2 days | to do |
| 10 | Real extraction | — | blocked on the LLM gateway |

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
| Playwright end-to-end, 10 spec files, **40 cases at runtime** (37 `test()` calls, 3 of them looped over both locales) | real sign-in via the Mailpit API, real uploads into the bucket, full journey to a queued job, plus the headless API contract | Docker + the local Supabase stack; Playwright starts both dev servers |
| `packages/core` unit tests, **59** | schemas, the route gate, the Schengen-Spain document rules, the questionnaire gate | nothing — the only layer that runs without Docker (`pnpm check:intake`) |
| `apps/conductor` tests, **47** | lease and run-loop races against real Postgres; the QA gate's verdicts as a pure table; the docker executor and the egress denials against real containers | local Postgres; 10 of them also need Docker, and 5 of those the `visa-master-hermes` image |
| pgTAP, 7 files, **52 assertions** | row-level security and privilege grants, one file per migration except `job_lease_owner`, which adds a column and has none | the local stack (`pnpm db:test`) |

Plus the two i18n build gates: `pnpm --filter web build` runs the catalogue check directly,
and the hardcoded-string rule reaches a build only through turbo, whose `build` depends on
`lint` — so `pnpm build` runs both and the filtered form runs one.

**Last full run: 2026-08-21**, against the local stack on the founder's machine, after the QA
gate landed — `lint` and `typecheck` 5/5 workspaces, `packages/core` 49 passed,
`apps/conductor` 47 passed, the web build through the i18n gate, pgTAP 52 of 52, and
Playwright 40 passed with none flaky. Two things that run is worth knowing for:

- **The container path was genuinely exercised this time.** `docker.test.ts` booted the real
  `visa-master-hermes` image, staged input into it, killed a run that outlived its deadline,
  and asserted the container carries no provider key and reaches nothing directly. That is not
  guaranteed on another machine: those five cases **return early rather than skipping** when
  the 5 GB image is absent, so elsewhere the suite can go green without testing anything.
- **One case flaked earlier in the day and has not reproduced.** The headless journey in
  `api-contract.spec.ts` got a 500 where the contract says 422 (`validation.pinyin.invalid`),
  on the first request of an otherwise clean run, and passed on retry; three repeats with
  retries disabled passed 18 of 18, and the run above was clean. Still unexplained, and worth
  explaining before the contract is anyone else's to depend on.

## Staging deployment (control plane only)

The trusted half of the system is now hosted, at **https://app.wdnx.world**. What that
covers, and what it does not:

- **Vercel** carries `apps/web`. The project's Root Directory is `apps/web`, so the
  workspace installs from the repository root and Next is found where it actually lives;
  build command and output directory are left to auto-detection for the reason recorded in
  `vercel.json`'s commit. The domain is a first-party one rather than `*.vercel.app`,
  which is what [architecture v0.4](doc/architecture-v0.4-en.md) §B.4 asks for on the
  China-reachability grounds recorded there.
- **Supabase** (project `rmsdyqmuztydicfintbs`, `us-west-2`, Free plan) carries Postgres,
  Auth and Storage. All eight migrations are applied, and both private buckets were created
  by them rather than by hand — the `storage.buckets` inserts run unmodified against a
  hosted project.
- **The hosted project's auth configuration lives in `config.toml`**, in a
  `[remotes.staging]` block pushed with `supabase config push`, not in the dashboard. That
  is what keeps the OTP template, `enable_confirmations = false`, and the rate limits
  reviewable next to the code that depends on them.
- **Resend** sends the mail, over SMTP, from `no-reply@wdnx.world` on a verified domain.
  Supabase's built-in SMTP allows two emails an hour, which is not a sign-in flow.

**Sign-in is verified end to end against this deployment**: a real address, a code that
arrived, a session, and the dashboard rendering behind row-level security. That exercises
more than auth — the dashboard reads through `lib/api/server.ts`, so the loopback API hop
works under Vercel's proxy headers, and `/api/v1/applications` returned an RLS-filtered
result. The `profiles` row follows from the `on_auth_user_created` trigger, whose failure
would have aborted the signup itself.

What is **not** deployed: the whole agent plane. No conductor, no Hetzner VM, no egress
proxy, no job containers. A pack cannot be produced by anything running in the cloud today,
and submitting an application there enqueues a job that nothing will claim.

## Where we are

The full journey runs locally end to end: sign up → route check → create application →
20-question intake → upload documents → review → submit → conductor claims the job → status
reaches "being reviewed by a person". Hosted, only the front half of that runs: sign-in
works, and everything from the conductor rightwards has nowhere to execute. Spend so far is
zero — Vercel Hobby and Supabase Free — which is also why the staging database has no
backups and pauses after seven idle days.

## Known gaps in what is built

These are real, unfixed, and worth knowing before the first paying pack. None blocks the
current milestone.

In the questionnaire layer — each verified, and each scheduled against a stage above:

- **An empty section reads as a second review section.** `sectionState` decides "this is the
  review" by `questions.length === 0`. The gate now fails on an empty non-review section, but
  the heuristic itself remains (stage 3).
- **Document conditions compare bare strings.** `appliesWhen` in `schengen-spain.ts` reads a
  hand-written `IntakeAnswersShape`, tied to neither the questionnaire nor the option
  constants; renaming an option id silently drops the sponsor-proof requirement (stage 5).
- **A submitted application's answers can still be edited.** `saveAnswer` has no status
  guard.
- **Four e2e files hard-code question order, count and control type** — `submit.spec.ts`
  (twenty hand-ordered calls and the literal `"20 of 20 questions answered"`),
  `api-contract.spec.ts`, `documents.spec.ts`. Adding a question fails all of them, and
  `documents.spec.ts` reports a missing document when the real cause is an unanswered
  question. Changing wording fails none: they read the question text from `en.json`.
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
  outside the team uses it, Vercel Pro (Hobby is non-commercial) and Supabase Pro (Free has
  no backups and pauses when idle). Blockers are accounts and spend, not code.
- **Deploy on push**: Vercel could not connect the GitHub repository — the account lacks
  write access to `immurtal-official/visa-master-website` — so every deploy is a manual
  `vercel deploy --prod` and pull requests get no preview. Granting that access and running
  `vercel git connect` is the whole fix.
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
- The agent plane stays one VM until a written trigger fires (isolation review → per-job
  microVMs; capacity → second VM). The gateway stays co-located with the conductor: it
  holds the provider keys and is the job containers' only inference route.
- A second client does not force a backend split. What a WeChat Mini Program actually
  forces is China infrastructure — ICP-filed domains (mini programs cannot call
  `supabase.co` directly) and therefore the CN entity — which no framework choice avoids.
