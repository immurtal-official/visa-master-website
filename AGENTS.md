# Binding constraints for work in this repository

These are the rules most likely to be broken by accident. Each links to its
full decision record; none of them is open for quiet re-litigation — amend the
record first (ADRs are amended by new ADRs, never edited in place).

## API-first (ADR-004 — [discussion/ADR-004-api-first-control-plane.md](discussion/ADR-004-api-first-control-plane.md))

The web UI is **one client** of `/api/v1/**`. Concretely:

1. Every core business capability has a stable HTTP API under `/api/v1/**`.
2. **No Server Actions for core business operations.** There are zero in the
   codebase; do not add the first one.
3. Server Components never touch the database or a service directly — they
   fetch through the API (`lib/api/server.ts`). Client Components call
   `/api/v1/**` (`lib/api/client.ts`).
4. Route handlers are thin HTTP adapters: parse, call **one** service, map the
   result. Business logic lives in `apps/web/src/lib/services/`.
5. The wire protocol carries **catalogue keys, never sentences**:
   `422 {issues:[{path,key,params?}]}` for rule failures, `{error:{key}}` for
   everything else. Each client resolves keys against its own locale.
6. Web, mobile app, and WeChat Mini Program share this one contract. A future
   backend extraction re-homes `lib/services/` behind the same paths.

## Validation and i18n ([design/guidelines/internationalization-en.md](design/guidelines/internationalization-en.md) §3, §8)

- Rules live in `packages/core` and emit **message key + params**
  (`validation.passport.expiry.tooSoon` + `{monthsRequired: 3}`), never a
  sentence. No component carries its own copy of a rule.
- Both locales ship in the same commit as any copy. Two build gates enforce
  this (`scripts/check-i18n.mjs` + the lint rule, both wired into `build`);
  do not weaken or bypass them.
- Nothing containing user-facing text takes a fixed width; no sentence is
  assembled from fragments; layouts survive +100% expansion over the Chinese
  string.

## Design ([.claude/skills/visa-master-design](.claude/skills/visa-master-design))

- Invoke the `visa-master-design` skill before building any UI. Tokens via
  `var()` only — no raw hex, no new fonts, no tooltips, no toasts, no emoji.
- The prototype under `design/prototypes/` is a specification to read, never a
  source to copy. Its data and validation are staged.

## The agent plane ([doc/architecture-v0.4-en.md](doc/architecture-v0.4-en.md), v0.3 for isolation)

- A job's `input` is sanitized: **no user id, no email, no token inside the
  payload** — it carries the work, never the account.
- The job container holds no credentials of any kind and runs on the
  no-default-route network; its only egress is the audited proxy. The
  conductor uploads artifacts, not the container.
- `uploads.status = 'stored'` and job enqueueing are server-authority writes;
  clients cannot perform them, by grant. Keep it that way in any migration.
- No LLM decides business rules. The conductor is deterministic code; agent
  loops belong inside executors only.

## Verification

The bar before any commit: `pnpm turbo lint typecheck test`, `pnpm --filter
web build`, `pnpm db:test`, and the Playwright suite (`pnpm --filter web
e2e`, needs Docker + `pnpm db:start`). Failures are fixed, not skipped;
tests scope their cleanup to their own data.
