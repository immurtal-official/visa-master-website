# ADR-004 — API-first control plane: the web UI is one client of `/api/v1`

**Status:** Accepted, 2026-08-12
**Amends:** [platform-and-dev-plan-en.md](../doc/archive/platform-and-dev-plan-en.md) §B.4 row 1 and Part III §1 — superseded by [platform-and-dev-plan-v2-en.md](../doc/platform-and-dev-plan-v2-en.md)
**Does not amend:** [architecture-v0.4-en.md](../doc/architecture-v0.4-en.md) — see "What this does not change"

## Decision

Every core business capability of the control plane is exposed as a stable HTTP API under
`/api/v1/**`, served by Next.js route handlers that are thin adapters over a service layer.
The web UI is **one client of that API** — it holds no private channel to the database or to
business logic that the API does not offer every other client.

Concretely, the rules (binding on all future control-plane work):

1. All core business capabilities have a stable HTTP API.
2. All core business APIs live under `/api/v1/**`.
3. The web is a client of the API; it gets no bypass channel for core business operations.
4. Server Actions do not carry core business operations. (There are now zero in the codebase.)
5. Server Components may render, but do not touch the database or core services directly;
   they fetch core business data through the API.
6. Client Components call `/api/v1/**`.
7. Route handlers are HTTP adapters only: parse the request, call one service, map the result.
8. Business logic lives in the service layer (`apps/web/src/lib/services/`).
9. Database access is confined to the service/data layer; no UI component reaches the database.
10. Web, mobile app, and WeChat Mini Program share one API contract.

## Context

The question examined was whether to split the control plane into a Next.js frontend plus a
separate backend service (FastAPI-class). The analysis (two steelman passes, an agent-tier
analysis, a migration-cost count, and a verification of current WeChat Mini Program platform
rules) concluded:

- A second client (mini program, mobile app) forces **an HTTP API surface with header-token
  auth and a stable contract** — not a separate service, language, or deployment. Next.js
  route handlers satisfy every technical requirement either client has.
- The genuine blocker hiding inside "WeChat Mini Program" is China infrastructure, not the
  framework: mini-program request domains must be HTTPS **and ICP-filed**, ICP filing needs a
  CN entity with mainland hosting, and `supabase.co` can never be such a domain — so a mini
  program forces all traffic through our own filed domain regardless of backend framework.
  This is the same CN-entity prerequisite that already gates WeChat Pay and +86 SMS.
- An immediate service split would cost 22–30 solo days against an eight-week beta, would
  fork `packages/core` across a language boundary (the rules this product exists to keep
  consistent), and would duplicate the authorization layer that today lives in RLS + column
  grants with 49 pgTAP assertions behind it.
- v0.2 had named FastAPI for the backend; v0.4 superseded that with Node/TypeScript and
  deliberately fixed the language, not the framework or the deployment unit.

API-first-inside-Next.js takes the part of the split that the second client actually forces
(the contract) now, and leaves the part it does not force (a second service) until a trigger
fires.

## What the wire contract carries

Failures are catalogue keys, never sentences — the same message-key discipline validation has
had since the first schema, extended to the whole API:

```
422  { issues: [{ path, key, params? }] }     rule failures, from packages/core
4xx/5xx  { error: { key, ...detail } }        everything else a screen can be told
2xx  endpoint-specific JSON, or 204
```

Each client resolves keys against its own active locale. A mini program (JavaScript) can
additionally import `packages/core` directly for instant client-side validation — one more
reason the shared-rules package stays TypeScript.

## What this does not change

- **architecture-v0.4 stands unmodified.** Its trusted backend was specified as Node/TS with
  a responsibility list, deployment-shape-neutral; this ADR realizes its `authorize()`
  chokepoint as `lib/services/auth-service.requireUser()`, which every service call passes
  through. RLS remains in force underneath as the second line — exactly the document's
  stated posture.
- **The conductor and the agent plane are untouched.** The DB-as-interface, outbound-only
  pattern between planes is a separate settled decision (B.0), and the conductor is not a
  client of `/api/v1`.
- **Bytes still bypass the API.** Uploads announce through the API (row + destination path),
  then stream directly to storage under the owner's token and prefix, then confirm through
  the API — v0.4 B §3's signed-path pattern, unchanged.

## Consequences

- `apps/web` gains `src/lib/services/` (seven modules) and `src/app/api/v1/**` (fourteen
  route handlers averaging ~11 lines). Pages fetch through the API; forms call it from the
  client. Cost accepted: one loopback HTTP hop per server-rendered read.
- The service layer is now the **extraction seam**: if a separate backend service is ever
  warranted, it re-homes `lib/services/` behind the same `/api/v1` paths, and no client
  changes. The recorded triggers for that: a Python-only requirement in the request path, a
  Python collaborator, or the first executor leaving the VM activating Chapter C §1's
  private-network HTTP surface.
- A mini program or mobile app starts from a working contract; what it waits on is the CN
  entity (ICP domain), not this codebase.
