import type { Pool } from "pg";
import { failJob } from "./lease";

export interface SweepResult {
  lost: string[];
  timedOut: string[];
}

/**
 * Find the jobs nobody is looking after any more.
 *
 * Two different failures, and they are not interchangeable. A job whose
 * heartbeat stopped has lost its worker: the work may have been fine, so it is
 * worth another attempt. A job past its deadline is one that ran too long: the
 * attempt is over regardless of who is watching, and it gets exactly one more
 * chance because a run that hangs once often hangs again.
 *
 * Without this, a conductor that is killed mid-run leaves a job marked
 * `running` for ever, and nothing in the product ever notices.
 */
export async function sweep(
  pool: Pool,
  { heartbeatTimeoutSeconds }: { heartbeatTimeoutSeconds: number },
): Promise<SweepResult> {
  const result: SweepResult = { lost: [], timedOut: [] };

  // Past the wall clock first: a job can be both late and abandoned, and the
  // more specific explanation is the useful one.
  const { rows: late } = await pool.query<{ id: string; lease_owner: string | null }>(
    `select id, lease_owner
     from public.jobs
     where state in ('leased','running','validating')
       and started_at is not null
       and now() > started_at + make_interval(secs => deadline_seconds::numeric)`,
  );

  for (const job of late) {
    await failJob(
      pool,
      job.id,
      null,
      "wall_clock_exceeded",
      "the run passed its wall-clock deadline and was stopped",
    );
    result.timedOut.push(job.id);
  }

  const { rows: abandoned } = await pool.query<{ id: string }>(
    `select id
     from public.jobs
     where state in ('leased','running','validating')
       and heartbeat_at is not null
       and now() > heartbeat_at + make_interval(secs => $1::numeric)`,
    [heartbeatTimeoutSeconds],
  );

  for (const job of abandoned) {
    await failJob(pool, job.id, null, "worker_lost", "the worker stopped reporting in");
    result.lost.push(job.id);
  }

  return result;
}
