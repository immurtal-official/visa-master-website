-- Give the server role the privileges it actually needs, and stop the gap
-- reappearing on the next table.
--
-- Tables here are created by the postgres role, and that role's default ACL for
-- schema public grants anon, authenticated and service_role only Dxtm — no
-- select, insert, update or delete. The earlier migrations granted what clients
-- need and never mentioned service_role, so every server-side path was refused
-- with 42501: enqueueing a job, writing metering, the conductor leasing work.
-- Nothing had exercised it yet, which is the only reason this was not obvious.
--
-- Granting DML to service_role opens nothing to clients. service_role carries
-- BYPASSRLS, so row-level security never constrained it — the grants were the
-- only gate in front of it, and anon and authenticated are separate grantees
-- that none of these statements name.

grant select, insert, update on public.profiles to service_role;
grant select, insert, update on public.jobs to service_role;
grant select, insert on public.usage_events to service_role;
grant select, insert, update, delete on public.applications to service_role;
grant select, insert, delete on public.waitlist_entries to service_role;

-- PostgREST asks for the row back on a write by default, and RETURNING needs
-- select as well as insert, so the reads above are not optional.

-- The default ACL is the actual defect: without this, week 3's cases and
-- agent_servers tables arrive with the same hole and the same afternoon of
-- confusion.
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;

-- ---------------------------------------------------------------------------

-- Sequences follow their tables.
--
-- The default ACL grants UPDATE on sequences to anon and authenticated, and on
-- a sequence UPDATE carries setval as well as nextval — so a client could move
-- an identity counter on a table it cannot otherwise touch.
revoke all on sequence public.usage_events_id_seq from anon, authenticated;
grant usage, select on sequence public.usage_events_id_seq to service_role;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  grant usage, select on sequences to service_role;

-- ---------------------------------------------------------------------------

-- The signup trigger function is SECURITY DEFINER and owned by a role that
-- bypasses row-level security, and a function with no ACL is executable by
-- everyone. It is not exploitable today — as a trigger function called directly
-- it has no NEW row to read — but a SECURITY DEFINER function reachable by
-- anon is not a thing to leave lying around.
--
-- A trigger checks EXECUTE when it is created, not when it fires, so the signup
-- trigger keeps working.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------

-- Insert on applications was table-level while update was column-scoped, so a
-- client could set the submission columns at insert time even though it could
-- not change them afterwards. Submitting is a server decision — it costs money
-- and is quota-checked — so the two grants now agree.
revoke insert on public.applications from authenticated;
grant insert (user_id, residence_area, destination, purpose, employment, answers, last_step)
  on public.applications to authenticated;
