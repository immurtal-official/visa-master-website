-- Applications, and the waiting list for routes we do not serve yet.
--
-- An application is a draft from the moment it is created until it is
-- submitted: the intake is long, it is filled in over several sittings, and
-- inside an in-app browser an interrupted session is the median one. So the
-- answers live here and are written on every step, rather than being held in
-- the page and posted at the end.
--
-- This is deliberately not a state on the jobs table. A job's input is frozen
-- and sanitized so an attempt can be reproduced from the database alone; a
-- draft is mutable, holds personal data, and is written by its owner. The two
-- have opposite postures, and one table cannot have both.

create table public.applications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,

  -- The route, as the route check resolved it. Kept on the row because it
  -- decides which requirements and which forms apply, and because a supported
  -- route today may not be the same set tomorrow.
  residence_area text not null,             -- province or municipality code, e.g. 'sichuan'
  destination    char(2) not null,          -- ISO 3166-1 alpha-2, e.g. 'ES'
  purpose        text not null default 'tourism'
                 check (purpose in ('tourism','family','business','conference')),
  employment     text not null default 'employed'
                 check (employment in ('employed','student','retired','self_employed')),

  status         text not null default 'draft'
                 check (status in ('draft','submitted','cancelled')),

  -- Answers so far, keyed by step. Personal data: purged with the account.
  answers        jsonb not null default '{}',
  -- Where to put the reader back when they return.
  last_step      text,

  -- Set when the intake is submitted and a job is enqueued.
  submitted_job_id uuid references public.jobs (id),
  submitted_at   timestamptz,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

create index applications_user_idx on public.applications (user_id, updated_at desc);

alter table public.applications enable row level security;

-- Unlike jobs, a draft is the user's own working state, so they write it
-- directly: every autosave is one of these updates, and routing each through a
-- privileged server path would buy nothing but latency.
create policy "applications_select_own" on public.applications
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "applications_insert_own" on public.applications
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "applications_update_own" on public.applications
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "applications_delete_own" on public.applications
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.applications from anon;
-- Submission is a server decision — it costs money and is quota-checked — so
-- the columns that record it are not client-writable.
grant select, insert, delete on public.applications to authenticated;
grant update (residence_area, destination, purpose, employment, answers, last_step, status)
  on public.applications to authenticated;

-- ---------------------------------------------------------------------------

-- Routes we do not serve yet.
--
-- An unsupported combination never becomes an application: the route check is
-- a gate in front of the funnel, not a state inside it. What is worth keeping
-- is the demand itself, and only the two fields that describe it.
create table public.waitlist_entries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null,
  residence_area text not null,
  destination    char(2) not null,
  purpose        text,
  employment     text,
  created_at     timestamptz not null default now()
);

create index waitlist_entries_route_idx
  on public.waitlist_entries (destination, residence_area);

alter table public.waitlist_entries enable row level security;

-- Write-only from the client's point of view: someone may add themselves, and
-- nobody may read the list back. It is demand data, not the user's own record.
create policy "waitlist_insert_any" on public.waitlist_entries
  for insert to authenticated, anon
  with check (true);

revoke all on public.waitlist_entries from anon, authenticated;
grant insert on public.waitlist_entries to authenticated, anon;
