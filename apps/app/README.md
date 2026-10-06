# apps/app — the mobile app

The iOS and Android client, in React Native with Expo. **Not started**: this
directory holds only this file, so pnpm does not yet see it as a workspace (a
workspace needs a `package.json`).

## What it is, and what it is not

It is a **client of `/api/v1`**, exactly as `apps/web` is. ADR-004 and
[AGENTS.md](../../AGENTS.md) §6 already bind this: web, mobile app and WeChat Mini
Program share one HTTP contract, and none of them is a privileged insider. So
the app holds no business logic, talks to no database, and never imports from
`apps/web`. What it may import is `packages/core` — the zod schemas, the route
gate and the message keys — because that is the code both sides of the wire are
meant to share, and it is plain TypeScript with no build step.

It is **not** a replacement for the mobile web. The device-parity directive
([mobile-parity-en.md](../../design/guidelines/mobile-parity-en.md)) still
requires the full product to work in a phone browser, because most of the
traffic arrives through in-app browsers that will never install anything. The
app is a second way in, not the only good one.

## Rules it inherits

- **Catalogue keys, never sentences.** Rule failures arrive as
  `422 {issues:[{path,key,params?}]}` and everything else as `{error:{key}}`.
  The app resolves keys against its own locale catalogue, the same way the web
  does; no screen carries a hardcoded string or its own copy of a rule.
- **Both locales ship together** — `zh-CN` (default) and `en`.
- **The design system is the source of tokens.** Take them from
  `design/system/`, not by copying values out of `apps/web`.

## Before the first screen: native sign-in

The backend already authenticates the way a native client needs. `apps/api`
accepts only `Authorization: Bearer <Supabase access token>` — cookies are not
credentials there (`apps/api/app/deps.py`) — and `POST /api/v1/auth/verify`
returns the session's `access_token` and `refresh_token` in its body for the
client to keep. Row-level security still does the ownership checks: the backend
runs each request as `authenticated` with the caller's claims
(`apps/api/app/db.py`). What the app has to add is keeping those tokens in
secure storage and refreshing the access token before it expires; there is no
refresh endpoint under `/api/v1` yet, so that is either Supabase's own refresh
call or a new endpoint in `apps/api`, with tests.

## Starting it

Roughly, when the time comes:

1. Scaffold an Expo Router project in this directory and name the package
   `@visa-master/app`. Follow Expo's monorepo guide for pnpm; depending on the
   SDK version, Metro may need the workspace root in its watch folders.
2. Add `@visa-master/core` as a `workspace:*` dependency.
3. Add `dev`, `typecheck`, `lint` and `test` scripts, so `pnpm lint typecheck
   test` at the root — the checks every commit must pass — covers the app too.
4. Point it at a local `apps/api` (`pnpm dev`; `http://127.0.0.1:8000`) for the API,
   calling it directly with the Bearer token rather than through the web's forwarder.

The layout follows `nihao-pet/platform` (`apps/app` is Expo, alongside
`apps/website` and `apps/api`), so conventions proven there — Expo Router,
EAS builds, a shared design-tokens package — can be borrowed rather than
reinvented.
