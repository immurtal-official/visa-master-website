-- What clients hold on public tables is what the migrations state, whatever
-- the platform's default ACL is.
--
-- 004 and 006 catch the two columns that matter most by trying to write them.
-- These assertions read the privileges themselves, because a default ACL that
-- grants more than the migrations expected makes every client path work while
-- every column-scoped restriction stops meaning anything.

begin;
select plan(13);

create extension if not exists pgtap with schema extensions;

-- The server-decided columns.
select ok(
  not has_column_privilege('authenticated', 'public.uploads', 'status', 'insert')
    and not has_column_privilege('authenticated', 'public.uploads', 'status', 'update'),
  'a client cannot set an upload''s status, at insert or after'
);
select ok(
  not has_column_privilege('authenticated', 'public.applications', 'submitted_job_id', 'update')
    and not has_column_privilege('authenticated', 'public.applications', 'submitted_at', 'update'),
  'a client cannot record a submission'
);
select ok(
  not has_column_privilege('authenticated', 'public.applications', 'submitted_job_id', 'insert')
    and not has_column_privilege('authenticated', 'public.applications', 'submitted_at', 'insert'),
  'nor create an application that arrives already submitted'
);

-- Column-scoped grants only mean something when there is no table-wide one.
select ok(
  not has_table_privilege('authenticated', 'public.uploads', 'insert')
    and not has_table_privilege('authenticated', 'public.uploads', 'update'),
  'uploads carry no table-wide insert or update for clients'
);
select ok(
  not has_table_privilege('authenticated', 'public.applications', 'insert')
    and not has_table_privilege('authenticated', 'public.applications', 'update'),
  'applications carry no table-wide insert or update for clients'
);

-- What the client paths need is still there.
select ok(
  has_column_privilege('authenticated', 'public.applications', 'answers', 'update')
    and has_column_privilege('authenticated', 'public.applications', 'draft_answers', 'update')
    and has_column_privilege('authenticated', 'public.applications', 'last_step', 'update'),
  'a client can still autosave answers, drafts and the resume point'
);
select ok(
  has_column_privilege('authenticated', 'public.uploads', 'document', 'insert')
    and has_column_privilege('authenticated', 'public.uploads', 'storage_path', 'insert')
    and has_table_privilege('authenticated', 'public.uploads', 'delete'),
  'a client can still announce and remove its own documents'
);

-- Read-only and server-only tables.
select ok(
  has_table_privilege('authenticated', 'public.jobs', 'select')
    and not has_table_privilege('authenticated', 'public.jobs', 'insert')
    and not has_table_privilege('authenticated', 'public.jobs', 'update')
    and not has_table_privilege('authenticated', 'public.jobs', 'delete'),
  'jobs are read-only to their owner'
);
select ok(
  not has_table_privilege('authenticated', 'public.profiles', 'update')
    and not has_table_privilege('authenticated', 'public.profiles', 'insert')
    and has_column_privilege('authenticated', 'public.profiles', 'locale', 'update'),
  'a profile''s owner can change its interface language and nothing else'
);
select ok(
  not has_table_privilege('authenticated', 'public.usage_events', 'select')
    and not has_table_privilege('authenticated', 'public.usage_events', 'insert'),
  'metering is invisible to clients'
);

-- TRUNCATE is not subject to row-level security, so no client may hold it.
select is(
  (select count(*) from pg_class c
    where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p')
      and (has_table_privilege('authenticated', c.oid, 'truncate')
        or has_table_privilege('anon', c.oid, 'truncate'))),
  0::bigint,
  'no client role can truncate any public table'
);

-- Signed out reaches nothing but the waiting list.
select is(
  (select count(*) from pg_class c
    where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p')
      and c.relname <> 'waitlist_entries'
      and (has_table_privilege('anon', c.oid, 'select')
        or has_table_privilege('anon', c.oid, 'insert')
        or has_table_privilege('anon', c.oid, 'update')
        or has_table_privilege('anon', c.oid, 'delete'))),
  0::bigint,
  'a signed-out request holds nothing on any table but the waiting list'
);

-- And the next table starts closed: a table created the way migrations create
-- them grants clients nothing until a migration says otherwise.
create table public.grants_probe (id int);
select ok(
  not has_table_privilege('authenticated', 'public.grants_probe', 'select')
    and not has_table_privilege('authenticated', 'public.grants_probe', 'insert')
    and not has_table_privilege('authenticated', 'public.grants_probe', 'update')
    and not has_table_privilege('anon', 'public.grants_probe', 'select'),
  'a new table grants clients nothing by default'
);

select * from finish();
rollback;
