import { describe, expect, it } from "vitest";
import { documentCompleteness, documentsFor, SCHENGEN_SPAIN_DOCUMENTS } from "./schengen-spain";

const PAYS_SELF = { companions: { whoPays: "self" }, history: { schengenBefore: "no" } };

function stored(...ids: string[]) {
  return ids.map((document) => ({ document, status: "stored" }));
}

describe("which documents a route asks for", () => {
  it("leaves out the ones that do not apply", () => {
    const ids = documentsFor(PAYS_SELF).map((document) => document.id);
    expect(ids).not.toContain("sponsorProof");
    expect(ids).not.toContain("previousVisas");
  });

  it("asks for the payer's own proof of funds when somebody else is paying", () => {
    const ids = documentsFor({ companions: { whoPays: "employer" } }).map((d) => d.id);
    expect(ids).toContain("sponsorProof");
  });

  it("asks for earlier visas when there have been earlier visas", () => {
    const ids = documentsFor({ history: { schengenBefore: "yes" } }).map((d) => d.id);
    expect(ids).toContain("previousVisas");
  });
});

describe("what is still outstanding", () => {
  const mandatory = SCHENGEN_SPAIN_DOCUMENTS.filter(
    (document) => document.necessity === "required",
  ).map((document) => document.id);

  it("is not complete when nothing has been uploaded", () => {
    const result = documentCompleteness(PAYS_SELF, []);
    expect(result.complete).toBe(false);
    expect(result.missing).toEqual(mandatory);
  });

  it("is complete once every mandatory document is confirmed", () => {
    const result = documentCompleteness(PAYS_SELF, stored(...mandatory));
    expect(result).toEqual({ missing: [], pending: [], complete: true });
  });

  it("does not count a document the server has not confirmed", () => {
    // The row exists because the browser said it was uploading. Treating that
    // as done is how a missing passport scan reaches a reviewer.
    const uploads = [
      ...stored(...mandatory.filter((id) => id !== "passportBio")),
      { document: "passportBio", status: "pending" },
    ];

    const result = documentCompleteness(PAYS_SELF, uploads);
    expect(result.complete).toBe(false);
    expect(result.missing).toContain("passportBio");
    expect(result.pending).toContain("passportBio");
  });

  it("does not hold up an application for a recommended document", () => {
    const result = documentCompleteness(PAYS_SELF, stored(...mandatory));
    expect(result.complete).toBe(true);
    expect(result.missing).not.toContain("socialInsurance");
  });

  it("holds up an application for a conditional document that applies", () => {
    const answers = { companions: { whoPays: "family" } };
    const result = documentCompleteness(answers, stored(...mandatory));
    expect(result.complete).toBe(false);
    expect(result.missing).toEqual(["sponsorProof"]);
  });
});
