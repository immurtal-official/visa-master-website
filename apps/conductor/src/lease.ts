import type { Pool } from "pg";
import type { JobRow as ExecutorJobRow } from "@visa-master/executors/contract";

/**
 * A job as the conductor reads it.
 *
 * The executor contract already says what a job row is, so this extends that
 * rather than describing it a second time: two definitions of the same row are
 * two things to keep in step with one migration.
 */
export interface JobRow extends ExecutorJobRow {
  user_id: string;
  started_at: string | null;
}

/**
 * Claim one queued job, or return nothing.
 *
 * `FOR UPDATE SKIP LOCKED` is the whole reason this can be a plain table rather
 * than a queue service: two conductors running the same statement cannot claim
 * the same row, because the second one steps over what the first has locked
 * instead of waiting behind it. The claim and the state change happen in one
 * statement, so there is no window where a job is taken but not marked.
 *
 * The attempt counter goes up here, at the moment work is handed out, so a
 * process that dies mid-run has still spent an attempt — otherwise a job that
 * kills its worker is retried for ever.
 */
export async function claimNextJob(
  pool: Pool,
  { leaseOwner, leaseSeconds }: { leaseOwner: string; leaseSeconds: number },
): Promise<JobRow | null> {
  const { rows } = await pool.query<JobRow>(
    `
    with next as (
      select id from public.jobs
      where state = 'queued'
      order by priority, created_at
      for update skip locked
      limit 1
    )
    update public.jobs j
    set state = 'leased',
        lease_owner = $1,
        leased_at = now(),
        lease_expires_at = now() + make_interval(secs => $2::numeric),
        heartbeat_at = now(),
        attempt = j.attempt + 1
    from next
    where j.id = next.id
    returning j.id, j.user_id, j.task_type, j.executor_kind, j.state,
              j.attempt, j.max_attempts, j.input, j.deadline_seconds, j.started_at,
              j.max_tokens_total, j.max_cost_usd
    `,
    [leaseOwner, leaseSeconds],
  );

  return rows[0] ?? null;
}

/**
 * Mark a claimed job as running.
 *
 * `started_at` is set here rather than at claim time because the wall clock
 * measures the run, and the moments differ by however long it takes to start a
 * container.
 */
export async function markRunning(pool: Pool, jobId: string, leaseOwner: string): Promise<void> {
  await pool.query(
    `update public.jobs
     set state = 'running', started_at = now()
     where id = $1 and lease_owner = $2`,
    [jobId, leaseOwner],
  );
}

/**
 * Renew the lease.
 *
 * Written by the conductor, never by the thing it is supervising: a process
 * cannot be trusted to report that it is healthy, and the whole point of the
 * heartbeat is to notice when it stops being able to.
 *
 * Returns false when the lease is no longer ours — the reaper took it — which
 * is the signal to stop working on it.
 */
export async function heartbeat(
  pool: Pool,
  jobId: string,
  { leaseOwner, leaseSeconds }: { leaseOwner: string; leaseSeconds: number },
): Promise<boolean> {
  const { rowCount } = await pool.query(
    `update public.jobs
     set heartbeat_at = now(),
         lease_expires_at = now() + make_interval(secs => $3::numeric)
     where id = $1 and lease_owner = $2
       and state in ('leased','running','validating')`,
    [jobId, leaseOwner, leaseSeconds],
  );

  return (rowCount ?? 0) > 0;
}

export async function markValidating(pool: Pool, jobId: string, leaseOwner: string): Promise<void> {
  await pool.query(
    `update public.jobs set state = 'validating' where id = $1 and lease_owner = $2`,
    [jobId, leaseOwner],
  );
}

export async function markSucceeded(
  pool: Pool,
  jobId: string,
  leaseOwner: string,
  result: unknown,
): Promise<void> {
  await pool.query(
    `update public.jobs
     set state = 'succeeded', result = $3, finished_at = now(),
         lease_owner = null, lease_expires_at = null
     where id = $1 and lease_owner = $2`,
    [jobId, leaseOwner, JSON.stringify(result)],
  );
}

/** Failure classes, and whether another attempt is allowed for each. */
export type FailureCode =
  | "agent_error"
  | "wall_clock_exceeded"
  | "budget_exceeded"
  | "qa_failed"
  | "validation_failed"
  | "worker_lost";

export function isRetryable(code: FailureCode): boolean {
  // Spending the same money twice on the same refusal helps nobody, so a job
  // that ran out of budget waits for someone to decide rather than retrying.
  // Everything else is worth another attempt while attempts remain.
  return code !== "budget_exceeded";
}

/**
 * Record a failure, and decide whether it goes back in the queue.
 *
 * A job with attempts left returns to `queued`; one without becomes terminal.
 * A timeout is terminal in its own right — `timed_out` rather than `failed` —
 * because the difference matters when reading what happened later.
 */
export async function failJob(
  pool: Pool,
  jobId: string,
  leaseOwner: string | null,
  code: FailureCode,
  detail: string,
): Promise<{ requeued: boolean }> {
  const owner = leaseOwner ? "and lease_owner = $2" : "";
  const params = leaseOwner ? [jobId, leaseOwner] : [jobId];

  const { rows } = await pool.query<{ attempt: number; max_attempts: number }>(
    `select attempt, max_attempts from public.jobs where id = $1 ${owner ? "and lease_owner = $2" : ""}`,
    params,
  );

  const job = rows[0];
  if (!job) return { requeued: false };

  const retry = isRetryable(code) && job.attempt < job.max_attempts;
  const terminal = code === "wall_clock_exceeded" ? "timed_out" : "failed";

  await pool.query(
    `update public.jobs
     set state = $2,
         error = $3::jsonb,
         failure_reason = $4,
         lease_owner = null,
         lease_expires_at = null,
         finished_at = case when $2 = 'queued' then null else now() end
     where id = $1`,
    [
      jobId,
      retry ? "queued" : terminal,
      JSON.stringify({ code, detail, retryable: isRetryable(code), attempt: job.attempt }),
      code,
    ],
  );

  return { requeued: retry };
}
