import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  Executor,
  JobRow,
  RunContext,
  RunHandle,
  RunStatus,
} from "@visa-master/executors/contract";

/**
 * An executor that produces nothing, on purpose.
 *
 * It exists so the state machine around the real one can be built and trusted
 * before a virtual machine, a container image, or a provider key is involved.
 * Everything the conductor does — claiming, heartbeating, watching for the
 * artifact, collecting it, destroying the scratch — is exercised for real; only
 * the work inside is a five-second wait and a written file.
 *
 * It watches for the artifact rather than for its own completion, deliberately.
 * The real pack producer ends by starting a foreground server, so a conductor
 * that waited for the process to exit would hang until the deadline every time.
 * Building against the true completion signal from the start means that
 * discovery does not happen on the VM.
 */
export interface FakeExecutorOptions {
  /** How long the pretend work takes. */
  runMs?: number;
  /** Fail instead of producing an artifact, to exercise the failure paths. */
  failWith?: string;
  /**
   * The QA report to write. Defaults to a pack that passed its own checks and
   * wants a human to look at the rendered pages, which is the ordinary outcome;
   * a test that wants the QA gate to reject something passes a failing one.
   */
  qaReport?: unknown;
}

export function createFakeExecutor(options: FakeExecutorOptions = {}): Executor {
  const runMs = options.runMs ?? 5_000;
  const timers = new Map<string, NodeJS.Timeout>();
  const failures = new Map<string, string>();

  return {
    kind: "hermes",

    async start(job: JobRow, ctx: RunContext): Promise<RunHandle> {
      await mkdir(ctx.scratchDir, { recursive: true });

      const handle: RunHandle = {
        jobId: job.id,
        attempt: job.attempt,
        executorRef: `fake:${job.id}:${job.attempt}`,
        scratchDir: ctx.scratchDir,
      };

      const timer = setTimeout(() => {
        if (options.failWith) {
          failures.set(job.id, options.failWith);
          return;
        }
        // The artifact appearing is the completion signal.
        void writeFile(
          join(ctx.scratchDir, "qa-report.json"),
          JSON.stringify(
            options.qaReport ?? { status: "visual-review-required", issues: 0 },
            null,
            2,
          ),
        );
      }, runMs);

      // A pending timer must not hold the process open when everything else is
      // finished; the run is tracked by its artifact, not by this handle.
      timer.unref?.();
      timers.set(job.id, timer);

      return handle;
    },

    async poll(handle: RunHandle): Promise<RunStatus> {
      if (failures.has(handle.jobId)) return "failed";

      try {
        await readFile(join(handle.scratchDir, "qa-report.json"), "utf8");
        return "artifact_ready";
      } catch {
        return "running";
      }
    },

    async collect(handle: RunHandle) {
      const raw = await readFile(join(handle.scratchDir, "qa-report.json"), "utf8");
      return {
        artifactPrefix: `local/${handle.jobId}/${handle.attempt}`,
        qaReport: JSON.parse(raw),
      };
    },

    async destroy(handle: RunHandle): Promise<void> {
      const timer = timers.get(handle.jobId);
      if (timer) clearTimeout(timer);
      timers.delete(handle.jobId);
      failures.delete(handle.jobId);

      // The scratch holds the applicant's documents in the real thing, so it is
      // removed whether the run succeeded or not.
      await rm(handle.scratchDir, { recursive: true, force: true });
    },
  };
}

export { scratchDirFor } from "./scratch";
