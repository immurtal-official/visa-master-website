import { hostname } from "node:os";

/**
 * How the conductor is configured.
 *
 * It connects straight to Postgres rather than through the API, because the
 * database is the interface between the two planes: the agent host makes only
 * outbound connections, and the job table is what it reads and writes. There is
 * no inbound port to configure and no service to call.
 */
export interface ConductorConfig {
  databaseUrl: string;
  /** Identity of this process, recorded on every lease it holds. */
  leaseOwner: string;
  /** How long a claim survives without a heartbeat. */
  leaseSeconds: number;
  /** How often the worker renews the lease while a job runs. */
  heartbeatSeconds: number;
  /** A heartbeat older than this means the worker is gone. */
  heartbeatTimeoutSeconds: number;
  /** How often the reaper looks for lost leases and passed deadlines. */
  reaperSeconds: number;
  /** How long the loop waits when there is nothing queued. */
  idlePollSeconds: number;

  /** Artifact storage; absent means artifacts stay recorded but not uploaded. */
  supabaseUrl?: string;
  supabaseSecretKey?: string;

  /** The per-job container. `command` unset means the docker executor is not enabled. */
  hermes: {
    image: string;
    network: string;
    proxyUrl: string;
    command?: string[];
    cpus: number;
    memory: string;
  };
}

/** HERMES_JOB_COMMAND accepts a JSON array or a whitespace-separated string. */
function parseCommand(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) return JSON.parse(trimmed) as string[];
  return trimmed.split(/\s+/);
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): ConductorConfig {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Locally, `pnpm db:status` prints it — see apps/conductor/.env.example.",
    );
  }

  return {
    databaseUrl,
    // Host and process together, so two units on one machine are distinguishable.
    leaseOwner: env.CONDUCTOR_ID ?? `${hostname()}:${process.pid}`,
    // Chapter A's numbers. A lease outlives several missed heartbeats, so a
    // slow moment does not hand someone else's work away, while a dead process
    // is noticed in under a minute.
    leaseSeconds: Number(env.LEASE_SECONDS ?? 90),
    heartbeatSeconds: Number(env.HEARTBEAT_SECONDS ?? 15),
    heartbeatTimeoutSeconds: Number(env.HEARTBEAT_TIMEOUT_SECONDS ?? 60),
    reaperSeconds: Number(env.REAPER_SECONDS ?? 30),
    idlePollSeconds: Number(env.IDLE_POLL_SECONDS ?? 2),

    supabaseUrl: env.SUPABASE_URL,
    supabaseSecretKey: env.SUPABASE_SECRET_KEY,

    hermes: {
      image: env.HERMES_IMAGE ?? "visa-master-hermes:latest",
      network: env.HERMES_NETWORK ?? "vm-egress-internal",
      proxyUrl: env.HERMES_PROXY_URL ?? "http://proxy:3128",
      command: parseCommand(env.HERMES_JOB_COMMAND),
      cpus: Number(env.HERMES_CPUS ?? 4),
      memory: env.HERMES_MEMORY ?? "8g",
    },
  };
}
