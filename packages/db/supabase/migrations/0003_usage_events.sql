-- Per-call model metering.
--
-- Infrastructure for this product is a fixed and small number; model usage is
-- the entire variable cost line. That makes metering a business requirement
-- rather than an observability nicety: quotas are enforced against it before a
-- job is enqueued, and the real cost per pack is measured from it rather than
-- estimated.
--
-- Rows are written by the gateway, which every model call from every executor
-- passes through. That is the point of routing them all through one place: one
-- set of provider keys, and one honest account of what was spent.

create table public.usage_events (
  id                bigint generated always as identity primary key,
  job_id            uuid references public.jobs (id),
  user_id           uuid not null references auth.users (id),
  provider          text not null
                    check (provider in ('openai','anthropic','moonshot','gemini','nous')),
  model             text not null,
  prompt_tokens     int not null default 0,
  completion_tokens int not null default 0,
  cached_tokens     int not null default 0,
  cost_usd          numeric(10,6) not null default 0,
  recorded_at       timestamptz not null default now()
);

-- The two questions asked of this table: what has this user spent in this
-- period, and what did this job cost.
create index usage_events_user_idx on public.usage_events (user_id, recorded_at);
create index usage_events_job_idx  on public.usage_events (job_id);

-- Never exposed to a client, in either direction. Reading it would leak the
-- shape of the pipeline; writing it would let a client understate its own
-- spend. Enabling RLS with no policies is the belt to the revoked grants'
-- braces: if a grant is ever widened by accident, there is still no policy to
-- allow a row through.
alter table public.usage_events enable row level security;
revoke all on public.usage_events from anon, authenticated;
