// Regenerate what the backend reads from packages/core (ADR-005): the rules'
// data (apps/api/app/rules/generated/intake.json) and the conformance vectors
// (packages/core/conformance/vectors.json). `pnpm check:intake` runs this
// first, so a questionnaire edit and its exported copy are committed together.
//
// A wrapper rather than `UPDATE_CONFORMANCE=1 vitest …` in package.json, so it
// runs the same from a Windows shell.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const result = spawnSync("pnpm", ["exec", "vitest", "run", "src/conformance"], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: { ...process.env, UPDATE_CONFORMANCE: "1" },
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
