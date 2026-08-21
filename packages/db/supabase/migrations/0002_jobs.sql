-- The job queue, and the state machine the conductor runs against.
--
-- This is architecture v0.4 Chapter B's jobs table, not the minimal sketch in
-- the platform document. The difference matters: the sketch omits the attempt
-- counters, the idempotency key and the budget columns, and each of those is
-- something that has to exist before the first job runs rather than after the
-- first incident.
--
-- The table is also the interface between the two planes. The agent VM makes
-- no inbound connections; it leases work by polling this table over TLS with
-- FOR UPDATE SKIP LOCKED, and reports back by updating these rows.

create table public.jobs (
  id               uuid primary key default gen_random_uuid(),

  -- The case this job belongs to. The cases table arrives with the review gate;
  -- until then the column exists so the shape is right and the FK lands later.
  case_id          uuid,
  -- Denormalized so quota queries do not need a join. Note this is the row
  -- knowing who owns the work — the payload below must not repeat it.
  user_id          uuid not null references auth.users (id),

  -- Canonical task names. Versioned wire strings like 'pack.schengen.v1'
  -- resolve to these in packages/core; the database stores one vocabulary.
  task_type        text not null
                   check (task_type in ('intake_chat','requirements_check',
                          'doc_field_extraction','translation','itinerary_draft',
                          'produce_pack','qa_check','custom_research')),
  -- Which kind of worker runs it. 'backend_code' covers the tasks that are
  -- deterministic code in the trusted zone and touch no model at all.
  executor_kind    text not null
                   check (executor_kind in ('llm_gateway','custom_agent','hermes','backend_code')),
  -- Set at lease time; agent_servers arrives with the registry.
  agent_server_id  uuid,

  state            text not null default 'queued'
                   check (state in ('queued','leased','running','awaiting_input',
                          'validating','succeeded','failed','cancelled','timed_out')),
  priority         smallint not null default 100,   -- lower runs sooner
  attempt          smallint not null default 0,
  max_attempts     smallint not null default 2,
  -- Dedupes a double submission into one job rather than one bill per click.
  idempotency_key  text unique,

  -- The sanitized task payload. No user id, no email address, no token ever
  -- goes in here: the untrusted agent reads this, and it is given the work
  -- without being given the person. Uploads appear as storage keys and hashes,
  -- never as bytes.
  input            jsonb not null,
  result           jsonb,   -- completion report; large output goes to storage
  error            jsonb,   -- {code, retryable, detail}
  -- Set when a run fails or a reviewer rejects: structured enough that the
  -- resubmit screen can be built from it rather than from prose.
  failure_reason   text,

  max_tokens_total int not null default 400000,
  max_cost_usd     numeric(8,2) not null default 5.00,
  -- Metered by the gateway, which is the only place model calls egress from.
  -- Never taken from what the agent reports about itself.
  tokens_in        bigint,
  tokens_out       bigint,

  -- Active run time, counted from lease. Queue wait never consumes run budget,
  -- and a paused run does not either. 20 minutes is the steady-state target for
  -- a pack against an observed ten-minute run; the beta cap is set per job at
  -- enqueue while the variance is still being measured.
  deadline_seconds int not null default 1200,

  created_at       timestamptz not null default now(),
  leased_at        timestamptz,
  -- The worker renews this by heartbeat. An expired lease means the worker
  -- died, and the job is requeued or failed rather than left running forever.
  lease_expires_at timestamptz,
  started_at       timestamptz,
  -- Written by the worker, never by the agent: a process cannot be trusted to
  -- report that it is healthy.
  heartbeat_at     timestamptz,
  finished_at      timestamptz,
  updated_at       timestamptz not null default now()
);

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- Partial indexes so the two hot queries stay cheap as finished work piles up:
-- the dequeue only ever looks at queued rows, and the reaper only at leases
-- that can expire.
create index jobs_queue_idx  on public.jobs (priority, created_at) where state = 'queued';
create index jobs_reaper_idx on public.jobs (lease_expires_at)
  where state in ('leased','running','awaiting_input','validating');
create index jobs_case_idx   on public.jobs (case_id, created_at desc);
create index jobs_user_idx   on public.jobs (user_id, created_at desc);

alter table public.jobs enable row level security;

-- Users read their own work; every write goes through the server.
-- Enqueueing is not a client decision: it costs money, it is quota-checked, and
-- the payload has to be built and sanitized server-side. There is therefore no
-- insert or update policy, and the privileges are revoked as well.
create policy "jobs_select_own" on public.jobs
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.jobs from anon;
revoke insert, update, delete on public.jobs from authenticated;
grant select on public.jobs to authenticated;
