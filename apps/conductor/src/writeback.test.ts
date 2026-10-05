import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { readConfig } from "./config";
import { createFixtureExtractor } from "./executors/extraction-fixture";
import { claimNextJob } from "./lease";
import { runJob } from "./run";
import type { ExecutorRegistry } from "./router";
import type { Executor } from "@visa-master/executors/contract";

/**
 * Reading a document, end to end inside the conductor: a queued extraction
 * job, the document staged, the fixture reader, and the write-back into the
 * application — asserted against the database.
 */

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const pool = new Pool({ connectionString: DATABASE_URL, max: 6 });

const config = readConfig({
  DATABASE_URL,
  CONDUCTOR_ID: "writeback-test",
  HEARTBEAT_SECONDS: "0",
} as NodeJS.ProcessEnv);

const FIXTURES = fileURLToPath(new URL("../fixtures/extraction", import.meta.url));
const scan = { get: async () => Buffer.from("SCAN") };

afterAll(async () => {
  await pool.end();
});

let userId: string;
let applicationId: string;
let uploadId: string;

beforeEach(async () => {
  // Only this suite's own rows. Jobs do not cascade from their user, so they go first.
  await pool.query(
    `delete from public.jobs where user_id in (select id from auth.users where email like 'wb-%@test.local')`,
  );
  await pool.query(`delete from auth.users where email like 'wb-%@test.local'`);
  const { rows } = await pool.query<{ user_id: string; application_id: string; upload_id: string }>(
    `with u as (
       insert into auth.users (id, email, instance_id)
       values (gen_random_uuid(), 'wb-' || gen_random_uuid() || '@test.local',
               '00000000-0000-0000-0000-000000000000')
       returning id
     ), a as (
       insert into public.applications (user_id, residence_area, destination, answers)
       select u.id, 'sichuan', 'ES', '{"passport":{"number":"G00000000"}}'::jsonb from u
       returning id, user_id
     ), up as (
       insert into public.uploads (application_id, user_id, document, page, storage_path, content_type, status)
       select a.id, a.user_id, 'passportBio', 1, a.user_id || '/' || a.id || '/p.jpg', 'image/jpeg', 'stored'
       from a returning id, application_id, user_id
     )
     select user_id, application_id, id as upload_id from up`,
  );
  ({ user_id: userId, application_id: applicationId, upload_id: uploadId } = rows[0]!);

  // The passport number was typed by the applicant.
  await pool.query(
    `insert into public.answer_sources (application_id, user_id, path, source, confirmed_at, intake_version)
     values ($1, $2, 'passport.number', 'applicant', now(), 1)`,
    [applicationId, userId],
  );
});

async function enqueueExtraction(): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into public.jobs (user_id, task_type, executor_kind, input, deadline_seconds, max_attempts)
     values ($1, 'doc_field_extraction', 'llm_gateway', $2::jsonb, 300, 1)
     returning id`,
    [
      userId,
      JSON.stringify({
        documents: [{ uploadId, document: "passportBio", page: 1, contentType: "image/jpeg" }],
        fields: [
          "passport.number",
          "passport.issuedAt",
          "passport.expiresAt",
          "applicant.pinyin",
          "applicant.birthDate",
        ],
      }),
    ],
  );
  return rows[0]!.id;
}

/** Run exactly this job: other suites and the e2e runs share the local queue. */
async function run(jobId: string, reg: ExecutorRegistry) {
  const job = await claimNextJob(pool, config, jobId);
  if (!job) throw new Error(`${jobId} was not claimable`);
  return runJob(pool, job, reg, config, scan);
}

const registry = (extractor: Executor = createFixtureExtractor({ fixturesDir: FIXTURES })) =>
  ({ llm_gateway: extractor }) as ExecutorRegistry;

async function application() {
  const { rows } = await pool.query<{ answers: Record<string, Record<string, string>> }>(
    `select answers from public.applications where id = $1`,
    [applicationId],
  );
  const { rows: sources } = await pool.query<{ path: string; source: string; confirmed: boolean }>(
    `select path, source, confirmed_at is not null as confirmed
     from public.answer_sources where application_id = $1 order by path`,
    [applicationId],
  );
  return { answers: rows[0]!.answers, sources };
}

describe("reading a document back into the application", () => {
  it("records every field, and proposes the ones the applicant has not answered", async () => {
    const jobId = await enqueueExtraction();
    expect(await run(jobId, registry())).toEqual({ jobId, state: "succeeded" });

    const { rows: fields } = await pool.query(
      `select field from public.document_fields where upload_id = $1 order by field`,
      [uploadId],
    );
    expect(fields.map((f) => f.field)).toHaveLength(5);

    const { answers, sources } = await application();
    // Typed by the applicant: untouched, and still theirs.
    expect(answers.passport!.number).toBe("G00000000");
    expect(answers.passport!.issuedAt).toBe("2020-06-01");
    expect(answers.applicant!.pinyin).toBe("CHEN JING");
    expect(sources).toEqual([
      { path: "applicant.birthDate", source: "document", confirmed: false },
      { path: "applicant.pinyin", source: "document", confirmed: false },
      { path: "passport.expiresAt", source: "document", confirmed: false },
      { path: "passport.issuedAt", source: "document", confirmed: false },
      { path: "passport.number", source: "applicant", confirmed: true },
    ]);

    // The job keeps what was done, not what was read.
    const { rows } = await pool.query<{ result: unknown }>(
      `select result from public.jobs where id = $1`,
      [jobId],
    );
    expect(rows[0]!.result).toMatchObject({ writeBack: { recorded: 5, proposed: 4 } });
    expect(JSON.stringify(rows[0]!.result)).not.toContain("CHEN JING");
  });

  it("records but proposes nothing once the application has been sent", async () => {
    await pool.query(`update public.applications set status = 'submitted' where id = $1`, [
      applicationId,
    ]);
    await run(await enqueueExtraction(), registry());

    const { answers, sources } = await application();
    expect(answers).toEqual({ passport: { number: "G00000000" } });
    expect(sources.map((s) => s.path)).toEqual(["passport.number"]);
    const { rows } = await pool.query(
      `select count(*)::int as n from public.document_fields where upload_id = $1`,
      [uploadId],
    );
    expect(rows[0]!.n).toBe(5);
  });

  it("does not turn an answer typed while it was reading into a proposal", async () => {
    // The applicant typed the issue date after the job was queued.
    const jobId = await enqueueExtraction();
    await pool.query(
      `update public.applications set answers = jsonb_set(answers, '{passport,issuedAt}', '"2021-01-01"') where id = $1`,
      [applicationId],
    );
    await pool.query(
      `insert into public.answer_sources (application_id, user_id, path, source, confirmed_at, intake_version)
       values ($1, $2, 'passport.issuedAt', 'applicant', now(), 1)`,
      [applicationId, userId],
    );
    await run(jobId, registry());

    const { answers, sources } = await application();
    expect(answers.passport!.issuedAt).toBe("2021-01-01");
    expect(sources.find((s) => s.path === "passport.issuedAt")).toEqual({
      path: "passport.issuedAt",
      source: "applicant",
      confirmed: true,
    });
  });

  it("refuses a report that is not the agreed shape, and writes nothing", async () => {
    const extractor = createFixtureExtractor({ fixturesDir: FIXTURES });
    const broken: Executor = {
      ...extractor,
      collect: async (handle) => ({
        ...(await extractor.collect(handle)),
        output: { fields: "x" },
      }),
    };
    const jobId = await enqueueExtraction();
    expect(await run(jobId, registry(broken))).toEqual({ jobId, state: "failed" });

    const { rows } = await pool.query<{ failure_reason: string; error: { detail: string } }>(
      `select failure_reason, error from public.jobs where id = $1`,
      [jobId],
    );
    expect(rows[0]!.failure_reason).toBe("validation_failed");
    expect(rows[0]!.error.detail).toBe("the extraction report is malformed");
    expect((await application()).sources).toHaveLength(1);
  });

  it("has nothing to do when the upload went while it was being read", async () => {
    const jobId = await enqueueExtraction();
    const extractor = createFixtureExtractor({ fixturesDir: FIXTURES });
    const removing: Executor = {
      ...extractor,
      collect: async (handle) => {
        await pool.query(`delete from public.uploads where id = $1`, [uploadId]);
        return extractor.collect(handle);
      },
    };
    expect(await run(jobId, registry(removing))).toEqual({
      jobId,
      state: "succeeded",
    });
    expect((await application()).sources).toHaveLength(1);
  });
});
