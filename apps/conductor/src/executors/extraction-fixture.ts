import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  CollectedRun,
  Executor,
  JobRow,
  RunContext,
  RunHandle,
  RunStatus,
} from "@visa-master/executors/contract";

/**
 * A document reader that reads nothing: it answers from hand-written fixtures.
 *
 * Extraction is a model call through the gateway, and the gateway does not
 * exist yet. Everything around that call does, and has to be trusted before a
 * provider key is involved: enqueueing on upload, staging the document, the
 * shape the reader reports in, and above all what the conductor does with it —
 * which values become proposed answers, which never may. This executor stands
 * where the gateway call will stand, so the whole chain runs for real except
 * the one step that costs money.
 *
 * For each staged document it returns the fixture for that checklist item
 * (`<fixturesDir>/<document>.json`, shaped like extraction.json), narrowed to
 * the fields the job asked for. A document with no fixture reads as nothing.
 * It writes extraction.json and a passing qa-report.json into the scratch,
 * which is the completion signal the run loop already watches for.
 */
export interface FixtureExtractorOptions {
  fixturesDir: string;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

interface ManifestEntry {
  document: string;
  page: number;
}

export function createFixtureExtractor(options: FixtureExtractorOptions): Executor {
  return {
    kind: "llm-gateway",

    async start(job: JobRow, ctx: RunContext): Promise<RunHandle> {
      await mkdir(ctx.scratchDir, { recursive: true });

      const requested = new Set(((job.input as { fields?: string[] }).fields ?? []).map(String));
      const manifestPath = join(ctx.scratchDir, "documents.json");
      const manifest = (await exists(manifestPath))
        ? (JSON.parse(await readFile(manifestPath, "utf8")) as ManifestEntry[])
        : [];

      const fields: unknown[] = [];
      for (const entry of manifest) {
        const fixture = join(options.fixturesDir, `${entry.document}.json`);
        if (!(await exists(fixture))) continue;
        const read = JSON.parse(await readFile(fixture, "utf8")) as {
          fields: { field: string }[];
        };
        fields.push(...read.fields.filter((field) => requested.has(field.field)));
      }

      await writeFile(join(ctx.scratchDir, "extraction.json"), JSON.stringify({ fields }, null, 2));
      await writeFile(
        join(ctx.scratchDir, "qa-report.json"),
        JSON.stringify({ status: "passed", issues: [] }),
      );

      return {
        jobId: job.id,
        attempt: job.attempt,
        executorRef: `fixture-extractor:${job.id}:${job.attempt}`,
        scratchDir: ctx.scratchDir,
      };
    },

    async poll(handle: RunHandle): Promise<RunStatus> {
      return (await exists(join(handle.scratchDir, "qa-report.json"))) &&
        (await exists(join(handle.scratchDir, "extraction.json")))
        ? "artifact_ready"
        : "running";
    },

    async collect(handle: RunHandle): Promise<CollectedRun> {
      return {
        artifactPrefix: "",
        qaReport: JSON.parse(await readFile(join(handle.scratchDir, "qa-report.json"), "utf8")),
        output: JSON.parse(await readFile(join(handle.scratchDir, "extraction.json"), "utf8")),
      };
    },

    async destroy(handle: RunHandle): Promise<void> {
      // The scratch holds a passport scan; it does not outlive the run.
      await rm(handle.scratchDir, { recursive: true, force: true });
    },
  };
}
