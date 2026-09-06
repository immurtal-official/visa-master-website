# Visa Master

The product repo for **Visa Master** — a service that turns a visa request into
a complete, consistency-checked, human-reviewed application pack.

This repo carries the whole product: the documentation and design work that came
first, and the application code that is built against it. The agent that
produces packs — Hermes, its toolchain, and its Docker packaging — lives in the
separate `visa-master` repo; everything else belongs here.

## Start with `PRODUCT.md`

[`PRODUCT.md`](PRODUCT.md) is the standing context for the whole project: what is
being built, for whom, how the pipeline works today, which constraints are
already settled, and what is genuinely still open. It exists so the project does
not have to be re-explained from scratch every time — read it before working
here, whether you are a person or an assistant.

Two sections of it carry weight beyond description:

- **§7 Non-negotiable constraints** — the agent is untrusted, every pack passes a
  human review gate, PII handling is a requirement, cost discipline, customers in
  mainland China. These are decided; don't re-open them without a reason.
- **§10 What is still open** — where new thinking actually belongs.

## Layout

| Path | Contents |
|---|---|
| `PRODUCT.md` | The project primer — read first |
| `STATUS.md` | What is actually built, what is deliberately still fake, and what is left — read second |
| `CODEBASE.md` | How the code works: the request-to-pack walkthrough, every file explained, how to run it, and where the work goes next — read before changing code |
| `AGENTS.md` | The standing engineering constraints — one page, binding, each section pointing at its decision record. Read it before changing code. |
| `doc/` | The architecture and the platform plan **that are in force**: v0.4 (current) and v0.3 (still authoritative for the agent security model), plus the v2 plan. v0.4 and the v2 plan each ship in English and Chinese, each with a generated single-file `.html` reader beside it. Superseded versions live in [`doc/archive/`](doc/archive/README.md) and are kept, not deleted |
| `doc/archive/` | Superseded documents, with a README naming what replaced each — including `EXECUTION-PLAN-week1-2.md`, the plan weeks 1–2 executed |
| `discussion/` | The ADR ledger — every record in it is in force, and each is amended by a later ADR rather than edited. The long-form arguments they came out of are in `discussion/explorations/`; see [`discussion/README.md`](discussion/README.md) |
| `design/` | Product design, binding guidelines (device parity, internationalization, design system selection), the exported design system, and prototypes — see [`design/README.md`](design/README.md) and its ground rule: design output is reference, never production code |
| `apps/` | `web` — the Next.js front end, its `/api/v1/**` handlers and the service layer behind them; `conductor` — the workflow orchestrator and its executors |
| `packages/` | `core` — shared zod schemas, deterministic route rules, i18n message keys; `db` — migrations and pgTAP tests; `executors` — the adapter contract only, no implementations |
| `infra/` | The agent plane as compose: the internal network and the Squid egress config. Systemd units and deploy scripts land with the VM |
| `scripts/` | Repo-level build gates — today, the i18n catalogue check — and `doc-reader/`, which generates the documents' tables of contents and their HTML readers |

The monorepo shape (`pnpm` + Turborepo) and the build order come from
[`doc/platform-and-dev-plan-v2-en.md`](doc/platform-and-dev-plan-v2-en.md) — the active plan;
v1 is kept, marked superseded, for the decisions it recorded. Two
standing directives bind all application code from the first commit:
**device parity** ([`design/guidelines/mobile-parity-en.md`](design/guidelines/mobile-parity-en.md))
and **internationalization** ([`design/guidelines/internationalization-en.md`](design/guidelines/internationalization-en.md))
— in particular, validation in `packages/core` emits message keys, never
sentences, from the very first schema.

Suggested entry point into the architecture: [`doc/architecture-v0.4-en.md`](doc/architecture-v0.4-en.md).
Read **Part I** first and stop there — about ten minutes, and §I.5 summarises the
key decisions in a table pointing at their detail sections. **Part II** is the
other 90% of the document and is not optional reading so much as *reference*
reading: contracts, DDL, state machines and sequences, opened by the chapter when
you are about to build against one of them. The table of contents at the top of
the file, and the sidebar of the `.html` reader, show both halves.
Chinese: [`doc/architecture-v0.4-zh.md`](doc/architecture-v0.4-zh.md).

## Development

Requires Node 22.12+, pnpm 10, the Supabase CLI, and Docker — for the local
Supabase stack, for the conductor's container tests, and for the agent plane in
`infra/compose.local.yml`. Where the build currently stands, and what is left, is
[`STATUS.md`](STATUS.md); the plan it tracks against is
[`doc/platform-and-dev-plan-v2-en.md`](doc/platform-and-dev-plan-v2-en.md) Part III.
[`doc/archive/EXECUTION-PLAN-week1-2.md`](doc/archive/EXECUTION-PLAN-week1-2.md) is the finished weeks 1–2 plan,
kept for its file tree, config layout, and migration decisions.

Before changing code, read [`AGENTS.md`](AGENTS.md) — one page, binding, and it
states the bar every commit has to clear. [`CODEBASE.md`](CODEBASE.md) is the
orientation document for the code itself: what happens between a visa request
and a finished pack, what every file in the repository is for, what to check
locally, and what to build next.

```bash
pnpm install                # install the workspace
pnpm dev                    # run apps/web (stub mode, no config needed) and apps/conductor
pnpm lint typecheck test    # the checks every commit must pass
pnpm --filter web build     # build; also runs the i18n catalogue gate
```

The database and the auth stack run locally:

```bash
pnpm db:start               # boots Postgres, Auth, Studio, and Mailpit in Docker
pnpm db:reset               # re-applies every migration from scratch
pnpm db:test                # pgTAP tests: row-level security behaves as specified
```

`pnpm db:start` prints the local API URL and keys; put them in
`apps/web/.env.local` (never committed — see `apps/web/.env.example` for the key
names). The conductor is configured separately: see `apps/conductor/.env.example`,
where `HERMES_JOB_COMMAND` is the switch between the real container executor and
the fake one. Sign-in emails are captured by Mailpit at <http://127.0.0.1:54324>,
so local logins need no mail provider. End-to-end tests run against that stack
with `pnpm --filter web e2e`.

Nothing loads the conductor's env file for it, so `pnpm dev` starts the web app
and the conductor exits immediately unless `DATABASE_URL` is exported in the
shell (`pnpm db:status` prints it).

Ten of the conductor's thirty tests run real containers; the other twenty are
lease and run-loop races against the local Postgres. The container ten bring the
egress topology up from `infra/compose.local.yml`, and five of them need the
`visa-master-hermes` image built from the `visa-master` repo — without it they
return early and pass without having tested the container path.

## Conventions

- **Code lands on `main`** (via feature branches). The `design` branch carried
  the design phase and is merged; long-lived topic branches are the exception,
  not the rule.
- Documents are **English-primary**, with `-zh` Chinese translations kept 1:1 in
  structure — same headings, tables, and code blocks, with SQL and JSON
  byte-identical apart from translated comments. If you change an English
  document that has a `-zh` twin, update the twin too, or say plainly that you
  did not. (This convention is for documents; code and its comments are
  English-only, and user-facing strings live in the i18n catalogue.)
- Architecture versions are **additive**. v0.4 supersedes the *framing* of the
  earlier versions but does not delete them; v0.3 remains authoritative for the
  agent security model, which is why it sits in `doc/` and not in the archive.
  The development plan works the same way: v2 is active, v1 is kept with a
  status line pointing at its successor.
- **Superseded is a location, not only a status line.** A replaced document
  moves to `doc/archive/`, with a row in that folder's README naming what
  replaced it. What stays in `doc/` is what is still in force, so the shape of
  the folder answers "is this current?" before anything is opened.
- ADRs are **amended by new ADRs**, never edited in place. ADR-003 amending
  ADR-002 is the worked example.

## The `.html` files are generated — do not hand-edit them

The four readers in `doc/` — architecture v0.4 and the v2 plan, each in English
and Chinese — are built from the matching `.md` files by
[`scripts/doc-reader/`](scripts/doc-reader/build.mjs), with their mermaid diagrams
pre-rendered to inline SVG so the pages need no network access at all:

```
pnpm doc:toc    # rewrite the <!-- toc --> block in each .md
pnpm doc:html   # rebuild the four .html readers
```

`doc:html` renders the diagrams through a headless Chrome it finds on the machine
(set `CHROME_PATH` if it is somewhere unusual). Both commands are idempotent;
`pnpm doc:toc --check` fails when a table of contents is stale, which is the form
to wire into CI.

Edit the `.md` and rerun the build. Editing the HTML directly appears to work and
is silently discarded by the next rebuild — this has already happened once. The
same goes for the `<!-- toc -->` block inside the `.md`: it is generated, and the
reader replaces it with its own contents panel — same headings, but anchored to
the ids the HTML actually uses, which are not GitHub's. The reader therefore
carries the table of contents twice: once in the sidebar, which is navigation and
hides behind a button on a narrow screen, and once in the document at the top,
which is the shape of the thing and is what prints.

`doc/archive/platform-and-dev-plan-en.html` predates this pipeline and is left as
it was: it is an archived rendering of an archived document, and regenerating it
would only make an out-of-force plan look freshly maintained.

(The exported design system under `design/system/` and the prototypes under
`design/prototypes/` are also generated artifacts — theirs is Claude Design, and
the same rule applies: iterate there and re-export, don't hand-edit the export.)
