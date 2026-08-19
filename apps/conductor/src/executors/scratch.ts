import { join } from "node:path";
import { tmpdir } from "node:os";

/** Where a run's working files live. One directory per attempt, never reused. */
export function scratchDirFor(jobId: string, attempt: number): string {
  return join(tmpdir(), "visa-master-scratch", `${jobId}-${attempt}`);
}
