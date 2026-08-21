import type { ValidationIssue } from "@visa-master/core";

/**
 * The two failure shapes a service is allowed to produce.
 *
 * Both carry catalogue keys, never sentences — the API returns keys and each
 * client resolves them against its own active locale, exactly as validation
 * has worked since the first schema. A service that threw an English string
 * would be a rule forked into one language.
 */

/** Rule failures: field-level, from packages/core. */
export class ValidationFailure extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super("validation failed");
    this.name = "ValidationFailure";
  }
}

/** Everything else a screen can be told about: one key, one HTTP status. */
export class ServiceError extends Error {
  constructor(
    public readonly key: string,
    public readonly status: number,
    /** Extra machine-readable detail, e.g. which documents are missing. */
    public readonly extra?: Record<string, unknown>,
  ) {
    super(key);
    this.name = "ServiceError";
  }
}
