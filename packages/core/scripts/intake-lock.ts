/**
 * Record the intake contract in contract.lock.json.
 *
 * An engineering step, not a questionnaire edit: it is how a deliberate change
 * to a core question — one the documents, the checklist and the conductor have
 * been brought in line with — becomes the new contract. The questionnaire gate
 * refuses any core change until this has been run.
 *
 *   pnpm intake:lock          writes the lock if there is none, otherwise
 *                             only confirms it matches
 *   pnpm intake:lock --bump   records a changed contract as the next version
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  canonicalContract,
  contractDifferences,
  currentContract,
  type IntakeContract,
} from "../src/intake/contract";

const LOCK = fileURLToPath(new URL("../src/intake/contract.lock.json", import.meta.url));
const bump = process.argv.includes("--bump");

type Lock = IntakeContract & { version: number; checksum: string };

const current = currentContract();
const checksum = createHash("sha256").update(canonicalContract(current)).digest("hex");
const write = (version: number) =>
  writeFileSync(LOCK, `${JSON.stringify({ version, checksum, ...current }, null, 2)}\n`);

if (!existsSync(LOCK)) {
  write(1);
  console.log("intake:lock — no lock existed; recorded the current contract as version 1.");
  process.exit(0);
}

const locked = JSON.parse(readFileSync(LOCK, "utf8")) as Lock;
const differences = contractDifferences(locked, current);

if (differences.length === 0) {
  if (locked.checksum !== checksum) {
    // Same contract, missing or stale checksum: record it without a new version.
    write(locked.version);
    console.log(`intake:lock — recorded the checksum of version ${locked.version}.`);
  } else {
    console.log(`intake:lock — the contract matches version ${locked.version}; nothing to do.`);
  }
  process.exit(0);
}

if (!bump) {
  console.error(
    `intake:lock — the contract differs from version ${locked.version} in ${differences.length} place(s):\n\n` +
      differences.join("\n\n") +
      "\n\nIf every consumer of these answers has been updated, run `pnpm intake:lock --bump`.",
  );
  process.exit(1);
}

write(locked.version + 1);
console.log(`intake:lock — recorded the changed contract as version ${locked.version + 1}.`);
