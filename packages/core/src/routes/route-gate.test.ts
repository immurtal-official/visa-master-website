import { describe, expect, it } from "vitest";
import { CHENGDU_DISTRICT_AREAS, checkRoute, parseRouteCheck, type RouteCheck } from "./route-gate";

const SERVED: RouteCheck = {
  residenceArea: "sichuan",
  destination: "ES",
  purpose: "tourism",
  employment: "employed",
};

describe("the route gate", () => {
  it("serves a Chengdu-district resident travelling to Spain for tourism, in employment", () => {
    expect(checkRoute(SERVED)).toEqual({ supported: true });
  });

  it("serves every area the Chengdu consulate covers", () => {
    for (const residenceArea of CHENGDU_DISTRICT_AREAS) {
      expect(checkRoute({ ...SERVED, residenceArea })).toEqual({ supported: true });
    }
  });

  it("turns away another consular district", () => {
    expect(checkRoute({ ...SERVED, residenceArea: "other" })).toEqual({
      supported: false,
      reasons: ["route.unsupported.reason.area"],
    });
  });

  it("turns away another destination", () => {
    expect(checkRoute({ ...SERVED, destination: "FR" })).toEqual({
      supported: false,
      reasons: ["route.unsupported.reason.destination"],
    });
  });

  it("turns away a purpose that is not personal tourism", () => {
    for (const purpose of ["family", "business", "conference"] as const) {
      expect(checkRoute({ ...SERVED, purpose })).toEqual({
        supported: false,
        reasons: ["route.unsupported.reason.purpose"],
      });
    }
  });

  it("turns away applicants who are not in employment", () => {
    for (const employment of ["student", "retired", "self_employed"] as const) {
      expect(checkRoute({ ...SERVED, employment })).toEqual({
        supported: false,
        reasons: ["route.unsupported.reason.employment"],
      });
    }
  });

  it("reports every reason at once rather than one at a time", () => {
    const verdict = checkRoute({
      residenceArea: "other",
      destination: "FR",
      purpose: "business",
      employment: "student",
    });

    expect(verdict).toEqual({
      supported: false,
      reasons: [
        "route.unsupported.reason.area",
        "route.unsupported.reason.destination",
        "route.unsupported.reason.purpose",
        "route.unsupported.reason.employment",
      ],
    });
  });
});

describe("parsing a route check", () => {
  it("accepts a complete answer", () => {
    expect(parseRouteCheck(SERVED)).toEqual({ ok: true, data: SERVED });
  });

  it("reports each unanswered question with a key, never a sentence", () => {
    const result = parseRouteCheck({});
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.issues).toEqual([
      { path: "residenceArea", key: "validation.required" },
      { path: "destination", key: "validation.required" },
      { path: "purpose", key: "validation.required" },
      { path: "employment", key: "validation.required" },
    ]);
  });

  it("rejects a value that is not one of the offered answers", () => {
    const result = parseRouteCheck({ ...SERVED, destination: "XX" });
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.issues).toEqual([{ path: "destination", key: "validation.invalid" }]);
  });
});
