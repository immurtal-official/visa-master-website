import lock from "./contract.lock.json" with { type: "json" };

/**
 * Which intake contract this code speaks.
 *
 * An application records the version its answers were given under, and every
 * job's input carries the version and checksum it was validated against, so
 * a pack can always be traced to the exact set of core questions that
 * produced it — and an answer set from an older version can be recognised as
 * one rather than misread as the current shape.
 *
 * Both come from contract.lock.json, which only `pnpm intake:lock` writes.
 */
export const INTAKE_VERSION: number = lock.version;
export const INTAKE_CHECKSUM: string = lock.checksum;
