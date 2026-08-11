-- Row-level security on applications and the waiting list.
--
-- Applications are the one table a client writes directly, because every
-- autosave is one of those writes. That makes the boundaries worth asserting
-- precisely: a user reaches their own drafts and no one else's, and the
-- columns that record a submission are not among the ones they can set.

begin;
select plan(9);

create extension if not exists pgtap with schema extensions;

insert into auth.users (id, email, instance_id)
values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test', '00000000-0000-0000-0000-000000000000');

insert into public.applications (id, user_id, residence_area, destination)
values
  ('aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'sichuan', 'ES'),
  ('bbbbbbbb-2222-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'sichuan', 'ES');

select is(
  (select status from public.applications where id = 'aaaaaaaa-1111-0000-0000-000000000001'),
  'draft',
  'an application starts as a draft'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*) from public.applications),
  1::bigint,
  'a user sees only their own applications'
);

select lives_ok(
  $$ update public.applications set answers = '{"passport": {"number": "E12345678"}}'::jsonb,
       last_step = 'passport'
     where id = 'aaaaaaaa-1111-0000-0000-000000000001' $$,
  'a user can autosave into their own draft'
);

select lives_ok(
  $$ insert into public.applications (user_id, residence_area, destination)
     values ('11111111-1111-1111-1111-111111111111', 'chongqing', 'ES') $$,
  'a user can create an application for themselves'
);

select throws_ok(
  $$ insert into public.applications (user_id, residence_area, destination)
     values ('22222222-2222-2222-2222-222222222222', 'sichuan', 'ES') $$,
  '42501',
  null,
  'but not one that belongs to somebody else'
);

select throws_ok(
  $$ update public.applications set submitted_at = now()
     where id = 'aaaaaaaa-1111-0000-0000-000000000001' $$,
  '42501',
  null,
  'a user cannot mark their own draft as submitted: that is a server decision'
);

select is(
  (select count(*) from public.applications
    where id = 'bbbbbbbb-2222-0000-0000-000000000002'),
  0::bigint,
  'another user''s application is invisible, so it cannot be edited either'
);

-- The waiting list is demand data rather than anyone's own record: it can be
-- added to and never read back.
select lives_ok(
  $$ insert into public.waitlist_entries (residence_area, destination)
     values ('guangdong', 'FR') $$,
  'anyone signed in can add themselves to the waiting list'
);

select throws_ok(
  $$ select count(*) from public.waitlist_entries $$,
  '42501',
  null,
  'and nobody can read it back'
);

select * from finish();
rollback;
