-- The backend's own login role (ADR-005).
--
-- apps/api runs every user-scoped query as `authenticated` with the caller's
-- claims, and the product's own writes as `service_role`, by `set local role`.
-- It connected as `postgres` to be able to do that, and `postgres` can do much
-- more than that: create roles, bypass row-level security, own the schema. A
-- leaked DATABASE_URL was therefore the whole database.
--
-- This is PostgREST's `authenticator` pattern. `visa_api` can log in and do
-- nothing by itself: it is `noinherit`, so being a member of the three roles
-- grants it none of their privileges until it switches to one, and it holds
-- no privileges of its own beyond asking one function whether a token's
-- account and session still exist. It cannot create
-- roles, bypass RLS, or switch to `postgres`.
--
-- The role has no password here. A password is a secret and does not belong in
-- a migration: set it once per project, out of band —
--
--   alter role visa_api with password '<generated>';
--
-- and put it in the backend's DATABASE_URL. Locally, seed.sql sets a fixed
-- development password so the stack works after `supabase db reset`.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'visa_api') then
    create role visa_api login noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
  end if;
end
$$;

-- The three roles it may become, and nothing else.
grant anon, authenticated, service_role to visa_api;

-- Whether a verified token's account still exists, is not banned, and — when
-- the token names one — its session has not been signed out. The backend asks
-- before switching to any role, so the login role needs the answer; it does
-- not need auth.users. One function, owned by the migration's role, answers
-- exactly that question and nothing else: no email, no metadata, no hash.
-- It lives in a schema of its own, which PostgREST does not expose and only
-- the login role can use.
create schema if not exists api_private;
revoke all on schema api_private from public;
grant usage on schema api_private to visa_api;

create or replace function api_private.account_is_active(p_user_id uuid, p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = p_user_id
      and u.deleted_at is null
      and (u.banned_until is null or u.banned_until <= now())
      and (p_session_id is null or exists (
        select 1 from auth.sessions s
        where s.id = p_session_id and s.user_id = u.id
          and (s.not_after is null or s.not_after > now())
      ))
  );
$$;

revoke all on function api_private.account_is_active(uuid, uuid) from public;
grant execute on function api_private.account_is_active(uuid, uuid) to visa_api;
