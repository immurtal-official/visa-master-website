-- Row-level security on uploads.
--
-- These rows point at passport scans and bank statements, which makes this the
-- most sensitive table in the schema. Two things are asserted: one applicant
-- cannot see another's documents, and no client can declare a document stored
-- — that word means the server has seen the bytes, and a client that could say
-- it could make an empty application look complete.

begin;
select plan(8);

create extension if not exists pgtap with schema extensions;

insert into auth.users (id, email, instance_id)
values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test', '00000000-0000-0000-0000-000000000000');

insert into public.applications (id, user_id, residence_area, destination)
values
  ('aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'sichuan', 'ES'),
  ('bbbbbbbb-2222-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'sichuan', 'ES');

insert into public.uploads (id, application_id, user_id, document, storage_path, content_type, status)
values
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-1111-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'passportBio',
   '11111111-1111-1111-1111-111111111111/a/1.jpg', 'image/jpeg', 'stored'),
  ('dddddddd-0000-0000-0000-000000000002', 'bbbbbbbb-2222-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222', 'passportBio',
   '22222222-2222-2222-2222-222222222222/b/1.jpg', 'image/jpeg', 'stored');

select is(
  (select status from public.uploads where id = 'cccccccc-0000-0000-0000-000000000001'),
  'stored',
  'an upload can be marked stored by the server'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*) from public.uploads),
  1::bigint,
  'an applicant sees only their own documents'
);

select is(
  (select id from public.uploads),
  'cccccccc-0000-0000-0000-000000000001'::uuid,
  'and it is their own'
);

select lives_ok(
  $$ insert into public.uploads (application_id, user_id, document, storage_path, content_type)
     values ('aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'bankStatement', '11111111-1111-1111-1111-111111111111/a/2.pdf', 'application/pdf') $$,
  'an applicant can announce a document of their own'
);

select is(
  (select status from public.uploads where document = 'bankStatement'),
  'pending',
  'and it starts pending: only the server says the bytes arrived'
);

select throws_ok(
  $$ update public.uploads set status = 'stored'
     where id = 'cccccccc-0000-0000-0000-000000000001' $$,
  '42501',
  null,
  'a client cannot declare a document stored'
);

select throws_ok(
  $$ insert into public.uploads (application_id, user_id, document, storage_path, content_type)
     values ('bbbbbbbb-2222-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
             'photo', '22222222-2222-2222-2222-222222222222/b/2.jpg', 'image/jpeg') $$,
  '42501',
  null,
  'and cannot attach a document to somebody else''s application'
);

reset role;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok(
  $$ select count(*) from public.uploads $$,
  '42501',
  null,
  'a signed-out request reaches no documents at all'
);

select * from finish();
rollback;
