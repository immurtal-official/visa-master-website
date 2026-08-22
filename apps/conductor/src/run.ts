import type { Pool } from "pg";
import type { Executor } from "@visa-master/executors/contract";
import type { ConductorConfig } from "./config";
import { scratchDirFor } from "./executors/fake";
import {
  claimNextJob,
  failJob,
  heartbeat,
  markRunning,
  markSucceeded,
  markValidating,
  type JobRow,
} from "./lease";
import { readQaVerdict } from "./qa";
import { routeToExecutor, type ExecutorRegistry } from "./router";

export interface RunOutcome {
  jobId: string;
  state: "succeeded" | "failed" | "timed_out" | "queued";
}

/**
 * Take one job through to a terminal state.
 *
 * The shape of this function is the shape of the contract: start, poll until
 * the artifact appears, collect it, read the agent's own QA verdict, destroy
 * the scratch. Nothing here waits on a process to exit, and the scratch is
 * removed on every path out — it holds a passport scan and a bank statement in
 * the real thing, and the machine is not supposed to keep either between jobs.
 */
export async function runJob(
  pool: Pool,
  job: JobRow,
  registry: ExecutorRegistry,
  config: ConductorConfig,
): Promise<RunOutcome> {
  const executor: Executor | null = routeToExecutor(job.task_type, registry);

  if (!executor) {
    // Nothing can run it, so it is not worth retrying: another attempt would
    // reach the same missing executor.
    await failJob(
      pool,
      job.id,
      config.leaseOwner,
      "validation_failed",
      `no executor for ${job.task_type}`,
    );
    return { jobId: job.id, state: "failed" };
  }

  await markRunning(pool, job.id, config.leaseOwner);

  const scratchDir = scratchDirFor(job.id, job.attempt);
  const deadline = Date.now() + job.deadline_seconds * 1000;
  const controller = new AbortController();

  const handle = await executor.start(job, {
    scratchDir,
    artifactPrefix: `applications/${job.id}/attempts/${job.attempt}`,
    deadlineAt: new Date(deadline),
    signal: controller.signal,
  });

  try {
    let lastBeat = 0;

    for (;;) {
      // The deadline is enforced here as well as by the reaper. The reaper is
      // the backstop for a conductor that dies; this is what stops a run that
      // is merely slow, without waiting for a sweep to come round.
      if (Date.now() > deadline) {
        controller.abort();
        await failJob(
          pool,
          job.id,
          config.leaseOwner,
          "wall_clock_exceeded",
          "the run passed its wall-clock deadline",
        );
        return { jobId: job.id, state: "timed_out" };
      }

      if (Date.now() - lastBeat > config.heartbeatSeconds * 1000) {
        const held = await heartbeat(pool, job.id, config);
        if (!held) {
          // The lease was taken away — the reaper decided this worker was gone.
          // Whatever is running is now somebody else's problem to re-run, and
          // continuing would mean two workers on one job.
          controller.abort();
          return { jobId: job.id, state: "queued" };
        }
        lastBeat = Date.now();
      }

      const status = await executor.poll(handle);

      if (status === "failed") {
        const { requeued } = await failJob(
          pool,
          job.id,
          config.leaseOwner,
          "agent_error",
          "the executor reported a failure",
        );
        return { jobId: job.id, state: requeued ? "queued" : "failed" };
      }

      if (status === "artifact_ready") {
        await markValidating(pool, job.id, config.leaseOwner);

        // Collect first, whatever the verdict turns out to be: a rejected pack
        // is precisely the thing an operator will want to open, and the scratch
        // it lives in is destroyed on the way out of this function.
        //
        // Collection itself can throw — the report may be missing or not be
        // JSON, which is a real outcome and not an edge case: the producer
        // gives up before writing one on several preconditions. Left
        // uncaught it escapes to the main loop and strands the row in
        // `validating` until the reaper calls it worker_lost a minute later.
        let collected;
        try {
          collected = await executor.collect(handle);
        } catch (error) {
          const { requeued } = await failJob(
            pool,
            job.id,
            config.leaseOwner,
            "validation_failed",
            `the qa report could not be collected (${errorName(error)})`,
          );
          return { jobId: job.id, state: requeued ? "queued" : "failed" };
        }

        // `validating` now labels something: the agent's own verdict is read
        // before anything is called done.
        const verdict = readQaVerdict(collected.qaReport);
        if (!verdict.ok) {
          const { requeued } = await failJob(
            pool,
            job.id,
            config.leaseOwner,
            verdict.code,
            verdict.detail,
          );
          return { jobId: job.id, state: requeued ? "queued" : "failed" };
        }

        await markSucceeded(pool, job.id, config.leaseOwner, collected);
        return { jobId: job.id, state: "succeeded" };
      }

      await sleep(250);
    }
  } finally {
    // Always: a container left behind is a container still holding documents.
    await executor.destroy(handle);
  }
}

/** Claim and run one job, if there is one. Returns null when the queue is empty. */
export async function runOnce(
  pool: Pool,
  registry: ExecutorRegistry,
  config: ConductorConfig,
): Promise<RunOutcome | null> {
  const job = await claimNextJob(pool, config);
  if (!job) return null;
  return runJob(pool, job, registry, config);
}

/**
 * The class of a thrown value, for the failure record.
 *
 * Deliberately not the message: a collection failure's message carries the
 * scratch path and sometimes a fragment of the file, and `jobs.error` is
 * readable by the applicant's own session through row-level security.
 */
function errorName(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
