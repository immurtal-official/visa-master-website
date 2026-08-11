-- Which process holds a lease.
--
-- agent_server_id says which server will do the work; this says which running
-- process claimed it. They are different questions, and liveness needs the
-- second one: two conductor processes share a machine (staging and production
-- units on the same VM), and a lease that expires has to be attributable to the
-- instance that stopped heartbeating rather than to the host it ran on.
--
-- Architecture v0.4 Chapter A names this field in the lease; Chapter B's DDL
-- carries only the server reference, so this restores it.
alter table public.jobs add column lease_owner text;

comment on column public.jobs.lease_owner is
  'Identity of the process holding the lease. Cleared when the lease is released or reaped.';

-- The reaper looks for leases whose heartbeat has stopped, so it reads this
-- alongside the existing partial index on lease_expires_at.
