-- Row-level security on profiles, asserted rather than reviewed.
--
-- "The dashboard is behind RLS" is a claim about policies, and policies are
-- easy to write and easy to get subtly wrong. These tests are what make the
-- claim checkable: one user cannot see another's row, a client can change its
-- own language and nothing else, and a signed-out request sees nothing at all.

begin;
select plan(9);

create extension if not exists pgtap with schema extensions;

-- Two users, inserted as the owner role. This also exercises the signup
-- trigger: no profiles row is inserted here, so every row the tests find was
-- created by handle_new_user.
insert into auth.users (id, email, instance_id)
values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test', '00000000-0000-0000-0000-000000000000');

select is(
  (select count(*) from public.profiles),
  2::bigint,
  'the signup trigger creates a profile for every auth user'
);

select is(
  (select role from public.profiles where user_id = '11111111-1111-1111-1111-111111111111'),
  'user',
  'a new profile starts with the lowest role'
);

-- Become the first user.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*) from public.profiles),
  1::bigint,
  'a signed-in user sees exactly one profile'
);

select is(
  (select user_id from public.profiles),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'and it is their own'
);

select lives_ok(
  $$ update public.profiles set locale = 'en' where user_id = '11111111-1111-1111-1111-111111111111' $$,
  'a user can change their own interface language'
);

select throws_ok(
  $$ update public.profiles set role = 'admin' where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501',
  null,
  'a user cannot promote themselves: role is server-managed'
);

select throws_ok(
  $$ insert into public.profiles (user_id) values ('33333333-3333-3333-3333-333333333333') $$,
  '42501',
  null,
  'a user cannot create profile rows'
);

select throws_ok(
  $$ delete from public.profiles where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501',
  null,
  'a user cannot delete their profile row directly'
);

-- Signed out. Note this is stronger than an empty result: the select privilege
-- is revoked from anon outright, so the table is not reachable at all rather
-- than reachable and filtered.
reset role;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok(
  $$ select count(*) from public.profiles $$,
  '42501',
  null,
  'a signed-out request cannot read profiles at all'
);

select * from finish();
rollback;
