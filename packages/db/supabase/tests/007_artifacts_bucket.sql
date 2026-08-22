-- The artifacts bucket: private, and reachable by no client at all.
begin;
select plan(3);

create extension if not exists pgtap with schema extensions;

select is(
  (select public from storage.buckets where id = 'artifacts'),
  false,
  'the artifacts bucket exists and is private'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- No policy names this bucket, so a signed-in client sees nothing in it.
select is(
  (select count(*) from storage.objects where bucket_id = 'artifacts'),
  0::bigint,
  'a signed-in client sees no artifact objects'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('artifacts', 'sneak/attempt.txt') $$,
  NULL,
  'and cannot write into the bucket'
);

select * from finish();
rollback;
