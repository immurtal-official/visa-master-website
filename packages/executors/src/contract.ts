/**
 * The adapter contract every executor implements.
 *
 * Three kinds of worker produce agent output — the Hermes container that makes
 * a full pack today, a stateless LLM gateway for cheap steps, and a thin custom
 * agent later — and the conductor must be able to swap which one runs a task by
 * editing a routing table. That is only true if none of them leaks its shape
 * into the schema or the front end, which is what this interface buys.
 *
 * This is the V1 in-process realization of architecture v0.4 Chapter C §1's
 * HTTP+JSON contract: `running` maps to `running`, `artifact_ready` to
 * `completed` plus a manifest, `failed` to `failed`. The HTTP surface, mid-run
 * questions, and the webhook event stream arrive when the first executor moves
 * off the VM; the structured intake front-loads every question, so V1 has no
 * mid-run interactivity to express.
 *
 * Types only — the implementations land in week 3.
 */

/**
 * Executor names as the deployment speaks them.
 *
 * These are wire names, not database values: `jobs.executor_kind` stores
 * Chapter B's vocabulary (`llm_gateway`, `custom_agent`, `hermes`,
 * `backend_code`) and a resolver in packages/core maps between the two, the
 * same way versioned kind strings like `pack.schengen.v1` resolve to canonical
 * task types.
 */
export type ExecutorKind = "hermes" | "llm-gateway" | "thin-agent";

/** The subset of a jobs row an executor is given. Columns match 0002_jobs.sql. */
export interface JobRow {
  id: string;
  task_type: string;
  executor_kind: string;
  state: string;
  attempt: number;
  max_attempts: number;
  /** Sanitized payload: never a user id, an email address, or a token. */
  input: unknown;
  max_tokens_total: number;
  max_cost_usd: string;
  /** Active run time, counted from lease — queue wait never consumes budget. */
  deadline_seconds: number;
}

/** Everything an executor needs that does not belong on the job row. */
export interface RunContext {
  /** Absolute path of the fresh per-attempt scratch directory. */
  scratchDir: string;
  /** Object-storage prefix this attempt's artifacts are uploaded under. */
  artifactPrefix: string;
  /** Wall-clock instant past which the run is force-destroyed. */
  deadlineAt: Date;
  /** Aborts on deadline, cancellation, or conductor shutdown. */
  signal: AbortSignal;
}

/** An in-flight run. Opaque to the conductor beyond these fields. */
export interface RunHandle {
  jobId: string;
  attempt: number;
  /** Container id, gateway request id — whatever identifies the work. */
  executorRef: string;
  scratchDir: string;
}

export type RunStatus = "running" | "artifact_ready" | "failed";

export interface CollectedRun {
  artifactPrefix: string;
  qaReport: unknown;
}

export interface Executor {
  kind: ExecutorKind;
  /** Spawn the container, or begin the step. */
  start(job: JobRow, ctx: RunContext): Promise<RunHandle>;
  /**
   * Hermes watches for the completion artifact and NEVER for process exit: the
   * final step of a pack run starts a foreground server, so a headless run that
   * waits on exit hangs until its deadline.
   */
  poll(handle: RunHandle): Promise<RunStatus>;
  /** Upload the artifacts and hand back what the review gate needs. */
  collect(handle: RunHandle): Promise<CollectedRun>;
  /** Destroy the container and its scratch volume. Always runs. */
  destroy(handle: RunHandle): Promise<void>;
}
