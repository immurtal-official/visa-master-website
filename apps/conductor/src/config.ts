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
  };
}
