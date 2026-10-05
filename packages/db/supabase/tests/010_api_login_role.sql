-- The backend's login role can become the three roles it works as, and is
-- nothing by itself.

begin;
select plan(11);

create extension if not exists pgtap with schema extensions;

select ok(
  (select rolcanlogin and not rolinherit from pg_roles where rolname = 'visa_api'),
  'visa_api logs in, and inherits nothing from the roles it belongs to'
);
select ok(
  (select not rolsuper and not rolcreaterole and not rolcreatedb and not rolbypassrls
     from pg_roles where rolname = 'visa_api'),
  'visa_api cannot create roles or databases, and does not bypass row-level security'
);
select is(
  (select array_agg(r.rolname::text order by r.rolname)
     from pg_auth_members m
     join pg_roles r on r.oid = m.roleid
     join pg_roles u on u.oid = m.member
    where u.rolname = 'visa_api'),
  array['anon', 'authenticated', 'service_role'],
  'visa_api may become anon, authenticated and service_role, and no other role'
);
select ok(
  not pg_has_role('visa_api', 'postgres', 'member')
    and not pg_has_role('visa_api', 'supabase_admin', 'member'),
  'visa_api cannot become an administrative role'
);
select ok(
  not exists (
    select 1 from pg_auth_members m join pg_roles u on u.oid = m.member
     where u.rolname = 'visa_api' and m.admin_option
  ),
  'visa_api cannot grant the roles it holds to anyone else'
);

-- Nothing in the product's tables without switching first.
select ok(
  not has_table_privilege('visa_api', 'public.applications', 'select')
    and not has_table_privilege('visa_api', 'public.jobs', 'select')
    and not has_table_privilege('visa_api', 'public.uploads', 'select')
    and not has_table_privilege('visa_api', 'public.answer_sources', 'select'),
  'visa_api reads no product table as itself'
);
select ok(
  not has_table_privilege('visa_api', 'public.jobs', 'insert')
    and not has_table_privilege('visa_api', 'public.uploads', 'update'),
  'visa_api writes no product table as itself'
);
select ok(
  not has_table_privilege('visa_api', 'storage.objects', 'select'),
  'visa_api reads no stored object as itself'
);

-- The account check, and nothing else of auth.
select ok(
  not has_schema_privilege('visa_api', 'auth', 'usage'),
  'visa_api cannot reach the auth schema at all'
);
select ok(
  has_function_privilege('visa_api', 'api_private.account_is_active(uuid, uuid)', 'execute'),
  'visa_api can ask whether an account and its session are still live'
);
select ok(
  not has_function_privilege('authenticated', 'api_private.account_is_active(uuid, uuid)', 'execute')
    and not has_function_privilege('anon', 'api_private.account_is_active(uuid, uuid)', 'execute')
    and not has_schema_privilege('authenticated', 'api_private', 'usage')
    and not has_schema_privilege('anon', 'api_private', 'usage'),
  'no client can ask it: the question is the backend''s'
);

select * from finish();
rollback;
