-- The application's own user record, alongside the one Supabase Auth owns.
--
-- auth.users holds identity: the email address, the confirmation state, the
-- session machinery. Everything the product decides about a person — their
-- role, whether the account is suspended, which language they read — lives
-- here, keyed to it. Splitting them this way is what lets the auth layer be
-- replaced later without touching anything that references a user.

-- Shared trigger helper. Later migrations reuse it rather than each writing
-- their own updated_at trigger.
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create table public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'user'
             check (role in ('user','operator','admin')),
  status     text not null default 'active'
             check (status in ('active','suspended','pending_deletion','deleted')),
  plan       text not null default 'free',
  -- No CHECK on locale on purpose: the list of locales has exactly one home,
  -- in packages/core, and adding a language must not need a migration. Readers
  -- fall back to the default locale on anything they do not recognise.
  locale     text not null default 'zh-CN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Sign-up is an email code, so there is no separate registration step to hang a
-- profile insert off: the row has to appear with the auth user or the first
-- authenticated request has nothing to read.
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

-- auth.uid() is wrapped in a select so Postgres evaluates it once per statement
-- as an initPlan rather than once per row.
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Authorization lives in the API layer; these grants are the second line.
-- A client may change its own locale and nothing else: role, status and plan
-- decide what someone is allowed to do, so they are server-managed, and there
-- is deliberately no client path that writes them.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (locale) on public.profiles to authenticated;
