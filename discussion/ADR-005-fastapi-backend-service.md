# ADR-005 — The backend becomes its own service: FastAPI in `apps/api`

**Status:** Accepted, 2026-10-05
**Amends:** [ADR-004](ADR-004-api-first-control-plane.md) — rules 7–9 and the "extraction seam"
consequence; everything else in ADR-004 stands
**Does not amend:** [architecture-v0.4-en.md](../doc/architecture-v0.4-en.md) (the agent plane,
the conductor, DB-as-interface between planes)

> 中文版：[ADR-005（中文）](ADR-005-fastapi-backend-service-zh.md)

## Decision

The request/response backend moves out of the Next.js app into a separate service, written in
**Python (FastAPI)**, in **`apps/api`**, deployed on its own. The repository stays one monorepo
with separately deployed applications:

```
apps/web/        the web front end (Next.js) — pages, components, its own session cookies
apps/app/        the mobile app (placeholder)
apps/api/        the backend (FastAPI, Python 3.12) — every /api/v1/** endpoint
apps/conductor/  the agent plane's workflow engine (unchanged)
packages/core/   the rules — the one source, read by every application
packages/db/     migrations, grants, pgTAP (unchanged)
```

The `/api/v1` contract does not change: the same paths, the same request bodies, the same
responses, and the same failure shape — `422 {issues:[{path,key,params?}]}` for rule failures,
`{error:{key,…}}` for everything else. No client is rewritten to accommodate the move; the
existing headless contract suite (`apps/web/e2e/api-contract.spec.ts`) is the acceptance test
for every endpoint that moves.

## Context

ADR-004 examined this split in August and deferred it: a second client forces a contract, not
a second service, and the contract was built inside Next.js with the service layer as the seam
for a later extraction. Its recorded triggers — a Python-only requirement in the request path,
a Python collaborator, an executor leaving the VM — have not fired.

The decision is taken anyway, on grounds ADR-004 did not weigh as triggers, and they are
recorded as what they are:

- **Clarity of ownership.** With the backend inside `apps/web`, front-end and back-end code are
  both TypeScript in one source tree, distinguished by file-level directives (`"use client"`,
  `server-only`) rather than by where they live. The founder wants the boundary visible in the
  directory structure: front end in one application, back end in another, talking only over
  HTTP.
- **One house pattern.** The founder's other product ([nihao-pet/platform](https://github.com/nihao-pet/platform))
  already runs this shape — Next.js and Expo clients, a FastAPI service on its own deployment,
  Bearer tokens, a committed OpenAPI contract — and has it in production. Running both products
  the same way is worth something on its own.
- **Independent deployment and scaling** of the request/response tier, and a Python home for
  request-path work that the Python ecosystem does better (document processing, data work)
  when it arrives.

What the split does **not** buy, stated so it is not later claimed: it is not where this
product's load is. The heavy work — minutes-long pack runs, model calls, containers — is the
agent plane, which was already separate. The request/response tier reads and writes forms.

## The cost, and how each part is paid

**1. The rules cross a language boundary.** Every rule the product exists to keep consistent
lives in `packages/core` as TypeScript: the questionnaire and its validation, the intake
contract and its checksum, the checklist and its conditions, what extraction may propose. The
web reads them for instant feedback, the conductor for its write-back, and the backend for
every decision that counts. A Python backend cannot import them. Two copies that drift are
exactly the failure this product is built to prevent.

Paid like this — **`packages/core` stays the only place a rule is written**:

- The *data* part of the rules — sections, questions, kinds, options, branching conditions,
  which named rule each question uses, the checklist, the route gate's tables, the message-key
  registry, the contract version and checksum — is **exported from `packages/core` as JSON**,
  committed, and read by the Python service. Editing `questionnaire.ts` is still the only edit
  the partner makes; `pnpm check:intake` regenerates the export.
- The *logic* part — the dozen named rules in `rules.ts` (a passport number, a date in the past,
  a passport that outlives the trip) and the evaluators (conditions, which questions are asked,
  what a reading may propose) — is implemented once more in Python, in `apps/api/app/rules/`.
  It changes rarely and only by an engineer; a partner cannot add a named rule.
- **Conformance vectors** make the second implementation provably the same: `packages/core`
  generates thousands of input → output cases from the TypeScript (the technique that verified
  stage 3: 2,970 parse results), at a fixed clock, committed as JSON. The Python suite must
  reproduce every one. A rule changed on one side and not the other fails CI on the first
  vector that disagrees. A named rule with no Python implementation fails with that name.

**2. Authentication changes transport.** Today the session is a Supabase cookie read by the
same process that serves the API. The API service accepts **Bearer tokens only** — Supabase
access tokens, verified against the project's JWKS — as Nihao's ADR-0003 does, because a
native app has no cookie jar to share and two credential paths are two places to be wrong.
The web keeps its cookie session as a *client-side* concern: its server forwards each `/api/v1`
call to the API with `Authorization: Bearer <access token>` taken from that session (a thin
forwarding layer with no business logic), and sign-in stores the tokens the API returns into
the same cookies. The mobile app holds its tokens itself and calls the API directly.

**3. The authorization posture must survive the move.** Today every user-scoped query runs as
the user, so row-level security and the column grants — the second line, verified on staging on
2026-10-05 — apply underneath the service's own checks. The API keeps that: it connects to
Postgres directly (asyncpg), and every user-scoped request runs in a transaction that first
does `set local role authenticated` and sets `request.jwt.claims` from the verified token —
what PostgREST does. A query the service gets wrong is still refused by the database. Paths
that act on the product's authority (enqueueing a job, recording `stored`) use the service
role explicitly, as they do today with the admin client.

**4. Two deployments.** `apps/api` is its own Vercel project (Python runtime, as Nihao's
`nihao-api`) on its own domain; `apps/web` points at it. Locally, `pnpm dev` starts both.

## How it is migrated

Strangler, one endpoint at a time, each step independently revertible:

1. `apps/api` skeleton: configuration, JWKS verification, the user-scoped database session,
   the wire-format error handlers, `/api/v1/health`, the OpenAPI export.
2. The rules export, the Python rules, and the conformance vectors.
3. The web gains its forwarding layer. An endpoint moves by implementing it in `apps/api`,
   proving it with the contract suite, and deleting its Next.js route handler — the forwarder
   then serves that path. `apps/web/src/lib/services/` shrinks to nothing and is removed.
4. `AGENTS.md`, `CODEBASE.md` and `STATUS.md` follow the code.

## What stays as it is

- ADR-004's rules 1–6 and 10: every capability behind `/api/v1/**`, no Server Actions, pages
  fetch through the API, the wire carries catalogue keys, one contract for every client.
- Rules 7–9 re-home: route handlers are thin adapters **in `apps/api/app/routers/`**, business
  logic lives **in `apps/api/app/services/`**, and database access is confined to the API.
- The conductor, the job contract, the egress boundary, DB-as-interface between planes.
- Bytes still bypass the API: uploads announce through it, stream to storage under the owner's
  token, and confirm through it.
- Migrations stay in `packages/db` (Supabase CLI), not in `apps/api`.

## Rolling back

Until the last Next.js route handler is deleted, any endpoint can return to Next.js by
restoring its handler. After that, the service layer exists in git history and the contract
suite still describes the behaviour exactly, so a reversal is a port back, not a redesign.
