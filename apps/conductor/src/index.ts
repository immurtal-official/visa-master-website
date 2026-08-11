import { Pool } from "pg";
import { readConfig } from "./config";
import { createFakeExecutor } from "./executors/fake";
import { runOnce, sleep } from "./run";
import { sweep } from "./watchdog";
import type { ExecutorRegistry } from "./router";

/**
 * The workflow engine.
 *
 * It leases work from the job table, runs it, and writes back what happened —
 * and it is the only thing that does. No screen and no model decides whether a
 * job is finished; that verdict is this loop's, based on the artifact appearing
 * and on validation passing.
 *
 * Today it runs against the local database with an executor that produces
 * nothing, which is deliberate: the claiming, the heartbeat, the deadline and
 * the reaper are the parts that are hard to get right and cheap to test, so
 * they are built and trusted before a virtual machine or a provider key exists.
 */
async function main(): Promise<void> {
  const config = readConfig();
  const pool = new Pool({ connectionString: config.databaseUrl, max: 4 });

  const registry: ExecutorRegistry = {
    // Swapped for the container-running one when the agent host exists. The
    // conductor cannot tell the difference: that is what the contract buys.
    hermes: createFakeExecutor(),
  };

  let running = true;
  const stop = () => {
    running = false;
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  console.log(`conductor ${config.leaseOwner}: watching for work`);

  let lastSweep = 0;

  while (running) {
    try {
      if (Date.now() - lastSweep > config.reaperSeconds * 1000) {
        const { lost, timedOut } = await sweep(pool, config);
        for (const id of timedOut) console.warn(`job ${id}: past its deadline, stopped`);
        for (const id of lost) console.warn(`job ${id}: worker stopped reporting, released`);
        lastSweep = Date.now();
      }

      const outcome = await runOnce(pool, registry, config);
      if (outcome) {
        console.log(`job ${outcome.jobId}: ${outcome.state}`);
        continue;
      }

      await sleep(config.idlePollSeconds * 1000);
    } catch (error) {
      // A loop that dies on a transient database error is a loop that needs a
      // person; log it and keep watching.
      console.error("conductor: loop error", error);
      await sleep(config.idlePollSeconds * 1000);
    }
  }

  await pool.end();
  console.log("conductor: stopped");
}

void main();
