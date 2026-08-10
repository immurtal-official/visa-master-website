import { describe, expect, it } from "vitest";
import { z } from "zod";
import { i18nIssue, toIssues } from "./issue.js";
import { MESSAGE_KEYS, isMessageKey, requiredParamsFor } from "../i18n/message-keys.js";
import { emailSchema, otpCodeSchema } from "../schemas/auth.js";

/** Every schema this package exports, with inputs that exercise their rules. */
const SCHEMA_PROBES: { schema: z.ZodType; inputs: unknown[] }[] = [
  {
    schema: emailSchema,
    inputs: [{}, { email: "" }, { email: "  " }, { email: "nope" }, { email: 42 }, null, []],
  },
  {
    schema: otpCodeSchema,
    inputs: [{}, { code: "" }, { code: "123" }, { code: "abcdef" }, { code: 123456 }, null],
  },
];

describe("every issue an exported schema can emit is registered", () => {
  it("uses only keys from the registry, with the parameters that key declares", () => {
    for (const { schema, inputs } of SCHEMA_PROBES) {
      for (const input of inputs) {
        const parsed = schema.safeParse(input);
        if (parsed.success) continue;

        for (const issue of toIssues(parsed.error, input)) {
          expect(isMessageKey(issue.key), `unregistered key: ${issue.key}`).toBe(true);

          const required = requiredParamsFor(issue.key);
          const supplied = Object.keys(issue.params ?? {});
          for (const name of required) {
            expect(supplied, `${issue.key} is missing the ${name} parameter`).toContain(name);
          }
          // Extra parameters are as bad as missing ones: the catalogue message
          // would silently ignore them and the mismatch would go unnoticed.
          expect(supplied.sort()).toEqual([...required].sort());
        }
      }
    }
  });
});

describe("toIssues", () => {
  it("carries a custom rule's key and parameters through unchanged", () => {
    const schema = z.object({ months: z.number() }).superRefine((value, ctx) => {
      if (value.months < 3) {
        ctx.addIssue(i18nIssue("validation.tooShort", { min: 3 }, ["months"]));
      }
    });

    const parsed = schema.safeParse({ months: 1 });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    expect(toIssues(parsed.error)).toEqual([
      { path: "months", key: "validation.tooShort", params: { min: 3 } },
    ]);
  });

  it("tells a missing field apart from a wrongly typed one", () => {
    const schema = z.object({ email: z.string() });

    const missing = schema.safeParse({});
    const wrongType = schema.safeParse({ email: 42 });
    expect(missing.success || wrongType.success).toBe(false);
    if (missing.success || wrongType.success) return;

    expect(toIssues(missing.error, {})).toEqual([{ path: "email", key: "validation.required" }]);
    expect(toIssues(wrongType.error, { email: 42 })).toEqual([
      { path: "email", key: "validation.invalid" },
    ]);
    // Without the input, a type mismatch reads as a field that was not filled
    // in — the right assumption for submitted forms, where values are strings.
    expect(toIssues(wrongType.error)).toEqual([{ path: "email", key: "validation.required" }]);
  });

  it("falls back to the generic key for an issue it cannot map", () => {
    const schema = z.string().refine(() => false, { message: "some english sentence" });
    const parsed = schema.safeParse("value");
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const [issue] = toIssues(parsed.error);
    expect(issue).toEqual({ path: "", key: "validation.invalid" });
  });

  it("never reads zod's own message text", () => {
    const schema = z.object({ email: z.email({ message: "Please enter a real email!" }) });
    const parsed = schema.safeParse({ email: "nope" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const serialised = JSON.stringify(toIssues(parsed.error));
    expect(serialised).not.toContain("Please enter a real email");
  });

  it("reports the dot-path of a nested field", () => {
    const schema = z.object({ passport: z.object({ number: z.string().min(9) }) });
    const parsed = schema.safeParse({ passport: { number: "E123" } });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    expect(toIssues(parsed.error)).toEqual([
      { path: "passport.number", key: "validation.tooShort", params: { min: 9 } },
    ]);
  });
});

describe("the message-key registry", () => {
  it("declares parameter names, not sentences", () => {
    for (const [key, params] of Object.entries(MESSAGE_KEYS)) {
      expect(key).toMatch(/^[a-z][a-zA-Z0-9.]*$/);
      for (const name of params) expect(name).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
    }
  });
});
