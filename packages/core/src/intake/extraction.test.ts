import { describe, expect, it } from "vitest";
import { extractableFields } from "../rules/schengen-spain";
import { decideProposals, extractionResultSchema } from "./extraction";

const requested = extractableFields("passportBio");

const read = [
  { field: "passport.number", value: "e1234 5678", confidence: 0.98, sourcePage: 1 },
  { field: "passport.issuedAt", value: "2020-06-01", confidence: 0.9 },
  { field: "applicant.pinyin", value: "chen jing", confidence: 0.95 },
];

describe("what a document's reading becomes", () => {
  it("proposes requested fields for unanswered questions, normalised by the question's rule", () => {
    const { recorded, proposals } = decideProposals({
      fields: read,
      requested,
      answers: {},
      sources: [],
    });
    expect(recorded).toHaveLength(3);
    expect(proposals).toEqual([
      { path: "passport.number", value: "E12345678" },
      { path: "passport.issuedAt", value: "2020-06-01" },
      { path: "applicant.pinyin", value: "CHEN JING" },
    ]);
  });

  it("never overwrites what the applicant typed, with or without a record of it", () => {
    const { proposals } = decideProposals({
      fields: read,
      requested,
      answers: {
        passport: { number: "G00000000", issuedAt: "2019-01-01" },
      },
      sources: [{ path: "passport.number", source: "applicant", confirmed_at: "2026-10-05" }],
    });
    // number: typed with a source row; issuedAt: typed before sources existed.
    expect(proposals.map((p) => p.path)).toEqual(["applicant.pinyin"]);
  });

  it("replaces an earlier proposal, which was never the applicant's", () => {
    const { proposals } = decideProposals({
      fields: read,
      requested,
      answers: { passport: { number: "E00000000" } },
      sources: [{ path: "passport.number", source: "document", confirmed_at: null }],
    });
    expect(proposals.map((p) => p.path)).toContain("passport.number");
  });

  it("records but does not propose a value its question would refuse", () => {
    const { recorded, proposals } = decideProposals({
      fields: [{ field: "passport.number", value: "E123" }],
      requested,
      answers: {},
      sources: [],
    });
    expect(recorded).toHaveLength(1);
    expect(proposals).toEqual([]);
  });

  it("ignores fields the document was not asked for, and repeats of one it was", () => {
    const { recorded } = decideProposals({
      fields: [
        { field: "employment.monthlyIncome", value: "9000" },
        { field: "passport.number", value: "E12345678" },
        { field: "passport.number", value: "X99999999" },
      ],
      requested,
      answers: {},
      sources: [],
    });
    expect(recorded).toEqual([{ field: "passport.number", value: "E12345678" }]);
  });
});

describe("an extractor's report", () => {
  it("is held to its shape", () => {
    expect(extractionResultSchema.safeParse({ fields: read }).success).toBe(true);
    expect(extractionResultSchema.safeParse({ fields: [{ field: "x", value: "" }] }).success).toBe(
      false,
    );
    expect(
      extractionResultSchema.safeParse({ fields: [{ field: "x", value: "y", confidence: 2 }] })
        .success,
    ).toBe(false);
    expect(extractionResultSchema.safeParse({}).success).toBe(false);
  });
});
