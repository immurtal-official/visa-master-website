import { describe, expect, it } from "vitest";
import { parseApplicant, parsePassport, parseQuestion } from "./schengen-tourism-v1";

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthsFromNow(months: number): string {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() + months);
  return iso(date);
}

import type { ValidationResult } from "../validation/issue";

function issues(result: ValidationResult<unknown>) {
  if (result.ok) throw new Error("expected the answer to be rejected");
  return result.issues;
}

describe("the applicant's own details", () => {
  const valid = {
    name: "陈静",
    pinyin: "CHEN JING",
    birthDate: "1990-04-12",
    phone: "13800000000",
  };

  it("accepts a complete answer", () => {
    const result = parseApplicant(valid);
    expect(result).toEqual({ ok: true, data: valid });
  });

  it("uppercases pinyin, because that is how a passport prints it", () => {
    const result = parseApplicant({ ...valid, pinyin: "chen jing" });
    expect(result.ok && result.data.pinyin).toBe("CHEN JING");
  });

  it("rejects Chinese characters in the pinyin field", () => {
    expect(issues(parseApplicant({ ...valid, pinyin: "陈静" }))).toEqual([
      { path: "pinyin", key: "validation.pinyin.invalid" },
    ]);
  });

  it("tolerates a phone number written with spaces", () => {
    const result = parseApplicant({ ...valid, phone: "138 0000 0000" });
    expect(result.ok && result.data.phone).toBe("13800000000");
  });

  it("rejects a phone number that is not a mainland mobile", () => {
    expect(issues(parseApplicant({ ...valid, phone: "02812345678" }))).toEqual([
      { path: "phone", key: "validation.phone.invalid" },
    ]);
  });

  it("rejects a birth date in the future", () => {
    expect(issues(parseApplicant({ ...valid, birthDate: monthsFromNow(1) }))).toEqual([
      { path: "birthDate", key: "validation.date.future" },
    ]);
  });
});

describe("the passport", () => {
  const valid = {
    number: "E12345678",
    issuedAt: "2020-06-01",
    expiresAt: monthsFromNow(24),
  };

  it("accepts a complete answer", () => {
    expect(parsePassport(valid).ok).toBe(true);
  });

  it("tolerates a number typed in lower case or with spaces", () => {
    const result = parsePassport({ ...valid, number: "e1234 5678" });
    expect(result.ok && result.data.number).toBe("E12345678");
  });

  it("rejects a number that is not nine characters, and says how many it wants", () => {
    expect(issues(parsePassport({ ...valid, number: "E1234" }))).toEqual([
      { path: "number", key: "validation.passport.number.invalid", params: { length: 9 } },
    ]);
  });

  it("rejects an expiry that falls before the issue date", () => {
    const result = parsePassport({ ...valid, issuedAt: "2024-01-01", expiresAt: "2023-01-01" });
    expect(issues(result)).toContainEqual({
      path: "expiresAt",
      key: "validation.passport.expiry.beforeIssue",
    });
  });

  it("rejects a passport expiring too soon, and carries the margin required", () => {
    // The canonical case: the rule reports how many months it needs, and the
    // screen puts that number into a sentence in whichever language is active.
    const result = parsePassport({ ...valid, expiresAt: monthsFromNow(1) });
    expect(issues(result)).toContainEqual({
      path: "expiresAt",
      key: "validation.passport.expiry.tooSoon",
      params: { monthsRequired: 3 },
    });
  });

  it("accepts a passport that clears the margin", () => {
    expect(parsePassport({ ...valid, expiresAt: monthsFromNow(4) }).ok).toBe(true);
  });
});

describe("one answer at a time", () => {
  it("checks a single question with the same rule the whole form uses", () => {
    expect(parseQuestion("applicant.pinyin", "CHEN JING").ok).toBe(true);
    expect(parseQuestion("applicant.pinyin", "陈静").ok).toBe(false);
  });

  it("checks validity as soon as the expiry date is given", () => {
    // This rule needs no other answer, so holding it back would mean someone
    // fills in six more sections before learning their passport is too short.
    const soon = new Date();
    soon.setUTCMonth(soon.getUTCMonth() + 1);
    const result = parseQuestion("passport.expiresAt", soon.toISOString().slice(0, 10));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues).toEqual([
      { path: "", key: "validation.passport.expiry.tooSoon", params: { monthsRequired: 3 } },
    ]);
  });

  it("holds back only the rules that need another answer", () => {
    // Whether the expiry precedes the issue date cannot be judged before the
    // issue date has been asked for.
    const far = new Date();
    far.setUTCFullYear(far.getUTCFullYear() + 5);
    expect(parseQuestion("passport.expiresAt", far.toISOString().slice(0, 10)).ok).toBe(true);
  });
});
