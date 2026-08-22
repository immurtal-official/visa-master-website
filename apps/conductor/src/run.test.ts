import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { access } from "node:fs/promises";
import { Pool } from "pg";
import { readConfig } from "./config";
import { createFakeExecutor, scratchDirFor } from "./executors/fake";
import { claimNextJob, markRunning } from "./lease";
import { runOnce } from "./run";
import { sweep } from "./watchdog";
import type { ExecutorRegistry } from "./router";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const pool = new Pool({ connectionString: DATABASE_URL, max: 6 });

const config = readConfig({
  DATABASE_URL,
  CONDUCTOR_ID: "test-runner",
  // Short enough that a test can watch a lease expire without waiting a minute.
  LEASE_SECONDS: "2",
  HEARTBEAT_SECONDS: "0",
  HEARTBEAT_TIMEOUT_SECONDS: "1",
} as NodeJS.ProcessEnv);

afterAll(async () => {
  await pool.end();
});

let userId: string;

beforeEach(async () => {
  // Only ever this suite's own rows. An earlier version deleted every
  // produce_pack job, which on a developer's machine is their own work.
  await pool.query(
    `delete from public.jobs
     where user_id in (select id from auth.users where email like '%@test.local')`,
  );

  const { rows } = await pool.query<{ id: string }>(
    `insert into auth.users (id, email, instance_id)
     values (gen_random_uuid(), 'run-' || gen_random_uuid() || '@test.local',
             '00000000-0000-0000-0000-000000000000')
     returning id`,
  );
  userId = rows[0]!.id;
});

async function enqueue(
  taskType = "produce_pack",
  overrides: { deadline_seconds?: number; max_attempts?: number } = {},
): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into public.jobs (user_id, task_type, executor_kind, input, deadline_seconds, max_attempts)
     values ($1, $2, 'hermes', '{"route":"test"}'::jsonb, $3, $4)
     returning id`,
    [userId, taskType, overrides.deadline_seconds ?? 1200, overrides.max_attempts ?? 2],
  );
  return rows[0]!.id;
}

async function jobState(jobId: string) {
  const { rows } = await pool.query<{
    state: string;
    result: unknown;
    attempt: number;
    failure_reason: string | null;
    finished_at: string | null;
  }>(`select state, result, attempt, failure_reason, finished_at from public.jobs where id = $1`, [
    jobId,
  ]);
  return rows[0]!;
}

describe("running a job end to end", () => {
  it("takes it from queued to succeeded, and keeps what the run produced", async () => {
    const jobId = await enqueue();
    const registry: ExecutorRegistry = { hermes: createFakeExecutor({ runMs: 10 }) };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "succeeded" });

    const after = await jobState(jobId);
    expect(after.state).toBe("succeeded");
    expect(after.finished_at).not.toBeNull();
    // Completion is judged by the artifact, and what it said is kept.
    expect(after.result).toMatchObject({
      qaReport: { status: "visual-review-required", issues: 0 },
    });
  });

  it("destroys the scratch, whatever happened", async () => {
    const jobId = await enqueue();
    const registry: ExecutorRegistry = { hermes: createFakeExecutor({ runMs: 10 }) };

    await runOnce(pool, registry, config);

    // In the real thing this directory holds a passport scan and a bank
    // statement; the machine keeps neither between jobs.
    const { rows } = await pool.query<{ attempt: number }>(
      `select attempt from public.jobs where id = $1`,
      [jobId],
    );
    await expect(access(scratchDirFor(jobId, rows[0]!.attempt))).rejects.toThrow();
  });

  it("puts a failed run back in the queue while attempts remain", async () => {
    const jobId = await enqueue("produce_pack", { max_attempts: 2 });
    const registry: ExecutorRegistry = {
      hermes: createFakeExecutor({ runMs: 10, failWith: "the container died" }),
    };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "queued" });

    const after = await jobState(jobId);
    expect(after.state).toBe("queued");
    expect(after.attempt).toBe(1);
    expect(after.failure_reason).toBe("agent_error");
  });

  it("does not call a pack done when its own QA says it failed", async () => {
    const jobId = await enqueue("produce_pack", { max_attempts: 1 });
    const registry: ExecutorRegistry = {
      hermes: createFakeExecutor({
        runMs: 10,
        qaReport: {
          schemaVersion: "visa-master.qa.v2",
          status: "failed",
          summary: { issues: 2 },
          issues: ["PDF text extraction failed.", "Duplicate artifact detected."],
        },
      }),
    };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "failed" });

    const after = await jobState(jobId);
    // The distinction that matters: the artifact appeared, so this is not an
    // agent_error. The pack exists and is not good enough to show anyone.
    expect(after.state).toBe("failed");
    expect(after.failure_reason).toBe("qa_failed");
    expect(after.finished_at).not.toBeNull();
  });

  it("retries a QA failure while attempts remain", async () => {
    const jobId = await enqueue("produce_pack", { max_attempts: 2 });
    const registry: ExecutorRegistry = {
      hermes: createFakeExecutor({
        runMs: 10,
        qaReport: { status: "failed", issues: ["something is wrong"] },
      }),
    };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "queued" });

    const after = await jobState(jobId);
    expect(after.state).toBe("queued");
    expect(after.failure_reason).toBe("qa_failed");
  });

  it("rejects a run whose QA report cannot be judged, and calls it drift", async () => {
    // Fail closed: "we could not tell" is not evidence that a pack is good. The
    // code differs from qa_failed on purpose — this is the two repos having
    // stopped agreeing, not a pack the agent judged and rejected.
    const jobId = await enqueue("produce_pack", { max_attempts: 1 });
    const registry: ExecutorRegistry = {
      hermes: createFakeExecutor({ runMs: 10, qaReport: { summary: { issues: 0 } } }),
    };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "failed" });

    const after = await jobState(jobId);
    expect(after.failure_reason).toBe("validation_failed");
    expect(after.result).toBeNull();
  });

  it("turns a collection failure into a verdict instead of stranding the row", async () => {
    // The producer gives up before writing a report on several preconditions,
    // so a missing or unparseable file is an ordinary outcome. Before the gate
    // this threw out of the run loop and left the row in `validating` until the
    // reaper called it worker_lost a minute later.
    const jobId = await enqueue("produce_pack", { max_attempts: 1 });
    const fake = createFakeExecutor({ runMs: 10 });
    const registry: ExecutorRegistry = {
      hermes: {
        ...fake,
        async collect() {
          throw new SyntaxError("Unexpected end of JSON input");
        },
      },
    };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "failed" });

    const after = await jobState(jobId);
    expect(after.state).toBe("failed");
    expect(after.failure_reason).toBe("validation_failed");
    expect(after.finished_at).not.toBeNull();
  });

  it("accepts the full report the real producer writes", async () => {
    // The shape is copied from toolchain/qa.mjs in the agent repo rather than
    // guessed, so this test fails if that producer changes under us.
    const jobId = await enqueue();
    const registry: ExecutorRegistry = {
      hermes: createFakeExecutor({
        runMs: 10,
        qaReport: {
          schemaVersion: "visa-master.qa.v2",
          case: "chengdu-spain-tourism",
          scope: "full",
          deliveryFolder: "/opt/data/job/delivery",
          startedAt: "2026-08-21T10:00:00.000Z",
          completedAt: "2026-08-21T10:04:12.000Z",
          status: "visual-review-required",
          summary: {
            artifacts: 9,
            pages: 24,
            officialArtifacts: 3,
            visualPages: 6,
            sheets: 3,
            issues: 0,
          },
          retrievalManifest: "/opt/data/job/retrieval/manifest.json",
          issues: [],
          artifacts: [{ official: true, sha256: "abc", pages: 2 }],
          vision: { required: true, sheets: [{ file: "full-1.jpg" }] },
        },
      }),
    };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "succeeded" });
    expect((await jobState(jobId)).state).toBe("succeeded");
  });

  it("stops a run that passes its deadline", async () => {
    // One second to do work that takes ten: the conductor's own clock catches
    // it without waiting for a sweep.
    const jobId = await enqueue("produce_pack", { deadline_seconds: 1, max_attempts: 1 });
    const registry: ExecutorRegistry = { hermes: createFakeExecutor({ runMs: 10_000 }) };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "timed_out" });
    expect((await jobState(jobId)).state).toBe("timed_out");
  });

  it("fails a task no executor can run, without retrying it", async () => {
    // Another attempt would reach the same missing executor.
    const jobId = await enqueue("custom_research", { max_attempts: 3 });
    const registry: ExecutorRegistry = { hermes: createFakeExecutor({ runMs: 10 }) };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "failed" });
    expect((await jobState(jobId)).failure_reason).toBe("validation_failed");
  });

  it("does nothing when the queue is empty", async () => {
    expect(await runOnce(pool, {}, config)).toBeNull();
  });
});

describe("the watchdog", () => {
  it("releases a job whose worker stopped reporting in", async () => {
    const jobId = await enqueue();
    await claimNextJob(pool, config);
    await markRunning(pool, jobId, config.leaseOwner);

    // What a killed conductor leaves behind: a job marked running that nobody
    // is working on. Without the sweep it stays that way for ever.
    await pool.query(
      `update public.jobs set heartbeat_at = now() - interval '5 seconds' where id = $1`,
      [jobId],
    );

    const result = await sweep(pool, config);
    expect(result.lost).toContain(jobId);

    const after = await jobState(jobId);
    expect(after.state).toBe("queued");
    expect(after.failure_reason).toBe("worker_lost");
  });

  it("stops a job that is past its deadline even if its worker is alive", async () => {
    const jobId = await enqueue("produce_pack", { deadline_seconds: 1, max_attempts: 1 });
    await claimNextJob(pool, config);
    await markRunning(pool, jobId, config.leaseOwner);

    await pool.query(
      `update public.jobs set started_at = now() - interval '10 seconds' where id = $1`,
      [jobId],
    );

    const result = await sweep(pool, config);
    expect(result.timedOut).toContain(jobId);
    expect((await jobState(jobId)).state).toBe("timed_out");
  });

  it("leaves a healthy run alone", async () => {
    const jobId = await enqueue();
    await claimNextJob(pool, config);
    await markRunning(pool, jobId, config.leaseOwner);

    const result = await sweep(pool, config);
    expect(result.lost).not.toContain(jobId);
    expect(result.timedOut).not.toContain(jobId);
    expect((await jobState(jobId)).state).toBe("running");
  });
});
