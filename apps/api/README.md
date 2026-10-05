# apps/api — where the backend goes if it leaves Next.js

**Empty on purpose.** The backend is not here today, and moving it here is not
planned work. This directory exists so the layout says where it would go, and
so nobody mistakes its absence for an oversight.

## Where the backend is now

| Layer | Path | Runs on |
|---|---|---|
| HTTP handlers for `/api/v1/**` | `apps/web/src/app/api/v1/` | Vercel, with the web app |
| Business logic — the service layer | `apps/web/src/lib/services/` | the same deployment |
| Rules, schemas, message keys | `packages/core` | imported by both |
| Postgres, auth, storage, row-level security | `packages/db` → Supabase | Supabase |
| The agent plane: claiming jobs, running containers | `apps/conductor` + `infra/` | the VM, once it exists |

That is [ADR-004](../../discussion/ADR-004-api-first-control-plane.md): Next.js
is the front end *and* the request/response backend, under a hard API-first
discipline. Route handlers are thin adapters that call one service each, the web
UI reaches data only through `/api/v1`, and there are no Server Actions. One
deployment is cheaper to run and simpler to reason about, and nothing in the
current load asks for two.

## What would move it

The discipline exists so that extraction is a re-homing, not a rewrite: move
`lib/services/` here behind the same paths and the same wire format, and every
client — web, `apps/app`, a future mini program — keeps working unchanged.

A second client is **not** by itself a reason. The mobile app consumes the
contract as it stands. A reason would be something the Vercel runtime cannot
do: a request that outgrows the function time limit, a dependency that needs a
long-lived process, or a hosting requirement — such as serving the API from
mainland China — that Vercel cannot meet. When one of those is real, it gets an
ADR amending ADR-004 first, and this README is replaced by the service.
