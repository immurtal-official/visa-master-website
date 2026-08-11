import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { claimNextJob, failJob, heartbeat, markRunning } from "./lease";

/**
 * The queue, against a real database.
 *
 * These cannot be written against a mock and mean anything: what is being
 * checked is what Postgres does when two statements race, which is the whole
 * reason the job table can be the queue.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const pool = new Pool({ connectionString: DATABASE_URL, max: 6 });

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
     values (gen_random_uuid(), 'conductor-' || gen_random_uuid() || '@test.local',
             '00000000-0000-0000-0000-000000000000')
     returning id`,
  );
  userId = rows[0]!.id;
});

async function enqueue(overrides: Record<string, unknown> = {}): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into public.jobs (user_id, task_type, executor_kind, input, max_attempts, deadline_seconds)
     values ($1, 'produce_pack', 'hermes', '{"route":"test"}'::jsonb, $2, $3)
     returning id`,
    [userId, overrides.max_attempts ?? 2, overrides.deadline_seconds ?? 1200],
  );
  return rows[0]!.id;
}

async function stateOf(jobId: string) {
  const { rows } = await pool.query<{
    state: string;
    attempt: number;
    lease_owner: string | null;
    failure_reason: string | null;
  }>(`select state, attempt, lease_owner, failure_reason from public.jobs where id = $1`, [jobId]);
  return rows[0]!;
}

const OWNER = { leaseOwner: "test-conductor", leaseSeconds: 90 };

describe("claiming work", () => {
  it("takes the queued job and records who holds it", async () => {
    const jobId = await enqueue();

    const job = await claimNextJob(pool, OWNER);
    expect(job?.id).toBe(jobId);

    const after = await stateOf(jobId);
    expect(after.state).toBe("leased");
    expect(after.lease_owner).toBe("test-conductor");
    // The attempt is spent when the work is handed out, so a worker that dies
    // mid-run cannot be retried for ever.
    expect(after.attempt).toBe(1);
  });

  it("returns nothing when the queue is empty", async () => {
    expect(await claimNextJob(pool, OWNER)).toBeNull();
  });

  it("never hands the same job to two conductors", async () => {
    await enqueue();

    // Both statements race for one row. Without SKIP LOCKED the second would
    // block and then claim the same job; with it, the second steps over.
    const [first, second] = await Promise.all([
      claimNextJob(pool, { ...OWNER, leaseOwner: "one" }),
      claimNextJob(pool, { ...OWNER, leaseOwner: "two" }),
    ]);

    const claimed = [first, second].filter(Boolean);
    expect(claimed).toHaveLength(1);
  });

  it("gives two conductors one job each when there are two", async () => {
    await enqueue();
    await enqueue();

    const [first, second] = await Promise.all([
      claimNextJob(pool, { ...OWNER, leaseOwner: "one" }),
      claimNextJob(pool, { ...OWNER, leaseOwner: "two" }),
    ]);

    expect(first?.id).toBeDefined();
    expect(second?.id).toBeDefined();
    expect(first!.id).not.toBe(second!.id);
  });

  it("takes the oldest job first", async () => {
    const older = await enqueue();
    await pool.query(
      `update public.jobs set created_at = now() - interval '1 hour' where id = $1`,
      [older],
    );
    await enqueue();

    const job = await claimNextJob(pool, OWNER);
    expect(job?.id).toBe(older);
  });
});

describe("the heartbeat", () => {
  it("holds the lease while the job is ours", async () => {
    const jobId = await enqueue();
    await claimNextJob(pool, OWNER);
    await markRunning(pool, jobId, OWNER.leaseOwner);

    expect(await heartbeat(pool, jobId, OWNER)).toBe(true);
  });

  it("reports the lease is gone once somebody else holds it", async () => {
    const jobId = await enqueue();
    await claimNextJob(pool, OWNER);

    // What the reaper does when it decides this worker is gone.
    await pool.query(`update public.jobs set lease_owner = 'someone-else' where id = $1`, [jobId]);

    // The signal to stop working: two workers on one job is the thing to avoid.
    expect(await heartbeat(pool, jobId, OWNER)).toBe(false);
  });
});

describe("failing a job", () => {
  it("puts it back in the queue while attempts remain", async () => {
    const jobId = await enqueue({ max_attempts: 2 });
    await claimNextJob(pool, OWNER);

    const { requeued } = await failJob(pool, jobId, OWNER.leaseOwner, "agent_error", "boom");
    expect(requeued).toBe(true);

    const after = await stateOf(jobId);
    expect(after.state).toBe("queued");
    expect(after.lease_owner).toBeNull();
    expect(after.failure_reason).toBe("agent_error");
  });

  it("stops for good once the attempts are spent", async () => {
    const jobId = await enqueue({ max_attempts: 1 });
    await claimNextJob(pool, OWNER);

    const { requeued } = await failJob(pool, jobId, OWNER.leaseOwner, "agent_error", "boom");
    expect(requeued).toBe(false);
    expect((await stateOf(jobId)).state).toBe("failed");
  });

  it("never retries a job that ran out of budget", async () => {
    // A retry would spend the same money to reach the same refusal, so this
    // one waits for a person to raise the cap or let it go.
    const jobId = await enqueue({ max_attempts: 3 });
    await claimNextJob(pool, OWNER);

    const { requeued } = await failJob(pool, jobId, OWNER.leaseOwner, "budget_exceeded", "over");
    expect(requeued).toBe(false);
    expect((await stateOf(jobId)).state).toBe("failed");
  });

  it("records a timeout as a timeout, not as a plain failure", async () => {
    const jobId = await enqueue({ max_attempts: 1 });
    await claimNextJob(pool, OWNER);

    await failJob(pool, jobId, OWNER.leaseOwner, "wall_clock_exceeded", "too long");
    expect((await stateOf(jobId)).state).toBe("timed_out");
  });
});
