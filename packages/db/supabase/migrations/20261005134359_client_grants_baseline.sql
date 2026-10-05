-- State every client privilege on public tables outright, instead of relying on
-- what the platform's default ACL happens to leave out.
--
-- The earlier migrations were written against a default ACL that gave anon and
-- authenticated only Dxtm on new tables — no select, insert, update or delete —
-- so each of them granted what clients need and revoked the rest from anon
-- alone. Newer Supabase images ship a default ACL of arwdDxtm for both roles.
-- Against those, `authenticated` keeps table-wide INSERT and UPDATE on
-- `uploads` and table-wide UPDATE on `applications`, and the column-scoped
-- grants beside them restrict nothing: a signed-in client can declare its own
-- upload `stored` and mark its own application submitted, both of which are
-- server decisions. Row-level security still confines each client to its own
-- rows, which is why nothing looked wrong; the column grants were the only gate
-- on those columns.
--
-- So every client-facing table is reset to nothing for both client roles and
-- granted again exactly what the migrations that created it intended. The
-- grants are restated here in full, including draft_answers, so this file is
-- the one place to read a table's client posture. TRUNCATE, REFERENCES,
-- TRIGGER and MAINTAIN go with the reset: no client path needs them, and
-- TRUNCATE is not subject to row-level security at all.

-- profiles: readable by its owner (row-level security); the owner may change
-- their interface language, and everything else is written by the signup
-- trigger and the server.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (locale) on public.profiles to authenticated;

-- jobs: readable by their owner; enqueueing and leasing are server writes.
revoke all on public.jobs from anon, authenticated;
grant select on public.jobs to authenticated;

-- usage_events: server-only, in both directions.
revoke all on public.usage_events from anon, authenticated;

-- applications: the owner's own working draft. Submission columns
-- (submitted_job_id, submitted_at) are the server's.
revoke all on public.applications from anon, authenticated;
grant select, delete on public.applications to authenticated;
grant insert (user_id, residence_area, destination, purpose, employment, answers, last_step,
              draft_answers)
  on public.applications to authenticated;
grant update (residence_area, destination, purpose, employment, answers, last_step, status,
              draft_answers)
  on public.applications to authenticated;

-- waitlist_entries: write-only demand data.
revoke all on public.waitlist_entries from anon, authenticated;
grant insert on public.waitlist_entries to anon, authenticated;

-- uploads: the client announces, replaces and removes its own documents, but
-- `status` is the server's word for "the object is really there".
revoke all on public.uploads from anon, authenticated;
grant select, delete on public.uploads to authenticated;
grant insert (id, application_id, user_id, document, page, storage_path, content_type,
              original_name)
  on public.uploads to authenticated;
grant update (page, content_type, size_bytes, original_name)
  on public.uploads to authenticated;

-- And the next table starts closed. Whatever a future migration does not
-- grant, a client does not have — the same posture 20260811041953 already
-- set for sequences.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
