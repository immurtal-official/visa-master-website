/**
 * Put one job in the queue, for the operator's own diagnosis.
 *
 * This is not a second way to enqueue work. Enqueueing is a server-authority
 * write that belongs to the API (ADR-004), and this script cannot be reached by
 * a client: it needs DATABASE_URL, which only whoever runs the conductor has.
 * It exists because two of the states worth trusting cannot be produced from a
 * browser at all — a run that outlives its deadline, and a retry — and testing
 * a watchdog by waiting for a real pack to hang is not testing it.
 *
 *   pnpm --filter @visa-master/conductor enqueue:placeholder
 *   pnpm --filter @visa-master/conductor enqueue:placeholder -- --deadline 5
 *
 * The payload carries the work and never the account, exactly as the real
 * enqueue does: user_id is a column so the row can be owned, and nothing
 * identifying goes inside `input`.
 */
import { Pool } from "pg";

const args = process.argv.slice(2);

function flag(name, fallback) {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : args[at + 1];
}

const deadlineSeconds = Number(flag("deadline", 300));
const wantedUser = flag("user", null);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required — see apps/conductor/.env.example.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 });

try {
  // Any real account will do; the job is owned by a person even when the work
  // is a placeholder, because the row's ownership is what row-level security
  // reads and a job with no owner would be a job nobody can see.
  const owner = wantedUser
    ? { rows: [{ id: wantedUser }] }
    : await pool.query("select id from auth.users order by created_at desc limit 1");

  if (owner.rows.length === 0) {
    console.error("No account exists yet. Sign in once at the deployment first.");
    process.exit(1);
  }

  const userId = owner.rows[0].id;

  const { rows } = await pool.query(
    `insert into public.jobs
       (user_id, task_type, executor_kind, input, idempotency_key, deadline_seconds)
     values ($1, 'produce_pack', 'hermes', $2, $3, $4)
     returning id, state, deadline_seconds`,
    [
      userId,
      JSON.stringify({
        kind: "pack.schengen.v1",
        note: "placeholder diagnostic — no applicant data",
      }),
      `placeholder-${Date.now()}`,
      deadlineSeconds,
    ],
  );

  const job = rows[0];
  console.log(`queued job ${job.id} (deadline ${job.deadline_seconds}s, owner ${userId})`);
} finally {
  await pool.end();
}
