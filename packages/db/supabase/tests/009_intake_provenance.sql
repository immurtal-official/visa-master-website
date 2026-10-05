-- Where answers came from, and what was read off documents.
--
-- Both tables are written by the server alone: a client that could write a
-- document field could hand itself an answer, and a client that could write an
-- answer's source could mark a proposal confirmed without ever being shown it.
-- Both are readable by their owner and nobody else.

begin;
select plan(17);

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

-- The server writes, as the conductor and the services do.
set local role service_role;

select lives_ok(
  $$ insert into public.document_fields
       (id, upload_id, application_id, user_id, field, value, confidence, source_page)
     values
       ('eeeeeeee-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
        'passport.number', 'E12345678', 0.97, 1),
       ('eeeeeeee-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000002',
        'bbbbbbbb-2222-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
        'passport.number', 'G87654321', 0.91, 1) $$,
  'the server can record what was read off a document'
);

select lives_ok(
  $$ insert into public.answer_sources
       (application_id, user_id, path, source, document_field_id, confirmed_at, intake_version)
     values
       ('aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
        'passport.number', 'document', 'eeeeeeee-0000-0000-0000-000000000001', null, 1),
       ('aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
        'applicant.name', 'applicant', null, now(), 1),
       ('bbbbbbbb-2222-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
        'applicant.name', 'applicant', null, now(), 1) $$,
  'and where each answer came from'
);

select throws_ok(
  $$ insert into public.answer_sources
       (application_id, user_id, path, source, confirmed_at, intake_version)
     values ('aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'applicant.phone', 'applicant', null, 1) $$,
  '23514',
  null,
  'a typed answer is its own confirmation, so it cannot be recorded unconfirmed'
);

select throws_ok(
  $$ insert into public.document_fields (upload_id, application_id, user_id, field, value, confidence)
     values ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-1111-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', 'passport.issuedAt', '2020-01-01', 1.5) $$,
  '23514',
  null,
  'a confidence outside 0..1 is refused'
);

reset role;

-- The applicant's view.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*) from public.document_fields),
  1::bigint,
  'an applicant sees only what was read off their own documents'
);
select is(
  (select value from public.document_fields),
  'E12345678',
  'and it is theirs'
);
select is(
  (select count(*) from public.answer_sources),
  2::bigint,
  'an applicant sees the sources of their own answers only'
);

select throws_ok(
  $$ insert into public.document_fields (upload_id, application_id, user_id, field, value)
     values ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-1111-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', 'passport.issuedAt', '2020-01-01') $$,
  '42501',
  null,
  'a client cannot record a document field, not even on its own upload'
);

select throws_ok(
  $$ update public.answer_sources set confirmed_at = now()
     where application_id = 'aaaaaaaa-1111-0000-0000-000000000001' and path = 'passport.number' $$,
  '42501',
  null,
  'a client cannot mark a proposed answer confirmed'
);

select throws_ok(
  $$ insert into public.answer_sources (application_id, user_id, path, source, confirmed_at, intake_version)
     values ('aaaaaaaa-1111-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
             'applicant.phone', 'applicant', now(), 1) $$,
  '42501',
  null,
  'nor record a source of its own'
);

select throws_ok(
  $$ delete from public.answer_sources where application_id = 'aaaaaaaa-1111-0000-0000-000000000001' $$,
  '42501',
  null,
  'nor erase one'
);

select lives_ok(
  $$ update public.applications set intake_version = 1,
       intake_checksum = '7502e9fd56501b7e57ba400dbdeab1efe3d48048a12382445fd9f2c575c5b880'
     where id = 'aaaaaaaa-1111-0000-0000-000000000001' $$,
  'an applicant''s draft records the contract its answers were given under'
);

select throws_ok(
  $$ update public.applications set intake_checksum = 'not a checksum'
     where id = 'aaaaaaaa-1111-0000-0000-000000000001' $$,
  '23514',
  null,
  'and only something shaped like a checksum'
);

reset role;

-- Deleting a document must not promote what was read off it.
set local role service_role;
delete from public.uploads where id = 'cccccccc-0000-0000-0000-000000000001';
reset role;

select is(
  (select count(*) from public.document_fields where upload_id = 'cccccccc-0000-0000-0000-000000000001'),
  0::bigint,
  'removing an upload removes what was read off it'
);
select is(
  (select source || '/' || coalesce(confirmed_at::text, 'unconfirmed')
     from public.answer_sources
    where application_id = 'aaaaaaaa-1111-0000-0000-000000000001' and path = 'passport.number'),
  'document/unconfirmed',
  'and the answer proposed from it stays an unconfirmed proposal'
);

-- Signed out reaches neither table.
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok(
  $$ select count(*) from public.document_fields $$,
  '42501',
  null,
  'a signed-out request reaches no document fields'
);
select throws_ok(
  $$ select count(*) from public.answer_sources $$,
  '42501',
  null,
  'nor any answer''s source'
);

select * from finish();
rollback;
