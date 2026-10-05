# @visa-master/db

Migrations, local database, and the row-level-security tests.

## Running it locally

Docker must be running. From the repo root:

```bash
pnpm db:start    # Postgres, Auth, Storage, Studio and Mailpit, in Docker
pnpm db:reset    # re-apply every migration from scratch
pnpm db:test     # pgTAP: row-level security behaves as specified
pnpm db:status   # URLs and keys for the running stack
pnpm db:stop     # stop it
```

`db:start` prints the local API URL and two keys. Put them in
`apps/web/.env.local`, which is never committed:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<the publishable key it printed>
SUPABASE_SECRET_KEY=<the secret key it printed>
```

They are generated on this machine and mean nothing anywhere else. The web app
runs without them too — see the stub-mode note in `apps/web`.

**Sign-in emails go to Mailpit at <http://127.0.0.1:54324>**, so local logins
need no mail provider. The code is in the email body; the template lives in
`supabase/templates/otp.html` and must keep its `{{ .Token }}`, because without
it Supabase sends a magic link instead of a code.

## Migrations

`supabase/migrations/`, applied in filename order.

The first three keep the names the build plan gave them (`0001_profiles.sql`
and so on). From here on, create migrations with `supabase migration new
<name>`: the timestamps it generates are what hosted branching, squashing and
repair assume, and short numeric prefixes still sort before them. Never rename
a migration that has been applied anywhere.

Migrations are expand-only — add a column, backfill it, remove the old one in a
later release — so the web app and the conductor can run different versions
during a deploy without either seeing a schema it does not know.

| Migration | What it adds |
|---|---|
| `0001_profiles.sql` | The app's user record beside `auth.users`: role, status, plan, locale. RLS on. |
| `0002_jobs.sql` | The job queue and its state machine, per architecture v0.4 Chapter B. |
| `0003_usage_events.sql` | Per-call token and cost metering, written by the gateway. |

## Tests

`supabase/tests/*.sql` are pgTAP, run by `pnpm db:test` against the local
stack. They assert what the policies actually do — one user cannot see
another's rows, clients cannot write what the server owns, signed-out requests
reach nothing — because a policy is easy to write and easy to get subtly wrong,
and a mistake in one is invisible until it is a data leak.

Each file runs in a transaction that is rolled back, so tests leave no state
behind and can run against a database with data in it.

## Making someone an operator

There is deliberately no client path that writes `role`. To grant the review
role, run this against the database with the secret key or through Studio:

```sql
update public.profiles set role = 'operator' where user_id = '<uuid>';
```

## Hosted projects

Staging is `rmsdyqmuztydicfintbs`, linked from this directory. All migrations
are applied there, including the two that create the private buckets — the
`storage.buckets` inserts need no special handling against a hosted project.

Schema goes up with `supabase db push`. Configuration goes up separately, with
`supabase config push`, which reads the `[remotes.staging]` block at the end of
`config.toml` — so the OTP template, the confirmation setting and the rate
limits are pushed from here rather than clicked into the dashboard. The block
restates the rate limits on purpose: the ones above it are raised so the
end-to-end suite can sign a few dozen throwaway users in from one address, and
inheriting those onto a public deployment would leave it with no limits worth
the name.

Two things the hosted project will not do on its own:

- **It refuses a custom email template until custom SMTP is configured.** The
  SMTP block is therefore a precondition for the template, not a separate nicety.
- **Its built-in SMTP allows two emails an hour**, which is not a sign-in flow.
  Staging sends through Resend; the API key is read from the environment at push
  time (`RESEND_API_KEY`) and is not in this repository.

Pushing config prints a diff and asks before applying. Read it — it is the only
place where a local-development value on its way to production is visible.
