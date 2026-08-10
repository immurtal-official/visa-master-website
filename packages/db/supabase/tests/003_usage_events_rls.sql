-- Row-level security on usage_events.
--
-- This table is the record of what was spent, so it is never client-readable
-- (it leaks the shape of the pipeline) and never client-writable (a client
-- could otherwise understate its own usage). Both directions are asserted for
-- both roles, because "no policy exists" is only safe as long as the grants
-- stay revoked, and a widened grant is exactly the kind of change that looks
-- harmless in review.

begin;
select plan(4);

create extension if not exists pgtap with schema extensions;

insert into auth.users (id, email, instance_id)
values ('11111111-1111-1111-1111-111111111111', 'a@example.test',
        '00000000-0000-0000-0000-000000000000');

insert into public.usage_events (user_id, provider, model, prompt_tokens, completion_tokens, cost_usd)
values ('11111111-1111-1111-1111-111111111111', 'anthropic', 'claude-sonnet-class', 15000, 1000, 0.06);

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select throws_ok(
  $$ select count(*) from public.usage_events $$,
  '42501',
  null,
  'a signed-in user cannot read metering, not even their own'
);

select throws_ok(
  $$ insert into public.usage_events (user_id, provider, model)
     values ('11111111-1111-1111-1111-111111111111', 'anthropic', 'claude-sonnet-class') $$,
  '42501',
  null,
  'and cannot write metering rows'
);

reset role;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok(
  $$ select count(*) from public.usage_events $$,
  '42501',
  null,
  'a signed-out request cannot read metering'
);

select throws_ok(
  $$ insert into public.usage_events (user_id, provider, model)
     values ('11111111-1111-1111-1111-111111111111', 'anthropic', 'claude-sonnet-class') $$,
  '42501',
  null,
  'and cannot write it either'
);

select * from finish();
rollback;
