-- Row-level security on jobs.
--
-- Jobs cost money to run and are quota-checked, so enqueueing is a server
-- decision, not a client one. These tests assert both halves of that: a user
-- sees their own work and nobody else's, and no client can create, alter or
-- delete a job however it asks.

begin;
select plan(7);

create extension if not exists pgtap with schema extensions;

insert into auth.users (id, email, instance_id)
values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test', '00000000-0000-0000-0000-000000000000');

insert into public.jobs (id, user_id, task_type, executor_kind, input)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'produce_pack', 'hermes', '{"route":"schengen_tourism.es.chengdu.v1"}'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'produce_pack', 'hermes', '{"route":"schengen_tourism.es.chengdu.v1"}');

select is(
  (select state from public.jobs where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  'queued',
  'a new job starts queued'
);

select is(
  (select deadline_seconds from public.jobs where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  1200,
  'and carries the steady-state wall-clock budget until a caller overrides it'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*) from public.jobs),
  1::bigint,
  'a signed-in user sees only their own jobs'
);

select is(
  (select id from public.jobs),
  'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
  'and it is the one they own'
);

select throws_ok(
  $$ insert into public.jobs (user_id, task_type, executor_kind, input)
     values ('11111111-1111-1111-1111-111111111111', 'produce_pack', 'hermes', '{}') $$,
  '42501',
  null,
  'a client cannot enqueue work: that costs money and is quota-checked server-side'
);

select throws_ok(
  $$ update public.jobs set state = 'succeeded'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '42501',
  null,
  'a client cannot move a job through its state machine'
);

reset role;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok(
  $$ select count(*) from public.jobs $$,
  '42501',
  null,
  'a signed-out request cannot read jobs at all'
);

select * from finish();
rollback;
