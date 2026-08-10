import { describe, expect, it } from "vitest";
import { parseEmail, parseOtpCode } from "./auth";
import type { ValidationIssue } from "../validation/issue";

function issues(result: ReturnType<typeof parseEmail> | ReturnType<typeof parseOtpCode>) {
  if (result.ok) throw new Error("expected the input to be rejected");
  return result.issues;
}

describe("emailSchema", () => {
  it("accepts an address and trims surrounding whitespace", () => {
    const result = parseEmail({ email: "  chen@example.com " });
    expect(result).toEqual({ ok: true, data: { email: "chen@example.com" } });
  });

  it("reports a missing address as required", () => {
    expect(issues(parseEmail({}))).toEqual([{ path: "email", key: "validation.required" }]);
    expect(issues(parseEmail({ email: "" }))).toEqual([
      { path: "email", key: "validation.required" },
    ]);
    expect(issues(parseEmail({ email: "   " }))).toEqual([
      { path: "email", key: "validation.required" },
    ]);
  });

  it("reports a malformed address with the email key", () => {
    expect(issues(parseEmail({ email: "chen@" }))).toEqual([
      { path: "email", key: "validation.email.invalid" },
    ]);
  });

  it("reports a non-string address as invalid rather than crashing", () => {
    expect(issues(parseEmail({ email: 42 }))).toEqual([
      { path: "email", key: "validation.invalid" },
    ]);
  });
});

describe("otpCodeSchema", () => {
  it("accepts six digits, including with pasted spaces", () => {
    expect(parseOtpCode({ code: "123456" })).toEqual({ ok: true, data: { code: "123456" } });
    expect(parseOtpCode({ code: "123 456" })).toEqual({ ok: true, data: { code: "123456" } });
    expect(parseOtpCode({ code: " 1 2 3 4 5 6 " })).toEqual({
      ok: true,
      data: { code: "123456" },
    });
  });

  it("reports a missing code as required", () => {
    expect(issues(parseOtpCode({ code: "" }))).toEqual([
      { path: "code", key: "validation.required" },
    ]);
  });

  it("reports wrong length or non-digits with the format key", () => {
    for (const code of ["12345", "1234567", "12345a"]) {
      expect(issues(parseOtpCode({ code }))).toEqual([
        { path: "code", key: "validation.otp.invalidFormat" },
      ]);
    }
  });
});

describe("no schema leaks a sentence", () => {
  const rejected: ValidationIssue[] = [
    ...issues(parseEmail({})),
    ...issues(parseEmail({ email: "nope" })),
    ...issues(parseEmail({ email: 42 })),
    ...issues(parseOtpCode({ code: "" })),
    ...issues(parseOtpCode({ code: "abc" })),
  ];

  it("emits keys and parameters only — never human-readable text", () => {
    for (const issue of rejected) {
      // A key is dotted, lowercase-ish and space-free; a sentence is not.
      expect(issue.key).toMatch(/^[a-z][a-zA-Z0-9.]*$/);
      expect(issue).not.toHaveProperty("message");
      for (const value of Object.values(issue.params ?? {})) {
        expect(typeof value === "string" || typeof value === "number").toBe(true);
        if (typeof value === "string") expect(value).not.toMatch(/\s/);
      }
    }
  });
});
