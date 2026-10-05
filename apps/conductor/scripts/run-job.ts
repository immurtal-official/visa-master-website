/**
 * Run one queued job, by id, and exit.
 *
 *   pnpm --filter @visa-master/conductor run:job <job-id>
 *
 * For an operator re-running a particular job, and for the end-to-end test
 * that drives a document reading through the real conductor without touching
 * any other job in the queue. Configured exactly as the long-running
 * conductor is (DATABASE_URL, SUPABASE_URL / SUPABASE_SECRET_KEY,
 * EXTRACTION_EXECUTOR); a pack job runs on the fake executor, since running
 * one for real needs the container this script does not start.
 */
import { Pool } from "pg";
import { readConfig } from "../src/config";
import { createSupabaseDocumentStore } from "../src/documents";
import { createFixtureExtractor } from "../src/executors/extraction-fixture";
import { createFakeExecutor } from "../src/executors/fake";
import { claimNextJob } from "../src/lease";
import { runJob } from "../src/run";
import type { ExecutorRegistry } from "../src/router";

const jobId = process.argv[2];
if (!jobId) {
  console.error("usage: run:job <job-id>");
  process.exit(2);
}

const config = readConfig();
const pool = new Pool({ connectionString: config.databaseUrl, max: 2 });
const registry: ExecutorRegistry = { hermes: createFakeExecutor({ runMs: 100 }) };
if (config.extraction === "fixtures") {
  registry.llm_gateway = createFixtureExtractor({ fixturesDir: config.extractionFixturesDir });
}
const documents =
  config.supabaseUrl && config.supabaseSecretKey
    ? createSupabaseDocumentStore(config.supabaseUrl, config.supabaseSecretKey)
    : null;

try {
  const job = await claimNextJob(pool, config, jobId);
  if (!job) {
    console.error(`run:job — ${jobId} is not queued`);
    process.exitCode = 1;
  } else {
    const outcome = await runJob(pool, job, registry, config, documents);
    console.log(`run:job — ${outcome.jobId}: ${outcome.state}`);
    if (outcome.state !== "succeeded") process.exitCode = 1;
  }
} finally {
  await pool.end();
}
