import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  Executor,
  JobRow,
  RunContext,
  RunHandle,
  RunStatus,
} from "@visa-master/executors/contract";
import type { ArtifactStore } from "../artifacts";

const run = promisify(execFile);

/**
 * The executor that drives one ephemeral container per job.
 *
 * This is the v0.3 discipline made runnable: a fresh scratch directory per
 * attempt with the sanitized input staged into it, a container on a network
 * with no default route whose only way out is the audited proxy, an
 * environment built from an allowlist (never inherited from the host, so no
 * key can leak in by accident), completion judged by the artifact appearing —
 * never by process exit, because the real pack producer ends by starting a
 * foreground server — and, on every path out, the container and the scratch
 * destroyed. The machine keeps nothing between jobs.
 *
 * What runs inside is configuration: the same lifecycle drives the real
 * `visa-master-hermes` image and the tests' stand-in commands, which is how
 * the plumbing gets proven without spending a model token.
 */
export interface DockerExecutorOptions {
  image: string;
  /** The command for one job. The job's input is staged at inputPathInContainer. */
  command: string[];
  /** Docker network. Created (internal) if missing, so no-route holds everywhere. */
  network: string;
  /** Proxy URL injected as the container's ONLY route out; empty = none. */
  proxyUrl?: string;
  cpus?: number;
  memory?: string;
  pidsLimit?: number;
  /** Where the scratch dir is mounted inside the container. */
  jobDirInContainer?: string;
  /** Extra env — an allowlist, spelled out one by one at the call site. */
  env?: Record<string, string>;
  store?: ArtifactStore | null;
}

const DEFAULTS = {
  cpus: 4,
  memory: "8g",
  pidsLimit: 512,
  jobDirInContainer: "/opt/data/job",
};

export function containerNameFor(jobId: string, attempt: number): string {
  return `vm-job-${jobId.slice(0, 8)}-${attempt}`;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * The completion signal: qa-report.json AND the delivery folder, both present.
 * (Architecture A §3.2 — the report alone means QA ran; the folder alone means
 * nothing was checked. The pack exists only when both do.)
 */
export async function artifactReady(scratchDir: string): Promise<boolean> {
  return (
    (await exists(join(scratchDir, "qa-report.json"))) &&
    (await exists(join(scratchDir, "delivery")))
  );
}

export async function ensureInternalNetwork(name: string): Promise<void> {
  try {
    await run("docker", ["network", "inspect", name]);
  } catch {
    // internal: no gateway to the outside — the property the tests assert.
    await run("docker", ["network", "create", "--internal", name]);
  }
}

export function createDockerExecutor(options: DockerExecutorOptions): Executor {
  const cfg = { ...DEFAULTS, ...options };

  return {
    kind: "hermes",

    async start(job: JobRow, ctx: RunContext): Promise<RunHandle> {
      await mkdir(ctx.scratchDir, { recursive: true });
      // Stage the sanitized input where the agent will look for it. It carries
      // the work and never the account: that was enforced at enqueue time.
      await writeFile(join(ctx.scratchDir, "input.json"), JSON.stringify(job.input, null, 2));

      await ensureInternalNetwork(cfg.network);

      const name = containerNameFor(job.id, job.attempt);

      // The environment is constructed, not inherited. Only what is named here
      // exists inside — which is what makes "no provider key in the job
      // container" checkable rather than hoped.
      const env: Record<string, string> = {
        HERMES_JOB_DIR: cfg.jobDirInContainer,
        ...(cfg.proxyUrl
          ? {
              HTTP_PROXY: cfg.proxyUrl,
              HTTPS_PROXY: cfg.proxyUrl,
              http_proxy: cfg.proxyUrl,
              https_proxy: cfg.proxyUrl,
            }
          : {}),
        ...cfg.env,
      };

      const args = [
        "run",
        "--detach",
        "--name",
        name,
        "--network",
        cfg.network,
        "--cpus",
        String(cfg.cpus),
        "--memory",
        cfg.memory,
        "--pids-limit",
        String(cfg.pidsLimit),
        "--security-opt",
        "no-new-privileges",
        "-v",
        `${ctx.scratchDir}:${cfg.jobDirInContainer}`,
        ...Object.entries(env).flatMap(([key, value]) => ["-e", `${key}=${value}`]),
        cfg.image,
        ...cfg.command,
      ];

      await run("docker", args);

      return {
        jobId: job.id,
        attempt: job.attempt,
        executorRef: `docker:${name}`,
        scratchDir: ctx.scratchDir,
      };
    },

    async poll(handle: RunHandle): Promise<RunStatus> {
      // The artifact is the verdict; the process is not consulted while the
      // artifact is possible. Only once the container has stopped AND nothing
      // appeared is the run a failure.
      if (await artifactReady(handle.scratchDir)) return "artifact_ready";

      try {
        const { stdout } = await run("docker", [
          "inspect",
          "--format",
          "{{.State.Running}}",
          containerNameFor(handle.jobId, handle.attempt),
        ]);
        return stdout.trim() === "true" ? "running" : "failed";
      } catch {
        // No container and no artifact: it died before producing anything.
        return "failed";
      }
    },

    async collect(handle: RunHandle) {
      const qaReport = JSON.parse(
        await readFile(join(handle.scratchDir, "qa-report.json"), "utf8"),
      ) as unknown;

      const prefix = `applications/${handle.jobId}/attempts/${handle.attempt}`;
      const files = [
        "qa-report.json",
        ...(await walk(join(handle.scratchDir, "delivery"), "delivery")),
      ];

      // Artifacts leave the machine before the scratch is destroyed. The store
      // is the trusted conductor's own hand — the container never held a
      // storage credential (C §1.6's co-located posture).
      let artifacts: string[] | undefined;
      if (cfg.store) {
        artifacts = [];
        for (const relative of files) {
          const content = await readFile(join(handle.scratchDir, relative));
          await cfg.store.put(`${prefix}/${relative}`, content);
          artifacts.push(`${prefix}/${relative}`);
        }
      }

      return { artifactPrefix: prefix, qaReport, artifacts };
    },

    async destroy(handle: RunHandle): Promise<void> {
      // Force-remove tolerates every state: running, exited, already gone.
      await run("docker", ["rm", "-f", containerNameFor(handle.jobId, handle.attempt)]).catch(
        () => undefined,
      );
      // The scratch held a passport scan and a bank statement in the real
      // thing; it does not survive the job, whatever happened to the job.
      await rm(handle.scratchDir, { recursive: true, force: true });
    },
  };
}

async function walk(dir: string, prefix: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...(await walk(join(dir, entry.name), `${prefix}/${entry.name}`)));
    } else {
      files.push(`${prefix}/${entry.name}`);
    }
  }
  return files;
}
