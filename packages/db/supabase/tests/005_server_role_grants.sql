-- The server role can do its job, and clients gained nothing by it.
--
-- These assertions exist because the gap they cover was invisible: every
-- client path worked, so nothing failed until a server-side path was tried for
-- the first time. Privileges are worth asserting for the same reason policies
-- are — a missing grant and a missing policy both look like working code.

begin;
select plan(12);

create extension if not exists pgtap with schema extensions;

-- What the server needs in order to run the pipeline at all.
select ok(
  has_table_privilege('service_role', 'public.jobs', 'insert'),
  'the server can enqueue a job'
);
select ok(
  has_table_privilege('service_role', 'public.jobs', 'select')
    and has_table_privilege('service_role', 'public.jobs', 'update'),
  'and can lease one: the conductor reads a queued job and claims it'
);
select ok(
  has_table_privilege('service_role', 'public.usage_events', 'insert'),
  'the gateway can record what a call cost'
);
select ok(
  has_table_privilege('service_role', 'public.applications', 'update'),
  'and the server can mark an application submitted'
);

-- A write that asks for its row back needs select as well, which is how
-- PostgREST issues them by default.
select ok(
  has_table_privilege('service_role', 'public.applications', 'select'),
  'a server write can return the row it wrote'
);

-- The client posture is unchanged by any of it.
select ok(
  not has_table_privilege('authenticated', 'public.jobs', 'insert'),
  'a client still cannot enqueue work'
);
select ok(
  not has_table_privilege('authenticated', 'public.usage_events', 'select'),
  'and still cannot read metering'
);
select ok(
  not has_table_privilege('anon', 'public.profiles', 'select'),
  'a signed-out request still reaches nothing'
);

-- Submission columns are server-only at insert time as well as at update time.
select ok(
  has_column_privilege('authenticated', 'public.applications', 'answers', 'insert'),
  'a client can create an application with its own answers'
);
select ok(
  not has_column_privilege('authenticated', 'public.applications', 'submitted_job_id', 'insert'),
  'but cannot claim it is already submitted'
);

-- Sequences follow their tables: update on a sequence carries setval.
select ok(
  not has_sequence_privilege('authenticated', 'public.usage_events_id_seq', 'update'),
  'a client cannot move the metering sequence'
);

-- The signup trigger function is SECURITY DEFINER and owned by a role that
-- bypasses row-level security.
select ok(
  not has_function_privilege('anon', 'public.handle_new_user()', 'execute'),
  'and cannot call the security-definer signup function directly'
);

select * from finish();
rollback;
