import { execFileSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createSupabaseArtifactStore } from "../artifacts";
import { readConfig } from "../config";
import { runOnce } from "../run";
import { scratchDirFor } from "./scratch";
import { artifactReady, containerNameFor, createDockerExecutor } from "./docker";
import type { ExecutorRegistry } from "../router";

/**
 * The docker executor, against the real image and the real network.
 *
 * These tests spend no model tokens: the image's entrypoint executes a plain
 * command when one is given, so the whole lifecycle — boot, staging, the
 * no-route network, artifact watch, teardown — runs exactly as a pack run
 * would, with a shell script standing where the agent will be. What is being
 * tested is the part that is hard to get right and cheap to prove.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const IMAGE = process.env.HERMES_IMAGE ?? "visa-master-hermes:latest";
const NETWORK = "vm-egress-internal";

const pool = new Pool({ connectionString: DATABASE_URL, max: 4 });

const config = readConfig({
  DATABASE_URL,
  CONDUCTOR_ID: "docker-test",
  LEASE_SECONDS: "90",
  HEARTBEAT_SECONDS: "5",
  HEARTBEAT_TIMEOUT_SECONDS: "60",
} as NodeJS.ProcessEnv);

/** Small limits so a laptop can run many of these; the flags are the same. */
function executor(command: string[], overrides: Record<string, unknown> = {}) {
  return createDockerExecutor({
    image: IMAGE,
    command,
    network: NETWORK,
    proxyUrl: "http://proxy:3128",
    cpus: 1,
    memory: "1g",
    ...overrides,
  });
}

/** The stand-in agent: does what a finished pack run does to the scratch. */
const PRODUCE = [
  "sh",
  "-c",
  'mkdir -p "$HERMES_JOB_DIR/delivery" && cp "$HERMES_JOB_DIR/input.json" "$HERMES_JOB_DIR/delivery/echo.json" && printf \'{"status":"visual-review-required","issues":0}\' > "$HERMES_JOB_DIR/qa-report.json"',
];

let hermesImagePresent = false;

/**
 * The storage credential, read the way the app reads it. When absent the
 * upload assertions are skipped rather than faked.
 */
function localSecretKey(): { url: string; key: string } | null {
  try {
    const env = readFileSync(join(__dirname, "../../../web/.env.local"), "utf8");
    const url = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1]?.trim();
    const key = env.match(/^SUPABASE_SECRET_KEY=(.+)$/m)?.[1]?.trim();
    return url && key ? { url, key } : null;
  } catch {
    return null;
  }
}

beforeAll(() => {
  try {
    execFileSync("docker", ["image", "inspect", IMAGE], { stdio: "ignore" });
    hermesImagePresent = true;
  } catch {
    hermesImagePresent = false;
  }
});

afterAll(async () => {
  await pool.end();
});

let userId: string;

beforeEach(async () => {
  await pool.query(
    `delete from public.jobs
     where user_id in (select id from auth.users where email like '%@test.local')`,
  );
  const { rows } = await pool.query<{ id: string }>(
    `insert into auth.users (id, email, instance_id)
     values (gen_random_uuid(), 'docker-' || gen_random_uuid() || '@test.local',
             '00000000-0000-0000-0000-000000000000')
     returning id`,
  );
  userId = rows[0]!.id;
});

async function enqueue(overrides: { deadline_seconds?: number; max_attempts?: number } = {}) {
  const { rows } = await pool.query<{ id: string }>(
    `insert into public.jobs (user_id, task_type, executor_kind, input, deadline_seconds, max_attempts)
     values ($1, 'produce_pack', 'hermes', '{"route":{"destination":"ES"},"marker":"staged-input"}'::jsonb, $2, $3)
     returning id`,
    [userId, overrides.deadline_seconds ?? 300, overrides.max_attempts ?? 1],
  );
  return rows[0]!.id;
}

function docker(args: string[]): string {
  return execFileSync("docker", args).toString();
}

describe("the docker executor, end to end", () => {
  it("boots the real image, stages the input, and succeeds on the artifact", async () => {
    if (!hermesImagePresent) return; // the image is a 5 GB local build, not a registry pull

    const jobId = await enqueue();
    const secret = localSecretKey();
    const store = secret ? createSupabaseArtifactStore(secret.url, secret.key) : null;
    const registry: ExecutorRegistry = { hermes: executor(PRODUCE, { store }) };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "succeeded" });

    if (store) {
      // The artifacts left the machine before the scratch was destroyed, into
      // the bucket no client can reach.
      const { rows: objects } = await pool.query<{ name: string }>(
        `select name from storage.objects where bucket_id = 'artifacts' and name like $1 order by name`,
        [`applications/${jobId}/%`],
      );
      expect(objects.map((o) => o.name)).toEqual([
        `applications/${jobId}/attempts/1/delivery/echo.json`,
        `applications/${jobId}/attempts/1/qa-report.json`,
      ]);
    }

    const { rows } = await pool.query<{ result: { qaReport: unknown; artifactPrefix: string } }>(
      `select result from public.jobs where id = $1`,
      [jobId],
    );
    // Completion was judged by the artifact the container wrote, and what the
    // container saw was the sanitized input the conductor staged: the echoed
    // copy proves the staging path, in the real image, on the real network.
    expect(rows[0]!.result.qaReport).toMatchObject({ status: "visual-review-required" });
    expect(rows[0]!.result.artifactPrefix).toBe(`applications/${jobId}/attempts/1`);

    // Nothing is left behind: no container, no scratch.
    expect(() => docker(["inspect", containerNameFor(jobId, 1)])).toThrow();
    await expect(access(scratchDirFor(jobId, 1))).rejects.toThrow();
  }, 120_000);

  it("treats a container that exits without an artifact as a failed attempt", async () => {
    if (!hermesImagePresent) return;

    const jobId = await enqueue({ max_attempts: 2 });
    const registry: ExecutorRegistry = { hermes: executor(["sh", "-c", "exit 1"]) };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "queued" });

    const { rows } = await pool.query<{ failure_reason: string; attempt: number }>(
      `select failure_reason, attempt from public.jobs where id = $1`,
      [jobId],
    );
    expect(rows[0]!.failure_reason).toBe("agent_error");
    expect(rows[0]!.attempt).toBe(1);
  }, 120_000);

  it("kills a run that outlives its deadline, and cleans up anyway", async () => {
    if (!hermesImagePresent) return;

    // The stand-in hangs the way the real `workspace open` step would.
    const jobId = await enqueue({ deadline_seconds: 8, max_attempts: 1 });
    const registry: ExecutorRegistry = { hermes: executor(["sleep", "600"]) };

    const outcome = await runOnce(pool, registry, config);
    expect(outcome).toEqual({ jobId, state: "timed_out" });

    expect(() => docker(["inspect", containerNameFor(jobId, 1)])).toThrow();
    await expect(access(scratchDirFor(jobId, 1))).rejects.toThrow();
  }, 120_000);
});

describe("what the job container can and cannot reach", () => {
  it("has no default route: direct egress is unreachable, not merely slow", async () => {
    if (!hermesImagePresent) return;

    const scratch = scratchDirFor(`route-probe-${Date.now()}`, 1);
    const exec = executor([
      "sh",
      "-c",
      'mkdir -p "$HERMES_JOB_DIR/delivery"; ' +
        '{ wget -T 3 -q -O- http://169.254.169.254/ 2>&1 || echo METADATA-UNREACHABLE; } > "$HERMES_JOB_DIR/delivery/probe.txt"; ' +
        '{ wget -T 3 -q -O- http://example.com/ 2>&1 || echo DIRECT-UNREACHABLE; } >> "$HERMES_JOB_DIR/delivery/probe.txt"; ' +
        'printf \'{"status":"visual-review-required","issues":0}\' > "$HERMES_JOB_DIR/qa-report.json"',
    ]);

    const handle = await exec.start(
      {
        id: "00000000-0000-0000-0000-00000000e012",
        task_type: "produce_pack",
        executor_kind: "hermes",
        state: "leased",
        attempt: 1,
        max_attempts: 1,
        input: { probe: true },
        deadline_seconds: 60,
        max_tokens_total: 0,
        max_cost_usd: "0",
      },
      {
        scratchDir: scratch,
        artifactPrefix: "probe",
        deadlineAt: new Date(Date.now() + 60_000),
        signal: new AbortController().signal,
      },
    );

    try {
      for (let i = 0; i < 120 && !(await artifactReady(scratch)); i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const probe = await readFile(`${scratch}/delivery/probe.txt`, "utf8");
      // The container's own words: the metadata address and the open internet
      // are both unreachable without the proxy. This is the v0.3 boundary.
      expect(probe).toContain("METADATA-UNREACHABLE");
      expect(probe).toContain("DIRECT-UNREACHABLE");
    } finally {
      await exec.destroy(handle);
    }
  }, 120_000);

  it("carries no provider key and no host environment", async () => {
    if (!hermesImagePresent) return;

    // The environment is constructed from an allowlist. If a key were ever in
    // it, the most hostile reader of `env` output would find it — so that is
    // exactly the reader this test plays.
    const scratch = scratchDirFor(`env-probe-${Date.now()}`, 1);
    const exec = executor([
      "sh",
      "-c",
      'mkdir -p "$HERMES_JOB_DIR/delivery" && env > "$HERMES_JOB_DIR/delivery/env.txt" && ' +
        'printf \'{"status":"visual-review-required","issues":0}\' > "$HERMES_JOB_DIR/qa-report.json"',
    ]);

    const handle = await exec.start(
      {
        id: "00000000-0000-0000-0000-00000000e011",
        task_type: "produce_pack",
        executor_kind: "hermes",
        state: "leased",
        attempt: 1,
        max_attempts: 1,
        input: { probe: true },
        deadline_seconds: 60,
        max_tokens_total: 0,
        max_cost_usd: "0",
      },
      {
        scratchDir: scratch,
        artifactPrefix: "probe",
        deadlineAt: new Date(Date.now() + 60_000),
        signal: new AbortController().signal,
      },
    );

    try {
      for (let i = 0; i < 120 && !(await artifactReady(scratch)); i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const env = await readFile(`${scratch}/delivery/env.txt`, "utf8");

      // The proxy is there; nothing shaped like a credential is.
      expect(env).toContain("HTTPS_PROXY=http://proxy:3128");
      expect(env).not.toMatch(/API[_-]?KEY|SECRET|TOKEN|PASSWORD|sb_secret|sk-/i);
    } finally {
      await exec.destroy(handle);
    }
  }, 120_000);
});
