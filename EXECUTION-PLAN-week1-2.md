# Week 1–2 Execution Plan — feat/week1-foundations

**Status:** confirmed by the founder 2026-08-10, with three amendments folded in below:
(a) an automated test layer so the implementing session can verify its own work (§4.5, §7.7,
§8.6, commit 13); (b) **local-first** — hosted Vercel/Supabase setup and any paid plans are
deferred until all tests pass *and* the founder has manually verified the local build (§12.3);
(c) this plan file is committed as commit 0. Prerequisites already done by the founder
2026-08-10: `git config user.name/user.email` set; Supabase CLI installed via Homebrew.
Execute the commit sequence in §11 exactly, in order, in commits small enough to review.
**Never push** (pushing is a founder-triggered action, §12.3).

**Written for:** the implementing session. Everything needed is either in this file, in the
referenced repo documents, or in the `visa-master-website-week1:visa-master-design` skill —
invoke that skill before building any UI.

---

## 0. Ground rules (binding, from the founder and repo)

1. **All writes go in `~/Developer/startup/git/visa-master-website-week1`** (worktree of
   `visa-master-website`, branch `feat/week1-foundations`). Never edit `visa-master-website`,
   `visa-master`, or `immurtal-official.github.io`. Read them if useful.
2. **Commits:** imperative subject, body explains problem + reasoning, written as the repo's
   author writes them. **No tool or generator attribution of any kind** — no `Co-Authored-By`
   trailers, no "generated with" lines — in commits, PR text, comments, or changelogs. This is
   the founder's standing rule and it overrides any harness default.
3. **Git identity is currently unset** (falls back to `dayuantan@DaYuanTans-MacBook-Pro.local`).
   The founder must provide `git config user.name` / `user.email` values **before the first
   commit** (§12.1). Do not invent them.
4. **No invented credentials, no placeholder secrets committed.** `.env.example` carries key
   *names* only. Real values go in `apps/web/.env.local` (gitignored). The app must build and
   run with no Supabase env at all (stub mode, §8.5).
5. **Prototype (`design/prototypes/v1-journey/`) is a spec, never a source.** Its data,
   validation, QR, session are all staged. Its README and `design/README.md` say so verbatim.
   Read screens for intent; write the real thing against real schemas.
6. **The two expensive-later constraints** (founder, verbatim intent):
   - Validation in `packages/core` emits **message key + params** (`passport.expiry.tooSoon`,
     `{monthsRequired: 3}`), never a sentence. Front end resolves the key against the active
     locale. No component carries its own copy of a validation rule.
   - Nothing containing user-facing text takes a fixed width; no sentence is assembled from
     fragments. Components must survive **+100% expansion** over the Chinese string.
7. **Both locales ship together, every commit that adds copy.** A key present in one catalogue
   and missing from the other fails the build; a hardcoded user-facing string fails the build
   (§5.3, §5.4 — both gates are wired into `build`, not just lint/CI).

---

## 1. Decisions and versions (with rationale)

Facts below were verified 2026-08-10 against the local machine, the npm registry, and
supabase.com/docs (citations live in the planning conversation, deliberately not in this file).

| Decision | Choice | Rationale / risk |
|---|---|---|
| Node | local v22.23.2 → `engines: { node: ">=22.12" }`, `@types/node@^22` | Match the installed runtime, not npm-latest @types (26.x targets Node 26). |
| Package manager | pnpm 10.34.5 (Homebrew), `packageManager: "pnpm@10.34.5"` | corepack is absent; the field still documents intent and pnpm 10 honors it. Add `pnpm.onlyBuiltDependencies: ["esbuild", "@tailwindcss/oxide", "sharp"]` to root package.json (pnpm 10 blocks postinstall by default). |
| Monorepo | Turborepo `turbo@^2.10` | Plan-mandated. Tasks in §3.3. |
| Next.js | `next@16.3.0` (App Router) | Established major (patch .3.x); current Supabase docs target Next 16's `proxy.ts` convention. **Verify at install** that `next-intl@^4.13` declares peer support for Next 16; if not, fall back to `next@15.5.x` (npm dist-tag `backport`) and rename `proxy.ts` → `middleware.ts` (identical code, different export name). |
| React | 19.2.x (whatever next@16.3 pins) | — |
| i18n | `next-intl@^4.13` | Guideline-mandated library; ICU MessageFormat; locale-prefixed routes. |
| TypeScript | **pin `typescript@^5.9`** (do NOT take npm-latest 7.0.2) | TS 7 is a fresh major; ecosystem/plugin support unverified. Note it as a later upgrade. |
| Zod | `zod@^4.4` | Fresh start on v4; core never reads `issue.message` (§4.2), so zod's own message/locale machinery is irrelevant by design. |
| Tailwind | `tailwindcss@^4.3` (+ `@tailwindcss/postcss`) | CSS-first config; consumes the design-token CSS custom properties directly (§6.1). No `tailwind.config.js` needed. |
| Radix / shadcn | **none in Week 1** | Week-1 components (Button, Input, Callout, Card, ErrorSummary, header/footer, LanguageSwitcher) need no primitive. Radix arrives in Week 2 (Sheet, RadioGroup). shadcn/ui remains the delivery mechanism when a matching component exists; several DS components have no shadcn equivalent and are ported from the skill's reference JSX. |
| ESLint | flat config; `eslint-config-next` at the version matching next; `eslint-plugin-i18next@^6` for `no-literal-string` | Resolve the exact eslint major at install time (`eslint-config-next@16.x` decides 9 vs 10). Intent, not version, is binding. Lint is build-blocking (§3.3). |
| Tests | Three layers, all runnable by the implementer without founder help: `vitest@^4` unit tests in `packages/core` (§4.5); **pgTAP RLS tests** via `supabase test db` in `packages/db` (§7.7); **Playwright end-to-end** in `apps/web` covering the full OTP loop + i18n routing against the local stack (§8.6) | The e2e + pgTAP layers need Docker running; everything else is env-free. Component-level React tests are deliberately skipped — Playwright exercises the rendered components in both locales. |
| Auth | Supabase Auth email OTP via `@supabase/ssr@^0.12` + `@supabase/supabase-js@^2.112` | v0.4 Chapter B §4 platform carve-out. supabase-js v3 exists only as `next` pre-release — do not use. |
| Supabase keys | **New scheme**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_*`), server-only `SUPABASE_SECRET_KEY` (`sb_secret_*`) | Current docs for new projects; legacy anon/service_role JWT keys deprecated end of 2026. `supabase start` emits new-style keys locally too. |
| Local dev DB | Supabase CLI (`brew install supabase/tap/supabase`) + Docker Desktop (`supabase start`) | CLI is not installed yet — the implementer runs the brew install (no credentials involved) **before commit 8**, since `supabase init` authors `config.toml`. Docker is needed only to *run* the stack (verification), not to author migrations — §12.2. |
| Migrations | `packages/db/supabase/migrations/0001_… 0002_… 0003_….sql` | Founder-mandated names. CLI accepts any `^[0-9]+_name\.sql`; numeric prefixes sort before timestamps, so later timestamped migrations order correctly. **From Week 2 on, use `supabase migration new` timestamps** (hosted branching/squash assume them); the plan doc's "0004/0005" labels are descriptive, not filenames (§14.1). Never rename an applied migration. |
| Session pattern | `@supabase/ssr` `createBrowserClient`/`createServerClient` + `proxy.ts` calling `updateSession()`; protect with `supabase.auth.getClaims()` | Canonical Aug-2026 pattern per Supabase docs. Never trust `getSession()` server-side. |
| Fonts | copy skill's `public-sans-latin-{400,500,600,700}.woff2` + `@font-face` (unicode-range Latin) into the app | "Public Sans VM" is the only webfont allowed; CJK is always the system stack; no third-party origins ever. |

---

## 2. File tree (Week 1 — everything to be created)

Existing files (`PRODUCT.md`, `README.md`, `doc/`, `design/`, `discussion/`, `.claude/`) are
untouched except: `README.md` gains a short "Development" section (commit 1), and the
**existing** root `.gitignore` is extended (commit 1 adds build outputs; commit 8 adds
`packages/db/supabase/.temp/` etc.).

```
visa-master-website-week1/
├─ package.json                          # root: private, packageManager, turbo scripts, pnpm config
├─ pnpm-workspace.yaml                   # apps/*, packages/*
├─ turbo.json                            # build/dev/lint/typecheck/test/check:i18n
├─ tsconfig.base.json                    # strict shared compiler options
├─ .gitignore                            # EXTEND the existing file, do not replace
├─ .prettierrc.json  .prettierignore
├─ scripts/
│  └─ check-i18n.mjs                     # catalogue parity + ICU validity + core-key coverage + CJK sweep (§5.3)
├─ apps/
│  ├─ web/
│  │  ├─ package.json                    # build script CHAINS the gate: "check:i18n && next build" (§3.3)
│  │  ├─ next.config.ts                  # createNextIntlPlugin (added in commit 5, not 4), transpilePackages
│  │  ├─ postcss.config.mjs              # @tailwindcss/postcss
│  │  ├─ tsconfig.json
│  │  ├─ eslint.config.mjs               # next presets + i18next/no-literal-string (§5.4)
│  │  ├─ .env.example                    # key NAMES only (§12.2)
│  │  ├─ proxy.ts                        # Next 16 middleware: next-intl routing ∘ supabase updateSession (§8.3)
│  │  ├─ messages/
│  │  │  ├─ zh-CN.json                   # source language
│  │  │  └─ en.json                      # authored peer, never machine filler
│  │  ├─ public/
│  │  │  ├─ fonts/public-sans-latin-{400,500,600,700}.woff2   # copied from design skill
│  │  │  └─ icons/*.svg                  # only the icons Week 1 uses, copied from skill assets
│  │  └─ src/
│  │     ├─ global.d.ts                  # IntlMessages typed from zh-CN.json (typo'd key = TS error)
│  │     ├─ app/
│  │     │  ├─ [locale]/
│  │     │  │  ├─ layout.tsx             # validates locale ∈ LOCALES else notFound(); <html lang={locale}>; provider; chrome
│  │     │  │  ├─ page.tsx               # minimal landing: wordmark, one-line intro, login CTA
│  │     │  │  ├─ login/
│  │     │  │  │  ├─ page.tsx            # email step + code step (one component, two states)
│  │     │  │  │  └─ actions.ts          # requestOtp / verifyOtp / signOut server actions (§8.2)
│  │     │  │  ├─ dashboard/
│  │     │  │  │  └─ page.tsx            # protected; queries profiles under RLS; empty state
│  │     │  │  ├─ [...rest]/page.tsx     # catch-all → notFound() (unknown paths under a valid locale)
│  │     │  │  ├─ not-found.tsx          # localized 404 (errors.notFound.*)
│  │     │  │  └─ error.tsx              # localized error boundary (errors.unexpected.*)
│  │     │  ├─ layout.tsx                # root passthrough (locale layout owns <html>); unknown locales are
│  │     │  │                            #   redirected by the next-intl middleware before rendering
│  │     │  └─ globals.css               # tailwind + token imports (§6.1)
│  │     ├─ i18n/
│  │     │  ├─ routing.ts                # defineRouting: locales from @visa-master/core, prefixes {'zh-CN':'/zh'}
│  │     │  ├─ navigation.ts             # createNavigation(routing)
│  │     │  └─ request.ts                # getRequestConfig → messages/<locale>.json
│  │     ├─ lib/
│  │     │  └─ supabase/
│  │     │     ├─ client.ts              # createBrowserClient
│  │     │     ├─ server.ts              # createServerClient (per-request, cookies())
│  │     │     ├─ proxy.ts               # updateSession(request) — getClaims + redirect rules
│  │     │     ├─ admin.ts               # secret-key client, server-only (unused until Week 2; import guarded)
│  │     │     └─ config.ts              # isSupabaseConfigured() (§8.5)
│  │     ├─ components/
│  │     │  ├─ ui/                       # ported from design-skill reference JSX (§6.2)
│  │     │  │  ├─ button.tsx  input.tsx  callout.tsx  card.tsx  icon.tsx
│  │     │  │  └─ error-summary.tsx
│  │     │  └─ chrome/
│  │     │     ├─ site-header.tsx        # wordmark + LanguageSwitcher + signout when authed
│  │     │     ├─ site-footer.tsx        # navy footer: disclaimer note + switcher + ICP slot
│  │     │     └─ language-switcher.tsx  # self-named languages + permanent pack-language note
│  │     └─ styles/
│  │        └─ tokens/                   # copied from skill: fonts.css colors.css typography.css
│  │                                     #   spacing.css radius.css elevation.css motion.css layout.css base.css
│  ├─ conductor/                         # placeholder (Week 3 builds it)
│  │  ├─ package.json                    # @visa-master/conductor, private
│  │  ├─ tsconfig.json
│  │  └─ src/index.ts                    # main() logs "conductor: not implemented until week 3"; exit 0
├─ packages/
│  ├─ core/
│  │  ├─ package.json                    # @visa-master/core, source exports (JIT package)
│  │  ├─ tsconfig.json
│  │  ├─ vitest.config.ts                # defaults; node environment; include src/**/*.test.ts
│  │  ├─ src/
│  │  │  ├─ index.ts
│  │  │  ├─ i18n/
│  │  │  │  ├─ locales.ts               # SINGLE SOURCE: LOCALES=['zh-CN','en'], DEFAULT_LOCALE, selfName()
│  │  │  │  └─ message-keys.ts          # registry of every validation key + its param names (§4.3)
│  │  │  ├─ validation/
│  │  │  │  ├─ issue.ts                 # ValidationIssue {key,params}; toIssues(zodError) (§4.2)
│  │  │  │  └─ issue.test.ts
│  │  │  └─ schemas/
│  │  │     ├─ auth.ts                  # emailSchema, otpCodeSchema
│  │  │     └─ auth.test.ts
│  ├─ db/
│  │  ├─ package.json                    # scripts proxying supabase CLI (db:start/stop/reset/status)
│  │  ├─ README.md                       # local workflow, hosted setup steps, role-flip SQL snippet
│  │  └─ supabase/
│  │     ├─ config.toml                  # supabase init output + [auth.email] OTP deltas (§7.4)
│  │     ├─ templates/otp.html           # bilingual OTP email carrying {{ .Token }} (§7.5)
│  │     └─ migrations/
│  │        ├─ 0001_profiles.sql
│  │        ├─ 0002_jobs.sql
│  │        └─ 0003_usage_events.sql
│  └─ executors/                         # placeholder (Week 3+)
│     ├─ package.json                    # @visa-master/executors
│     ├─ tsconfig.json
│     └─ src/contract.ts                 # Executor interface verbatim from platform plan Part III §1 (§10)
└─ .github/workflows/ci.yml              # OPTIONAL final commit (§11 commit 13; plan doc puts CI in week 6)
```

Not created in Week 1: `infra/` (arrives Week 3 with the VM), the marketing homepage (the
content-strategy homepage is not Week-1 scope; the landing page is a minimal shell), any
admin surface, any favicon (no brand asset exists yet — the wordmark is itself a flagged
placeholder; browser default is acceptable and honest). Staging deploys should carry
`noindex` metadata until launch — founder decision recorded at deploy time (§12.3).

"IA" throughout this file = `design/product/03_Information_Architecture.md`.

---

## 3. Root configuration (exact contents)

### 3.1 `package.json` (root)

```jsonc
{
  "name": "visa-master",
  "private": true,
  "packageManager": "pnpm@10.34.5",
  "engines": { "node": ">=22.12" },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "check:i18n": "turbo run check:i18n",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "@formatjs/icu-messageformat-parser": "^3.5.0",
    "prettier": "^3.9.0",
    "turbo": "^2.10.9",
    "tsx": "^4.19.0"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "@tailwindcss/oxide", "sharp"]
  }
}
```

`@formatjs/icu-messageformat-parser` lives at the root because `scripts/check-i18n.mjs`
resolves imports from its own location (repo root). The script imports the core key registry
**by relative path** (`../packages/core/src/i18n/message-keys.ts` — tsx handles TS), so no
workspace dependency is needed at the root.

### 3.2 `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 3.3 `turbo.json` and the gate wiring

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build", "lint"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "typecheck": { "dependsOn": ["^typecheck"] },
    "test": {},
    "check:i18n": { "cache": false }
  }
}
```

Gate wiring — two layers, so **no invoker can bypass either gate**:

- **Gate A (catalogue/CJK checks) is chained inside apps/web's own build script**:
  `"build": "pnpm run check:i18n && next build"` with
  `"check:i18n": "tsx ../../scripts/check-i18n.mjs"`. Any builder — turbo, bare
  `pnpm --filter web build`, **or Vercel** — runs the gate. This is deliberate: if the gate
  lived only in turbo's task graph, a Vercel project configured to call `next build` directly
  would deploy ungated (§12.3 still verifies Vercel's build command).
- **Gate B (ESLint `no-literal-string`) is build-blocking via `build.dependsOn: ["lint"]`** —
  the founder's requirement is a *build* check failing on hardcoded user-facing strings, and
  Latin-script literals are Gate B's job (the CJK sweep can't see them). CI (commit 13) adds
  nothing new; it just runs the same graph.
- `check:i18n` is `cache: false`: the script is fast (<1s), and its inputs span the package
  boundary (core's registry + the root script). Turborepo inputs are package-relative —
  `../../` globs are silently dead, and `$TURBO_ROOT$` microsyntax would work but caching
  buys nothing here worth the staleness risk. Commit 6's break-tests must include deleting a
  key from **core's registry** (not just the catalogue) to prove the resolution path.

### 3.4 `tsconfig.base.json`

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

`apps/web/tsconfig.json` extends this and adds Next's requirements (`jsx: "preserve"`,
`plugins: [{"name": "next"}]`, `lib` + DOM, `paths: {"@/*": ["./src/*"]}`,
`allowJs`, `incremental`). `packages/*` and `apps/conductor` extend it unchanged; every
package's `typecheck` script is `tsc --noEmit`.

Internal packages are **source-exported (JIT)**: `@visa-master/core`'s `exports` point at
`./src/*.ts`; `apps/web` lists it in `transpilePackages`; vitest and `tsx` consume TS
directly. No package build step exists in Week 1–2 (turbo `build.dependsOn ^build` is then a
no-op for them, harmless).

---

## 4. `packages/core` — validation emits keys, never sentences

### 4.1 Package shape

```jsonc
// packages/core/package.json
{
  "name": "@visa-master/core",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./locales": "./src/i18n/locales.ts",
    "./message-keys": "./src/i18n/message-keys.ts"
  },
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run" },
  "dependencies": { "zod": "^4.4.0" },
  "devDependencies": { "typescript": "^5.9.0", "vitest": "^4.1.0" }
}
```

### 4.2 The validation-issue model (the load-bearing invariant)

```ts
// src/validation/issue.ts — the shape every consumer sees
export interface ValidationIssue {
  /** dot-path of the failed field, e.g. "email", "passport.expiryDate" */
  path: string;
  /** a key from message-keys.ts — NEVER free text */
  key: MessageKey;
  /** ICU parameters for the key, e.g. { monthsRequired: 3 } */
  params?: Record<string, string | number>;
}
```

Rules (enforced by tests + review):

- **`issue.message` is never read and never shipped.** Keys derive from the zod issue's
  structured fields only: built-in codes map through one function
  (`invalid_type`+`undefined` → `validation.required`; `invalid_format`/email →
  `validation.email.invalid`; `too_small` → `validation.tooShort` + `{min}`; …). Custom
  rules use `ctx.addIssue({ code: 'custom', params: { i18n: { key, params } }, path })` via
  `superRefine`/`.check()`, and `toIssues()` reads `params.i18n`.
- `toIssues(zodError): ValidationIssue[]` is the **only** conversion point. If an issue
  reaches it without a mappable key, it maps to `validation.invalid` (generic) — and a unit
  test asserts every schema in core produces only registered keys.
- The front end resolves `key` + `params` with next-intl against the active locale. No
  component may contain validation copy or a validation rule.
- Params must be complete: the key registry (§4.3) declares each key's required param names,
  and a test cross-checks emitted issues against it.

Week-1 schemas (`src/schemas/auth.ts`):

```ts
export const emailSchema = z.object({ email: /* trimmed, email format */ });
// keys: validation.required, validation.email.invalid
export const otpCodeSchema = z.object({ code: /* exactly 6 digits, tolerate spaces */ });
// keys: validation.required, validation.otp.invalidFormat
```

Week 2 adds `schemas/intake/schengen-tourism-v1.ts` + `rules/schengen-spain.ts` on the same
model (§13.2) — this is why the model must be right now.

### 4.3 `src/i18n/message-keys.ts` — the machine-checkable registry

```ts
export const MESSAGE_KEYS = {
  "validation.required": [],
  "validation.invalid": [],
  "validation.email.invalid": [],
  "validation.otp.invalidFormat": [],
  "validation.tooShort": ["min"],
  "validation.tooLong": ["max"],
  // Week 2 adds e.g. "validation.passport.expiry.tooSoon": ["monthsRequired"], …
} as const satisfies Record<string, readonly string[]>;
export type MessageKey = keyof typeof MESSAGE_KEYS;
```

The catalogues must carry each of these keys under the same name in **both** locales;
`scripts/check-i18n.mjs` enforces it (§5.3, check 4). This is the founder's "no component
carries a copy of a validation rule" made mechanical.

### 4.4 `src/i18n/locales.ts` — the single locale source (i18n guideline §8)

```ts
export const LOCALES = ["zh-CN", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh-CN";
/** Self-names are NEVER translated (guideline §6): */
export const LOCALE_SELF_NAMES: Record<Locale, string> = { "zh-CN": "简体中文", en: "English" };
export const LOCALE_ROUTE_PREFIXES: Record<Locale, string> = { "zh-CN": "/zh", en: "/en" };
```

Routing, the switcher, `<html lang>`, and `Intl` formatting all read from here. Adding a
locale touches this file + a catalogue + a font-stack entry, nothing else.

### 4.5 Tests (Week 1)

- `auth.test.ts`: valid/invalid email and OTP inputs → exact `{path, key, params}` sets;
  asserts **no sentence strings** anywhere in output.
- `issue.test.ts`: every key emitted by every exported schema ∈ `MESSAGE_KEYS`; params match
  the registry's declared names; `toIssues` on an unmapped exotic issue falls back to
  `validation.invalid` (never throws, never leaks `issue.message`).

---

## 5. i18n skeleton and the two build gates

### 5.1 Routing (locale-prefixed, `/zh` + `/en`)

```ts
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";
import { LOCALES, DEFAULT_LOCALE, LOCALE_ROUTE_PREFIXES } from "@visa-master/core/locales";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: { mode: "always", prefixes: LOCALE_ROUTE_PREFIXES },
});
```

- URLs are `/zh/...` and `/en/...` while the locale identifiers stay BCP-47 (`zh-CN`, `en`).
  `<html lang={locale}>` then gives the zh-CN pages the design tokens' CJK defaults (CJK
  leading is the `:root` default in the skill's typography.css), and lets `lang="en"` trigger
  the skill's `[lang^="en"]` overrides — correct per-script line-height in both locales with
  no extra code.
- First visit: next-intl's `Accept-Language` detection picks the start locale; thereafter the
  URL is the truth. Locale is also a **user setting**: `profiles.locale` exists from 0001, and
  the switcher persists the choice for signed-in users (§6.3).
- All internal links/redirects use `createNavigation(routing)`'s `Link`/`redirect` — never raw
  `next/link` — so the prefix is never hand-assembled.
- Unknown locales (`/fr/...`) are redirected by the next-intl middleware; unknown paths under
  a valid locale hit `[locale]/[...rest]` → `notFound()` → the localized `not-found.tsx`.
  `[locale]/layout.tsx` validates its param against `LOCALES` and calls `notFound()` — the
  root layout stays a passthrough.

### 5.2 Catalogues

- `messages/zh-CN.json` (source) and `messages/en.json` (authored peer). ICU MessageFormat;
  one key per complete sentence; parameters interpolated, never concatenated.
- Nesting by surface: `common.*`, `chrome.*`, `auth.*`, `dashboard.*`, `validation.*`,
  `errorSummary.*`, `languageSwitcher.*`, `errors.*`, `meta.*` (page titles/descriptions —
  server-rendered metadata is locale-aware per guideline §3).
- next-intl typed keys: `src/global.d.ts` declares `IntlMessages` from `zh-CN.json` so a
  typo'd key is a TypeScript error.
- Initial content: §9.3's draft copy table (zh + en, following the design skill's voice
  rules). **When writing `en.json`, use typographic apostrophes (’)** — the table below uses
  straight quotes only as a markdown convenience; the skill mandates curly.

### 5.3 Gate A — `scripts/check-i18n.mjs` (runs via `tsx`, chained into web's build script)

Imports: ICU parser from the root devDependency; the core registry via relative path
`../packages/core/src/i18n/message-keys.ts` (§3.1). Fails the build (non-zero exit, each
failure listed with file/key) on any of:

1. **Parity:** the recursive key sets of `zh-CN.json` and `en.json` differ in either direction.
2. **ICU validity:** any message fails to parse with `@formatjs/icu-messageformat-parser`.
3. **Argument parity:** for any key, the set of ICU argument names differs between locales
   (catches `{email}` present in zh but dropped in en).
4. **Core coverage:** any key in the core registry missing from either catalogue — and each
   catalogue message's ICU arguments must include the registry's declared params for that key.
5. **Empty values:** any message that is `""` or whitespace.
6. **CJK sweep:** any CJK codepoint (`一-鿿` U+4E00–9FFF, `㐀-䶿` U+3400–4DBF, `豈-﫿`
   U+F900–FAFF compatibility ideographs, CJK punctuation U+3000–303F, fullwidth forms
   U+FF00–FFEF) in `apps/web/src/**/*.{ts,tsx}` — user-facing Chinese belongs in the
   catalogue, full stop. Skips: full-line comments, lines carrying `// i18n-exempt: <reason>`,
   `*.test.*`. (This mirrors the design skill's `.build/check-i18n.mjs` discipline.)

### 5.4 Gate B — ESLint `no-literal-string` (build-blocking via §3.3)

In `apps/web/eslint.config.mjs`, on top of the Next presets:

```js
// eslint-plugin-i18next flat config
i18next.configs["flat/recommended"],
{ rules: { "i18next/no-literal-string": ["error", {
    mode: "jsx-only",
    "jsx-attributes": { include: [
      "placeholder", "alt", "title", "aria-label", "aria-description",
      "label", "hint", "heading", "summary", "description", "note",
    ]},
    callees: { exclude: ["console.*", "require", "cn"] },
  }]}}
```

The attribute list must cover **our own copy-carrying component props** (`label`, `hint`,
`note`, …) — a hardcoded English `label="Email address"` must fail, and the CJK sweep cannot
see it. Escape hatch: `// eslint-disable-next-line i18next/no-literal-string -- <reason>`;
reviews treat an undocumented disable as a defect (guideline §9: lint enforces, review
catches the rest).

### 5.5 Error rendering contract (Week 1 shape, Week 2 scale)

- Server actions return `{ issues: ValidationIssue[] }` (typed, from core). The page maps each
  issue to text with `t(issue.key, issue.params)` and renders:
  - an `ErrorSummary` at the top that receives focus and links to each field (GOV.UK pattern,
    skill component contract), and
  - the inline message on the field itself.
- Supabase/auth *outcome* errors (wrong code, rate-limited) are **not** validation issues;
  they map to dedicated catalogue keys in `auth.*` (§9.3) by error condition — never by
  echoing a provider message string to the user.

---

## 6. Design system wiring (invoke the `visa-master-design` skill first)

### 6.1 Tokens and fonts

- Copy the skill's nine `tokens/*.css` files **verbatim** into `apps/web/src/styles/tokens/`
  (adjust only the `@font-face` `src` URLs → `/fonts/public-sans-latin-*.woff2`). They are the
  single visual source of truth; Tailwind consumes them.
- `globals.css`:

```css
@import "tailwindcss";
@import "./tokens/fonts.css";     /* … all nine, in the skill's order, base.css last */
@theme inline {
  /* map only what utilities need; values always reference the token vars */
  --color-surface-page: var(--surface-page);
  --color-surface-card: var(--surface-card);
  --color-text-body: var(--text-body);
  --color-action-primary: var(--action-primary);
  /* …extend as screens need; never a raw hex anywhere in the app */
  --radius-control: var(--radius-control);
  --radius-card: var(--radius-card);
}
```

- Discipline (from the skill's adherence rules, enforced in review): no raw hex, no raw px for
  anything the tokens cover, font-family only via the token stacks, logical properties only
  (`margin-inline-start`, `padding-inline`, `text-align: start`), `dvh` not `vh`.
- Icons: copy only the needed SVGs (week 1: `globe` or `languages`, `mail`, `loader-circle`,
  `circle-alert`, `check`, `arrow-right`, `menu`, `x`) into `public/icons/`; `icon.tsx` uses
  the skill's CSS-mask technique (`currentColor` fill). No icon carries meaning without text.

### 6.2 Week-1 components (ported from the skill's reference JSX, owned here)

Port = re-implement in TS/Tailwind-on-tokens keeping the skill's **documented props, variants,
enums, and behaviors**. The reference `.jsx` + `.prompt.md` in
`.claude/skills/visa-master-design/components/` are the contract; the prototype is not.

| Component | Contract highlights (from skill) |
|---|---|
| `Button` | variants `primary/secondary/ghost/quiet`; sizes 36/44/52px min-height, min-width 44px; hover = one ramp step darker, active two; loading = spinning `loader-circle`; primary **once per view** |
| `Input` | label/hint/error props; ≥16px font (iOS zoom); `width` communicates expected length; error border + inline message below |
| `Callout` | GOV.UK inset shape, 4px inline-start rule; tones info/success/warning/error/quiet |
| `Card` | white, 1px `--ink-200` border, `--radius-card`, `--shadow-1` |
| `ErrorSummary` | renders at top on failed submit, **takes focus**, links each `{field, message}` to its input |
| `SiteHeader` (+ Wordmark) | scrolls away (never sticky); wordmark = 签证大师 + small teal VISA MASTER (placeholder — flagged open substitution); `compact` below 900px |
| `SiteFooter` | `--surface-inverse` navy; carries the disclaimer note + LanguageSwitcher + empty ICP slot |
| `LanguageSwitcher` | languages self-name (简体中文 / English) from `core/locales`; **permanent non-dismissible note** supplied from our catalogue (`languageSwitcher.note`, §9.3 — the guideline wording wins over the skill catalogue's own `language.note` variant, recorded §14.11); desktop: header + footer; mobile: inside collapsed nav + footer (never a top-level nav slot) |

Global behaviors: `:focus-visible` 3px ring (base.css gives it free), semibold 600 max weight,
no tooltips, no toasts, no emoji, brick-red de-escalated errors, +100% expansion tolerance on
every text container (verify by switching locale on every screen — en is the longer string in
this pair).

### 6.3 Language switcher behavior

- Renders links to the **same pathname** under the other locale (next-intl `Link` with
  `locale` prop) — state-preserving by construction on Week-1 pages; from Week 2 the rule
  "switching never loses a draft/step/scroll" binds every intake screen.
- When signed in, switching also fires a server action `updateProfileLocale(locale)`
  (validated against `LOCALES`; allowed by the column-level grant in 0001) so notifications
  can later resolve the recipient's locale server-side (guideline §3). Server-side readers of
  `profiles.locale` must fall back to `DEFAULT_LOCALE` on unrecognized values (§14.7).

---

## 7. Database — Supabase project + migrations 0001–0003

### 7.1 Layout and CLI workflow

- `supabase init` run **from `packages/db/`** (the CLI walks up from cwd; scripts pin
  `--workdir` anyway). `config.toml` is committed; `supabase/.temp/` etc. added to the root
  `.gitignore` in the same commit.
- Requires the Supabase CLI (`brew install supabase/tap/supabase` — implementer may run it;
  no credentials involved). Docker is needed only to **run** the local stack, not to author
  the migration files (§12.2).
- `packages/db/package.json` scripts:
  `db:start` / `db:stop` / `db:status` / `db:reset` (`supabase db reset` re-applies all
  migrations + config into the local stack).
- Local stack endpoints (printed by `supabase start`): API `http://127.0.0.1:54321`, DB
  `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (documented universal local
  default, not a secret), Studio `:54323`, Mailpit `:54324`, plus `sb_publishable_*` /
  `sb_secret_*` keys. These are generated locally — none are committed anywhere.

### 7.2 `0001_profiles.sql` (mirror of `auth.users` + role enum, RLS on)

Plan-mandated content ("mirror of auth.users + role enum user|operator|admin"), shaped to
v0.4 Chapter B's users columns that survive the Supabase-Auth carve-out (deferred columns
recorded in §14.10):

```sql
-- Shared trigger helper (Chapter B convention)
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'user'
             check (role in ('user','operator','admin')),
  status     text not null default 'active'
             check (status in ('active','suspended','pending_deletion','deleted')),
  plan       text not null default 'free',
  locale     text not null default 'zh-CN',   -- no CHECK: locale list lives in packages/core only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile row on signup (email OTP creates auth.users rows)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Clients may update ONLY locale; role/status/plan are server-managed.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (locale) on public.profiles to authenticated;
```

Notes: `(select auth.uid())` is the documented initPlan performance idiom. Role elevation is
admin-only by construction (no client write path); the operator flip for Week 4 is a
documented SQL snippet in `packages/db/README.md`, run with the secret key.

### 7.3 `0002_jobs.sql` (architecture v0.4 **Chapter B form** — not the B.1 sketch)

Chapter B's `jobs` DDL, with the dev-plan's mandated additions (`failure_reason`,
`tokens_in`, `tokens_out`) and the explicitly recorded adaptations (§14.2–14.4, §14.12):

```sql
create table public.jobs (
  id               uuid primary key default gen_random_uuid(),
  case_id          uuid,             -- future FK -> cases(id); cases table deferred (§14.2)
  user_id          uuid not null references auth.users (id),  -- denormalized for quota queries (§14.12)
  task_type        text not null
                   check (task_type in ('intake_chat','requirements_check',
                          'doc_field_extraction','translation','itinerary_draft',
                          'produce_pack','qa_check','custom_research')),
  executor_kind    text not null
                   check (executor_kind in ('llm_gateway','custom_agent','hermes','backend_code')),
  agent_server_id  uuid,             -- future FK -> agent_servers(id); set at lease time (§14.2)
  state            text not null default 'queued'
                   check (state in ('queued','leased','running','awaiting_input',
                          'validating','succeeded','failed','cancelled','timed_out')),
  priority         smallint not null default 100,             -- lower = sooner
  attempt          smallint not null default 0,
  max_attempts     smallint not null default 2,
  idempotency_key  text unique,      -- encodes dedupe semantics, e.g. 'produce_pack:draft:<id>'
  input            jsonb not null,   -- SANITIZED task payload: never user_id / email / JWT inside (v0.3 §11)
  result           jsonb,            -- executor completion report; large outputs go to storage + manifest
  error            jsonb,            -- {code, retryable, detail} — codes per adapter contract C §1
  failure_reason   text,             -- structured, user-presentable reason set by review/reject or watchdog
  max_tokens_total int not null default 400000,
  max_cost_usd     numeric(8,2) not null default 5.00,
  tokens_in        bigint,           -- written from GATEWAY metering only, never agent self-report
  tokens_out       bigint,
  deadline_seconds int not null default 1200,  -- wall clock counts from LEASE, never queue wait;
                                               -- beta runs override to 3600 at enqueue (plan wk3)
  created_at       timestamptz not null default now(),
  leased_at        timestamptz,
  lease_expires_at timestamptz,      -- heartbeat renews; reaper requeues/fails on expiry
  started_at       timestamptz,
  heartbeat_at     timestamptz,      -- written by the WORKER, never the agent
  finished_at      timestamptz,
  updated_at       timestamptz not null default now()
);

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create index jobs_queue_idx  on public.jobs (priority, created_at) where state = 'queued';
create index jobs_reaper_idx on public.jobs (lease_expires_at)
  where state in ('leased','running','awaiting_input','validating');
create index jobs_case_idx   on public.jobs (case_id, created_at desc);
create index jobs_user_idx   on public.jobs (user_id, created_at desc);

alter table public.jobs enable row level security;

-- Users read their own jobs; ALL writes go through the server (secret key), preserving
-- the v0.4 posture "authorization lives in the API layer; RLS is the second line".
create policy "jobs_select_own" on public.jobs
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.jobs from anon;
revoke insert, update, delete on public.jobs from authenticated;
grant select on public.jobs to authenticated;
```

Kept from Chapter B: state vocabulary, canonical `task_type` names (wire strings like
`pack.schengen.v1` are aliases resolved in `packages/core`, per reconciliation note 4), the
attempt/idempotency/budget columns, all four indexes, lease + heartbeat columns. **No
`progress` column** — Chapter B routes progress through `job_events`; the week-4 "progress
JSONB" line in the platform doc conflicts and is deliberately left as a week-4 decision
(§14.4). Deviations recorded in §14.2 (nullable `case_id`/`agent_server_id`, no FKs yet),
§14.3 (no `job_events` table yet), §14.12 (FK retarget to `auth.users`).

### 7.4 `0003_usage_events.sql`

Chapter B's `token_usage` shape under the dev-plan's name `usage_events` (weeks 2/5 quota
checks read it; the gateway writes it from week 3):

```sql
create table public.usage_events (
  id                bigint generated always as identity primary key,
  job_id            uuid references public.jobs (id),
  user_id           uuid not null references auth.users (id),
  provider          text not null
                    check (provider in ('openai','anthropic','moonshot','gemini','nous')),
                    -- provider list verbatim from Chapter B token_usage
  model             text not null,
  prompt_tokens     int not null default 0,
  completion_tokens int not null default 0,
  cached_tokens     int not null default 0,
  cost_usd          numeric(10,6) not null default 0,
  recorded_at       timestamptz not null default now()
);

create index usage_events_user_idx on public.usage_events (user_id, recorded_at);
create index usage_events_job_idx  on public.usage_events (job_id);

-- Never client-exposed (v0.4 Chapter B RLS posture); written by service key only; append-only.
alter table public.usage_events enable row level security;   -- no policies = deny all clients
revoke all on public.usage_events from anon, authenticated;
```

### 7.5 Auth config (`config.toml` deltas + OTP email template)

On top of `supabase init` output:

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://127.0.0.1:3000", "http://localhost:3000"]

[auth.email]
enable_signup = true
enable_confirmations = false
otp_length = 6
otp_expiry = 600        # 10 minutes
max_frequency = "1s"    # local-dev convenience; hosted default (60s) applies in staging/prod

[auth.email.template.magic_link]
subject = "登录验证码 / Your sign-in code"
content_path = "./supabase/templates/otp.html"
```

`templates/otp.html` — bilingual (recipient locale is unknown at this layer in V1; per-locale
send is the guideline's later server-side resolution), voice-rule compliant (你, calm, no
exclamation marks), and it **must contain `{{ .Token }}`** so a 6-digit code is delivered
rather than a magic link:

```
签证大师 · Visa Master

你的登录验证码：{{ .Token }}
验证码 10 分钟内有效，只能使用一次。如果不是你本人操作，忽略这封邮件即可。

Your sign-in code: {{ .Token }}
The code is valid for 10 minutes and can be used once.
If you did not request it, you can ignore this email.
```

(Real file is minimal HTML; keep both languages, code first, no links.) The same template
change must be made in the hosted dashboard when the founder creates the staging project
(§12.3, step 4).

### 7.6 `packages/db/README.md` contents

Local quickstart (Docker Desktop → `pnpm db:start` → paste printed URL/publishable key into
`apps/web/.env.local` → Mailpit at `:54324` for codes), reset/migrate/test commands, the
operator role-flip SQL, hosted-project setup checklist (mirrors §12.3, marked deferred), and
the migration-naming policy (§14.1).

### 7.7 pgTAP RLS tests (`supabase test db`) — the migrations verify themselves

Files in `packages/db/supabase/tests/`, run with `pnpm db:test` (script:
`supabase test db`; requires the local stack running). Each file is transactional pgTAP:
`begin; select plan(N); … select * from finish(); rollback;`. Simulate a signed-in user with
the standard Supabase pattern:

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub":"<user-uuid>","role":"authenticated"}';
```

Include `create extension if not exists pgtap with schema extensions;` inside the
transaction (per Supabase's testing docs). The JSON `request.jwt.claims` form is preferred
over the singular `request.jwt.claim.sub` because it also serves code reading `auth.jwt()`;
both work. (Flow verified against Supabase CLI v2.113.0 and the official testing guides,
2026-08-10: `supabase test db` runs `supabase/tests/*.sql` with pgTAP; `supabase test new
<name> --template pgtap` scaffolds one.)

Seed by inserting two rows into `auth.users` as postgres **before** switching role (the
official docs do exactly this) — which also exercises the `handle_new_user` trigger (the
profiles rows must appear without explicit inserts). Test files and their assertions:

- `001_profiles_rls.sql` (lands with commit 8): trigger created a profiles row per user;
  user A `select` sees exactly 1 row (their own); A can `update` their own `locale`;
  A's `update` of `role` fails (`throws_ok`, insufficient privilege — column grant); A's
  `insert`/`delete` fail; `anon` sees nothing.
- `002_jobs_rls.sql` (commit 9): with one job seeded per user (as postgres), A selects
  exactly their own; A's `insert`/`update`/`delete` all fail (server-only writes, §14.6).
- `003_usage_events_rls.sql` (commit 9): `authenticated` and `anon` can neither select nor
  insert (privileges revoked, no policies).

These make the founder's "empty dashboard **behind RLS**" and the §14.6 write posture
machine-checked instead of review-checked. Verify the exact pgTAP harness conventions
(`supabase test new` scaffold, extension availability) against the installed CLI version at
implementation time; the assertions above are the contract.

---

## 8. Auth flow (`apps/web`)

### 8.1 Supabase clients

Per current Supabase docs (verified Aug 2026):

- `lib/supabase/client.ts` — `createBrowserClient(url, publishableKey)` singleton.
- `lib/supabase/server.ts` — `createServerClient` per request, `cookies()` from
  `next/headers`, `setAll` wrapped in try/catch (Server Component case). **Never a global.**
- `lib/supabase/proxy.ts` — `updateSession` per the documented single-middleware pattern:
  create its own `NextResponse`, apply refreshed cookies **and** the cache headers `setAll`
  hands over, then `await supabase.auth.getClaims()`; unauthenticated requests to protected
  paths redirect to `/{locale}/login`. Protected matcher for Week 1: `/dashboard` (any
  locale). **Never `getSession()` for protection.** Composition with next-intl modifies this
  pattern — see §8.3.
- `lib/supabase/admin.ts` — `createClient(url, SUPABASE_SECRET_KEY)` behind
  `import "server-only"`; unused until Week 2's job insert, but the file exists so the
  secret's *only* home is established.

### 8.2 Server actions (`app/[locale]/login/actions.ts`)

- `requestOtp(prev, formData)`:
  1. `emailSchema` (core) → on failure return `{ issues }` (keys, §5.5).
  2. `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })` — signup
     and login are one flow (Week-1 DoD: "signup → OTP → dashboard").
  3. Outcome errors map to catalogue keys (`auth.otp.rateLimited`, `auth.otp.sendFailed`).
  4. Success returns `{ ok: true, email }` — the page flips to the code step and renders
     `auth.otp.sentTo` with that email.
- `verifyOtp(prev, formData)`:
  1. The code step carries the email in a hidden input; **re-validate it with `emailSchema`**
     (it is client-tamperable) alongside `otpCodeSchema` → `{ issues }` on failure.
  2. `supabase.auth.verifyOtp({ email, token, type: "email" })` (server client sets cookies).
  3. Failure → `{ authError: "auth.otp.failed" }`; success → `redirect({href: "/dashboard", locale})`
     via next-intl navigation.
- Resend = `requestOtp` again with the carried email; a rate-limited resend surfaces
  `auth.otp.rateLimited` on the code step without losing the entered email.
- `signOut()`: server action, `supabase.auth.signOut()`, redirect to `/{locale}/login`.

### 8.3 `proxy.ts` composition (next-intl ∘ Supabase)

Order: run next-intl's routing middleware first (it owns locale detection/redirects and
produces the response), then run the Supabase session refresh **writing its cookies and cache
headers onto that same response**; extract the locale segment for login-redirect URLs. This is
a deliberate modification of the documented single-middleware `updateSession` (which builds
and returns its own response) — the docs warn that mis-merging cookies across responses drops
refreshed sessions, so **commit 11's full login-loop test is what proves this composition**
(sign in, wait for token refresh window or force-expire, navigate, confirm no logout).
Follow next-intl's "composing with auth middleware" recipe; matcher excludes `_next/*`,
static assets, `favicon`, and files with extensions.

### 8.4 Pages

- `/[locale]/login` — one route, two states (email step → code step, state carried in the
  form). GOV.UK question style: `<h1>` is the question-form title, hint under it, single
  input, primary button in flow. Code step shows `auth.otp.sentTo` with the entered email, a
  resend action, and "use a different email address".
- `/[locale]/dashboard` — server component; `getClaims()` guard (defense in depth beyond
  proxy), fetch own `profiles` row **under RLS with the user's session** (this is the "empty
  dashboard behind RLS" DoD — the query only works because the RLS policy matches), render:
  header with signed-in email + sign-out, empty-state Card (`dashboard.empty.*`). If the
  profiles select unexpectedly returns no row (trigger failure), render the empty state and
  log — never crash the page on a missing profile. No dead CTA (application creation arrives
  Week 2).
- `/[locale]` landing — wordmark, one catalogue-sourced line, login CTA. The real marketing
  homepage (content-strategy §10 copy) is deliberately out of Week-1 scope.
- `[locale]/not-found.tsx` + `[locale]/error.tsx` — localized (`errors.*` keys, §9.3); an
  unhandled error must not render Next's default English text on a zh page.
- Titles/descriptions via `generateMetadata` + `t` (`meta.*` keys), per guideline §3.

### 8.5 Stub mode (no Supabase env)

`lib/supabase/config.ts` exports `isSupabaseConfigured()` (both public vars non-empty). When
false: `proxy.ts` skips session handling entirely (site fully browsable), `/login` renders a
`Callout` with `auth.notConfigured` instead of the form, `/dashboard` redirects to `/login`.
Client factories throw a descriptive error if invoked while unconfigured — nothing crashes at
import time, `next build` succeeds with zero env. **This is how the repo builds and runs
before any Supabase project exists.** No fake defaults, no placeholder keys.

### 8.6 End-to-end tests (Playwright) — the Week-1 DoD, self-verified

`apps/web/e2e/` + `playwright.config.ts`; devDep `@playwright/test` (latest; run
`pnpm exec playwright install chromium` once — a ~100 MB browser download, note it in the
README). Script `"e2e": "playwright test"` — deliberately **not** part of `turbo test`
(needs Docker + the local stack); it is part of the full-local-verification command (§11).

Mechanics:

- **Precondition guard:** a global setup pings the local Supabase API
  (`http://127.0.0.1:54321`) and fails fast with "run `pnpm db:start` first" if absent.
- **Dev server:** Playwright `webServer` starts `pnpm dev` on port 3000 (env from
  `.env.local`). For stub-mode coverage, a second server on port 3100 with the two
  `NEXT_PUBLIC_SUPABASE_*` vars explicitly emptied. (Confirmed 2026-08-10: released
  Playwright supports a `webServer` **array**, each entry with its own
  `command`/`url`/`env`/`reuseExistingServer`; use `url`, not the deprecated `port`.)
- **Reading OTP codes without a human** (endpoints confirmed against the Mailpit API spec,
  2026-08-10): search for the recipient
  (`GET http://127.0.0.1:54324/api/v1/search?query=to:<email>` — `to:` is a supported search
  prefix), then `GET /api/v1/message/{ID}` and extract the 6-digit code from the `Text`
  field (`/\b\d{6}\b/`), polling up to ~10 s. `{ID}` also accepts the literal `latest`.
  Use a unique inbox per run (`wk1-<timestamp>@e2e.test`) so runs never read a stale code.

Specs (commit 13):

1. `i18n-routing.spec.ts` — `/` redirects to a locale prefix; `/zh` and `/en` render with
   `<html lang>` = `zh-CN` / `en` and catalogue strings present; `/fr/x` redirects;
   `/zh/nonexistent` renders the localized 404 (`errors.notFound.title` in Chinese).
2. `auth-otp.spec.ts` — for **each** locale: login → request code → fetch from Mailpit →
   verify → lands on dashboard showing `dashboard.signedInAs` with the email (this is the
   RLS-scoped profiles read exercised end-to-end) → sign out → `/dashboard` redirects to
   login. Plus: a wrong code shows `auth.otp.failed`; resend keeps the entered email.
3. `language-switcher.spec.ts` — on `/zh/login`, switch to English → `/en/login` (same
   path), the permanent pack-language note is present in both locales.
4. `stub-mode.spec.ts` (port 3100) — `/zh/login` renders the `auth.notConfigured` callout,
   no crash; `/zh/dashboard` redirects to login.

Assertions reference copy **through the catalogues** (import `messages/*.json` in the spec),
never re-hardcoded strings — the e2e layer must not become a third place copy lives.

---

## 9. Screens, chrome, and copy

### 9.1 Layout skeleton

`[locale]/layout.tsx`: validate locale, `setRequestLocale`, `<html lang={locale}>` (drives
per-script typography), `NextIntlClientProvider`, `SiteHeader`, `<main>` on `--surface-page`,
`SiteFooter`. Mobile-first; header/footer per skill contracts; the 4-slot logged-in mobile
tab bar (IA §10) starts Week 2 when a second destination exists.

### 9.2 Copy rules that bind every string here

From the design skill (voice) + i18n guideline: 你 never 您; calm instruction-shaped errors
("name what's wrong, then what to do"); no exclamation marks; sentence case in English, no
Title Case; contractions allowed in English **except negations** (always "do not", "cannot");
no "simply/just/easy"; no emoji; disclaimers visible, never behind a link; digits for counts;
one key per full sentence; typographic apostrophes in en.json.

### 9.3 Initial catalogue (draft for founder review — flagged, not final)

| Key | zh-CN | en |
|---|---|---|
| `meta.title` | 签证大师 | Visa Master |
| `chrome.footer.disclaimer` | 本服务不代办签证，也不影响使领馆的审批结果。 | We do not apply on your behalf, and we do not influence the consulate's decision. |
| `languageSwitcher.note` | 仅切换界面语言。材料包的语言由目的国的要求决定。 | Switches the interface language only. The language of your document pack is set by the destination country's requirements. |
| `landing.intro` | 把签证材料准备得更清楚、更一致。 | Prepare clearer, more consistent visa documents. |
| `landing.cta` | 登录或创建账号 | Sign in or create an account |
| `auth.login.title` | 登录或创建账号 | Sign in or create an account |
| `auth.login.intro` | 输入邮箱地址，我们会发送一个 6 位验证码。 | Enter your email address and we'll send you a 6-digit code. |
| `auth.login.emailLabel` | 邮箱地址 | Email address |
| `auth.login.submit` | 发送验证码 | Send the code |
| `auth.otp.title` | 输入验证码 | Enter your code |
| `auth.otp.sentTo` | 验证码已发送到 {email}。 | We sent a code to {email}. |
| `auth.otp.codeLabel` | 6 位验证码 | 6-digit code |
| `auth.otp.submit` | 验证并登录 | Verify and sign in |
| `auth.otp.resend` | 重新发送验证码 | Send a new code |
| `auth.otp.changeEmail` | 换一个邮箱地址 | Use a different email address |
| `auth.otp.failed` | 验证码不正确或已过期。重新输入，或点击重新发送。 | That code is not correct or has expired. Enter it again, or send a new one. |
| `auth.otp.rateLimited` | 验证码刚刚发送过。稍等一会再试。 | A code was sent a moment ago. Wait a moment and try again. |
| `auth.otp.sendFailed` | 验证码发送失败。请再试一次。 | We could not send the code. Try again. |
| `auth.notConfigured` | 登录暂不可用：认证服务还没有配置。 | Sign-in is not available yet: the authentication service has not been configured. |
| `auth.signOut` | 退出登录 | Sign out |
| `dashboard.title` | 我的申请 | My applications |
| `dashboard.signedInAs` | 已登录：{email} | Signed in as {email} |
| `dashboard.empty.title` | 你还没有申请 | You do not have any applications yet |
| `dashboard.empty.body` | 你创建的申请会显示在这里。 | Applications you create will appear here. |
| `errors.notFound.title` | 找不到这个页面 | This page cannot be found |
| `errors.notFound.body` | 这个地址不存在，或者已经移动。 | This address does not exist, or it has moved. |
| `errors.unexpected.title` | 出了点问题 | Something went wrong |
| `errors.unexpected.body` | 刚才的操作没有完成。请刷新页面再试一次。 | That did not complete. Refresh the page and try again. |
| `errorSummary.title` | 请先补充以下内容 | There is something to fix before you continue |
| `validation.required` | 请填写这一项。 | Fill in this field. |
| `validation.invalid` | 请检查这一项，然后重新填写。 | Check this entry and enter it again. |
| `validation.email.invalid` | 请输入有效的邮箱地址。 | Enter a valid email address. |
| `validation.otp.invalidFormat` | 验证码是 6 位数字，请检查后重新输入。 | Your code is 6 digits. Check it and enter it again. |
| `validation.tooShort` | 至少需要 {min} 个字符。 | {min, plural, one {Enter at least # character.} other {Enter at least # characters.}} |
| `validation.tooLong` | 最多 {max} 个字符。 | {max, plural, one {Enter no more than # character.} other {Enter no more than # characters.}} |

(Language self-names 简体中文/English come from `core/locales`, deliberately **not**
catalogue keys — they are never translated.)

---

## 10. Placeholders (`apps/conductor`, `packages/executors`)

- `apps/conductor/src/index.ts`: a typed `main()` that logs
  `conductor: not implemented — arrives in week 3 (see doc/platform-and-dev-plan-en.md Part III §2)`
  and exits 0. Scripts: `typecheck`, `lint`. No dependencies.
- `packages/executors/src/contract.ts`: the `Executor` interface **verbatim** from the
  platform plan Part III §1 (kind/start/poll/collect/destroy with the artifact-watch comment),
  plus minimal `JobRow` (typed to the 0002 columns), `RunContext`, `RunHandle` placeholder
  types and a doc-comment pointing at architecture v0.4 Chapter C §1 for the eventual HTTP
  realization. Types only; no runtime code. The contract's `kind` values
  (`'hermes' | 'llm-gateway' | 'thin-agent'`) are **wire/deploy names**; a doc-comment states
  they map to `jobs.executor_kind` DB names (`llm_gateway`, `custom_agent`, …) via a resolver
  in `packages/core`, mirroring reconciliation note 4's treatment of task_type aliases
  (recorded §14.13).

Both exist so the plan-named workspace shape is real from Week 1 and `turbo run typecheck`
covers them.

---

## 11. Commit sequence (execute in order; run the checks before each commit)

Per-commit verification baseline: `pnpm turbo lint typecheck test` + `pnpm --filter web build`
green (build chains Gate A; turbo chains Gate B). **Full local verification** (run at
commits 8, 9, 12, 13 — needs Docker):

```bash
pnpm turbo lint typecheck test && pnpm --filter web build && pnpm db:test && pnpm --filter web e2e
```

Do not push. No tool attribution.

| # | Commit (imperative subject) | Contents | Extra verification |
|---|---|---|---|
| 0 | Add the Week 1–2 execution plan | this file (founder-directed; done by the planning session) | — |
| 1 | Scaffold the pnpm + Turborepo monorepo | root package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json, extend .gitignore, prettier config, README "Development" section | `pnpm install` clean |
| 2 | Add @visa-master/core with key-emitting validation | §4 entire package + tests | `pnpm --filter @visa-master/core test` |
| 3 | Add placeholder conductor and executors packages | §10 | typecheck |
| 4 | Scaffold apps/web with the design-token layer | Next app shell **without the next-intl plugin yet**, Tailwind 4, tokens copied, fonts, icons, globals.css, ui components (Button/Input/Callout/Card/Icon); the page placeholder carries **zero user-facing text** | `pnpm --filter web build` (no env) |
| 5 | Add the i18n skeleton with locale-prefixed routes | next-intl plugin into next.config.ts, routing/request/navigation, global.d.ts, [locale] layout with `<html lang>` + locale validation, catch-all/not-found/error pages, minimal catalogues (`meta.*`, `errors.*`) | visit `/zh` and `/en`; `/fr` redirects; `/zh/nope` renders localized 404 |
| 6 | Enforce the i18n build gates | `scripts/check-i18n.mjs` + root devDep, eslint i18next rule, web build script chains Gate A, turbo `build.dependsOn: ["lint"]` | break-tests: delete an en key → build fails; delete a key from **core's registry** → build fails; add a JSX literal (and a `label="..."` attr) → build fails via lint; restore all |
| 7 | Add the site chrome and landing page in both locales | SiteHeader/Footer/Wordmark, LanguageSwitcher (+ locale-persist action stub), landing page, full §9.3 catalogue | gates green at this boundary; switcher flips `/zh↔/en` preserving path |
| 8 | Add the Supabase project scaffold and profiles migration | packages/db (init output), config.toml deltas, otp.html, 0001, **`tests/001_profiles_rls.sql`** (§7.7), supabase ignores in .gitignore | `pnpm db:start && pnpm db:reset && pnpm db:test` (founder starts Docker, §12.2); if Docker unavailable, SQL review only + note in commit body, run db:test at first opportunity |
| 9 | Add jobs and usage_events migrations per architecture v0.4 Chapter B | 0002, 0003, **`tests/002_jobs_rls.sql` + `tests/003_usage_events_rls.sql`** (§7.7) | `pnpm db:reset && pnpm db:test` |
| 10 | Add Supabase clients, stub mode, and env template | client/server/admin/config.ts, `.env.example` | `pnpm --filter web build` with zero env; stub Callout renders on /login |
| 11 | Wire session refresh and protected routes into the middleware | proxy.ts composition (§8.3), `/dashboard` redirect rules | with local stack: signed-out `/zh/dashboard` → `/zh/login`; cookie survival across navigation (§8.3 test) |
| 12 | Add email OTP login, logout, and the RLS dashboard | login page + actions, dashboard page | full loop in `/zh` and `/en`: signup → Mailpit code → dashboard (profiles row via RLS) → sign out; wrong code → `auth.otp.failed`; resend keeps email |
| 13 | Add Playwright end-to-end coverage for the auth loop and i18n routing | §8.6 entire: config, global setup guard, 4 specs, README notes (browser install, db:start precondition) | full suite green: the §8.6 specs are the executable Week-1 DoD; then run the complete full-local-verification command |
| 14 | ~~CI workflow~~ **deferred** | repo is local-only by founder decision (§12.3); CI without a remote is dead weight. Revisit when the founder first pushes. | — |

Manual device pass after commit 13 (Week-1 slice): devtools 375×667 / 390×844 + desktop 1280,
both locales, login + dashboard — layout survives the longer English strings, inputs ≥16px,
touch targets ≥44px. **The real-device matrix (WeChat iOS/Android, XHS, Safari iOS, Chrome
Android — mobile-parity §4) requires the deployed URL and physical phones: it is assigned to
the founder, guided by a checklist we produce, immediately after the first deploy (§12.3), and
it recurs each release** (§14.14 records the Week-1 narrowing).

---

## 12. What the founder must provide, and exactly when

### 12.1 Resolved 2026-08-10 (nothing blocks the first commit anymore)

- ~~Git identity~~ — **done by the founder** (`git config user.name/user.email` set).
- ~~Supabase CLI~~ — **installed by the founder** (`brew install supabase/tap/supabase`).
- ~~Plan confirmation~~ — **confirmed**, with the amendments folded into this revision
  (test layer, local-first, plan committed as commit 0). CI (commit 14) deferred with the
  hosted setup.

### 12.2 Before verification of commits 8–13 (the only remaining founder-side dependency)

- **Docker Desktop must be running** for `supabase start` / `db:test` / the e2e suite.
  Starting it is a founder action (or approve `open -a Docker`).
- Then `pnpm db:start` prints local URL + `sb_publishable_*` / `sb_secret_*` keys →
  paste into `apps/web/.env.local` (gitignored):

```
# apps/web/.env.example  (committed, names only — this exact content)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# Server-only. Never expose with NEXT_PUBLIC_. Unused until Week 2 (job submission).
SUPABASE_SECRET_KEY=
```

OTP codes for local logins are read from Mailpit at `http://127.0.0.1:54324`. No real email
provider, no secrets invented.

### 12.3 Deferred: hosted deployment (founder decision 2026-08-10 — local-first)

**The project stays local until (a) the full test suite is green (unit + pgTAP + e2e) and
(b) the founder has manually verified the local build.** Only then does the founder set up
Vercel + hosted Supabase (and any paid plans). The Week-1 DoD line "works on the Vercel prod
URL" is explicitly deferred to that moment (§15). The checklist below is written now so
nothing is forgotten then:

0. **Push is founder-triggered.** The standing rule here is "do not push"; when you are ready,
   you push `feat/week1-foundations` (or say the word explicitly) and open the PR. Decide
   which branch Vercel production tracks (`main` after merge is the plan-doc default;
   pre-merge, the PR's preview URL against the staging Supabase project satisfies testing).
1. Create Supabase project `visa-master-staging` (region: Singapore or closest to users).
2. `supabase link` + `supabase db push` from `packages/db` (commands documented in
   `packages/db/README.md`).
3. Dashboard → Auth: confirm email OTP enabled, set OTP expiry ≈ 10 min.
4. Dashboard → Auth → Email templates → Magic Link: replace body with the §7.5 template
   (must include `{{ .Token }}`).
5. Create the Vercel project (root `apps/web`, framework Next.js) and set
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (+ later
   `SUPABASE_SECRET_KEY` as an encrypted server var); add the Vercel URL to Supabase Auth
   redirect/site URLs. **Verify Vercel's build command runs `apps/web`'s own build script**
   (which chains Gate A — §3.3); decide the staging `noindex` posture (§2 note).
6. Run the guided **real-device pass** (§11 closing note) once the URL is live.
7. Note: production email OTP deliverability to CN mailboxes (QQ/163) eventually needs a
   real SMTP provider (Resend is week 7 in the plan) — the default Supabase sender is fine
   for founder-testing only.
8. `visa-master-prod` repeats 1–5 when needed (plan says both projects in Week 1; staging
   alone is enough until the first deploy is proven — founder's call, flagged).

Also out of our hands (founder ops, Week-1 plan items we do **not** execute from this repo):
Hetzner CAX31 provisioning, ufw/Tailscale, and the `psql`-from-VM DoD check. Track them; they
have no code dependency on this repo.

---

## 13. Week 2 plan (scope-committed; build after Week 1 lands)

### 13.1 Migration `<timestamp>_intake_drafts.sql` (amendment 2, decision §14.5)

```sql
create table public.intake_drafts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  route            text not null default 'schengen_tourism.es.chengdu.v1',
  answers          jsonb not null default '{}',   -- PII: purged with account; retention sweep later
  last_step        text,                          -- exact resume point (task-list section + question id)
  submitted_job_id uuid references public.jobs (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create unique index intake_drafts_one_active
  on public.intake_drafts (user_id) where submitted_job_id is null;
-- RLS: select/insert/update own (authenticated); delete own; anon nothing.
```

Autosave writes go through the user's own session under RLS (server actions with the
per-request server client — not the secret key), because drafts are user-owned mutable state.
`jobs` stays server-written only.

### 13.2 `packages/core` — `IntakeSchengenTourismV1` + rules

- Zod schema for the 8 intake sections (IA §5.3): applicant basics, passport, residence /
  consular district, employment & finances, travel plan, companions/sponsorship,
  visa/refusal/travel history, confirm. Per-field **input metadata bound to the schema**
  (mobile-parity §3.3): `inputmode`, `autocomplete`, `autocapitalize` (passport number:
  characters + no-correct; dates: three numeric fields 年/月/日; money: decimal; pinyin:
  auto-uppercase), masks tolerant of pasted spaces.
- Step partials (`.pick()` per step) drive per-step validation and autosave payloads — one
  schema, no per-component forks.
- Every rule emits registry keys with params (`validation.passport.expiry.tooSoon` +
  `{monthsRequired: 3}` is the canonical example — the founder's litmus test).
- `rules/schengen-spain.ts`: deterministic required-document computation (employed
  Chengdu→Spain tourism); pure function, unit-tested, ADR-002 "rules are code".
- The route gate (V1 supports exactly Chengdu→Spain employed tourism; everything else →
  waitlist, **before** payment or application creation) is a core function too.

### 13.3 Intake UI

- Task-list hub (`TaskList` component per skill contract: every section always rendered,
  locked items say what unlocks them) + one-question-per-page screens under
  `/[locale]/applications/new/…`; `StepProgress`, `StickyActionBar` (owns the mobile primary
  button + `visualViewport` keyboard handling), `Question`, `DateInput` (three fields, never
  a picker), `RadioGroup`/`ChoiceRow` (with 我不确定 options where specified), `BackLink`
  (saves before navigating). Radix primitives enter here where the skill's contracts call
  for them; `Sheet` only if a screen needs it.
- Autosave on blur + step transition + 5s debounce → server action patches
  `intake_drafts.answers` + `last_step`; `SaveResumeNotice` shows saved state; resume lands
  on `last_step` after login. Kill-tab-mid-intake → login → same question with data intact
  is the DoD.
- Language switch mid-intake preserves step + draft (same pathname other locale; draft is
  server-side — nothing to lose by construction).
- All intake question copy authored zh first + en peer (guideline §7: questions are a
  product decision in each language) — flag the full question set for founder review before
  the copy commit.

### 13.4 Uploads

- Private bucket `uploads`; path `{user_id}/{draft_id}/{upload_id}`; storage RLS policies
  scoping to `auth.uid()` prefix; MIME allowlist (pdf/jpeg/png/heic) + 20 MB cap enforced at
  policy and API level. Buckets declared in `config.toml` if the CLI version supports
  `[storage.buckets.*]` (verify; else a storage seed migration).
- Resumable uploads via tus (`tus-js-client`) against Supabase Storage's resumable endpoint
  (mobile-parity §3.4 mandates chunked + resumable; a document counts as uploaded only on
  server confirmation). `POST /api/uploads/sign`-style signing only if the tus path needs
  it — prefer the documented tus+RLS flow.
- Week-2 slice: passport scan, bank statement, employment proof as single-file items;
  the multi-page camera loop and client quality gating are Week-2-stretch/Week-4 polish —
  flag explicitly if descoped.

### 13.5 Job submission + polling

- `POST /api/jobs` (route handler, server): auth → load draft → full-schema validation
  (core) → `rules` required-docs check against confirmed uploads → build **sanitized**
  `input` (route, intake answers, upload storage keys + sha256; **no user_id/email/JWT
  inside the payload**) → insert via `admin.ts` (secret key):
  `task_type='produce_pack'`, `executor_kind='hermes'`, `state='queued'`,
  `idempotency_key='produce_pack:draft:'+draftId`, `deadline_seconds=3600` (beta cap; the
  wall clock starts at lease, week 3) → stamp `submitted_job_id` on the draft. Double-submit
  returns the existing job via the idempotency key.
- `GET /api/jobs/[id]`: RLS-scoped read with the user's session (no secret key needed);
  3-second polling from the application page. Nothing consumes the queue yet (Week 3).
- Dashboard grows the real list (IA §6.1 columns) once jobs exist.

### 13.6 Week-2 DoD (from the plan + amendments)

Invalid intakes rejected with field-level errors **from keys, in both locales**; abandoned
mid-step intake resumes after logout/login at the same step with data intact; completed
intake produces a `queued` job row + files in Storage; nothing consumes the queue; language
switch mid-intake preserves everything; mobile-first screens pass the 375px check in both
locales; the Week-2 slice of the e2e suite (intake autosave/resume, draft RLS pgTAP) extends
commit 13's harness. **The founder's real-device pass (mobile-parity §4 matrix, both
languages) runs once a deployed URL exists (§12.3 — currently deferred, local-first); until
then the devtools pass + e2e suite stand in, per §14.14.**

---

## 14. Recorded decisions & deviations (read before objecting to the code)

1. **Migration naming:** 0001–0003 keep the founder-mandated names. From Week 2 onward,
   `supabase migration new` timestamps (documented path; numeric prefixes sort first, order
   stays correct). The plan doc's "0004_packs_reviews_audit / 0005_requirements_cache" are
   treated as content labels, not filenames.
2. **`jobs.case_id` and `jobs.agent_server_id` are nullable with no FK.** Primary grounds:
   the dev plan's week-by-week migration list (0001–0003 now, packs/reviews wk4,
   requirements-cache wk5) never creates `cases` or `agent_servers`; v0.4 note 2 explains why
   `jobs` (not tasks/attempts) is the physical unit at MVP. Columns exist so the Chapter B
   shape is preserved (including `jobs_case_idx`, harmless while null); the FKs land with
   their tables.
3. **No `job_events` table yet.** Chapter B specifies it; nothing consumes it before the
   conductor (Week 3) and progress UI (Week 4). It ships with its consumer.
4. **No `progress` column on `jobs`** — deliberate week-4 decision point: platform doc week 4
   says "conductor writes progress JSONB" (B.1 sketch), Chapter B routes progress through
   `job_events`. Resolve when building week 4 (recommendation then: `job_events`, since
   Chapter B is the mandated form and Supabase Realtime/polling both work off it).
5. **Drafts are a dedicated `intake_drafts` table**, not `jobs.state='draft'`. The amendment
   allows either; `jobs.input` is a frozen sanitized payload (Chapter A invariant:
   reproducible attempts) while drafts are mutable PII-bearing user state with opposite RLS
   (user-writable). Mixing them into one table would violate both postures.
6. **Job writes are server-only (secret key); users only read.** Preserves v0.4's
   "authorization lives in the API layer" under Supabase's client-exposed keys.
7. **`profiles.locale` has no CHECK constraint** — the locale list's single source of truth
   is `packages/core/locales` (i18n §8: adding a locale touches one place). Consequence of
   the column-level grant: a signed-in user could write an arbitrary value via the REST API
   directly, so **every server-side reader of `profiles.locale` falls back to
   `DEFAULT_LOCALE` on unrecognized values**. Low impact (own row, non-security).
8. **TypeScript pinned to 5.9, not 7.x; Next 16 chosen over 15** — see §1 table for both
   rationales and the fallback path.
9. **Week-1 screens skip StickyActionBar** — login/dashboard are short single-action pages;
   the in-flow primary button is the GOV.UK pattern. The bar becomes mandatory with intake
   (Week 2).
10. **Columns ship with their consumer:** `pack_credits` (wk8), `stripe_customer_id` (Stripe,
    wk8), `deleted_at` (deletion pipeline) are deliberately absent from 0001; `plan` is kept
    because week-5 quota hooks read it. The `status` CHECK already carries the lifecycle
    values so the deletion pipeline needs no CHECK migration later.
11. **LanguageSwitcher note wording:** the i18n guideline's sentence wins over the skill
    catalogue's slightly different `language.note` variant; our catalogue supplies the note
    text explicitly to the ported component.
12. **FKs retarget to `auth.users`** (Chapter B's own `users` table dissolves into
    Supabase Auth + `profiles` under the B §4 carve-out). Consequence: `auth.users` rows must
    **never be hard-deleted** (jobs/usage_events reference them and must survive account
    deletion for billing/audit, per Chapter B §3/§4's tombstone design). Account deletion =
    `profiles.status` flip + PII purge; the purge pipeline (explicitly-later item) must use
    tombstoning, not `auth.admin.deleteUser`. Revisit when the deletion pipeline lands.
13. **Executor kind naming:** `Executor.kind` in `contract.ts` keeps Part III §1's wire names
    (`'llm-gateway'`, `'thin-agent'`); `jobs.executor_kind` keeps Chapter B's DB names
    (`llm_gateway`, `custom_agent`, `backend_code`). A resolver in `packages/core` maps
    between them, mirroring reconciliation note 4's task_type alias treatment.
14. **Device-matrix narrowing (Weeks 1–2):** pre-deploy verification runs on devtools
    viewports + desktop only; the binding real-device matrix (mobile-parity §4 — WeChat
    iOS/Android, XHS, Safari iOS, Chrome Android; none emulatable in devtools) runs as a
    founder-executed guided pass immediately after each deploy, both languages. This is a
    sequencing constraint (no URL before deploy), not a scope cut.
15. **Local-first (founder, 2026-08-10):** no hosted Vercel/Supabase, no paid plans, no push,
    no CI until the automated suite is green and the founder has manually verified locally.
    The e2e suite (§8.6) exists precisely so "done" is machine-checkable before any money or
    remote infrastructure is committed.

## 15. Week-1 DoD mapping

| DoD item (plan Part III §2 wk1 + founder) | Covered by |
|---|---|
| signup → OTP → dashboard at `/zh` and `/en`, every string from the catalogue | commits 5–12; **machine-verified by `auth-otp.spec.ts` + `i18n-routing.spec.ts` (commit 13)**; on a prod URL only after §12.3 un-defers |
| build fails on missing key in either locale | commit 6, Gate A checks 1–4 (chained inside web's build script — any invoker, incl. a future Vercel) |
| build fails on hardcoded user-facing string | commit 6: Gate A check 6 (CJK) + Gate B via `build.dependsOn: ["lint"]` (Latin) — both break-tested |
| migrations 0001/0002/0003, 0002 in Chapter B form | commits 8–9; **RLS behavior machine-verified by pgTAP (§7.7)** |
| dashboard behind RLS | commit 12; pgTAP `001` (policy level) + `auth-otp.spec.ts` (page level) |
| .env.example every key name; no secrets committed | commit 10; §12.2 |
| runs against local or stubbed config | stub mode §8.5 + local stack §7.1; `stub-mode.spec.ts` |
| Supabase staging/prod projects, Vercel link, prod URL | **deferred** — §12.3 (local-first, founder decision 2026-08-10) |
| VM provisioned, no open port, psql from VM | founder ops, outside this repo — tracked in §12.3 |

**Local Week-1 "done" =** full-local-verification command green (§11) **+** the founder's own
manual pass of the login loop and both locales. That is the gate before any hosted spend.
