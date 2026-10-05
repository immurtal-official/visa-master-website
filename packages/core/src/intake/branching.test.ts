import { describe, expect, it, vi } from "vitest";

/**
 * Branching, against a questionnaire that has some: the real one, plus a
 * section asked only when somebody else pays, holding a question asked only
 * when that somebody is family — a section-level and a question-level
 * condition, one depending on the other.
 */
vi.mock("./questionnaire", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./questionnaire")>();
  const { text } = await import("./rules");
  const sections = [
    ...(actual.QUESTIONNAIRE.sections as import("./questionnaire").SectionDefinition[]),
  ];
  const review = sections.pop()!;
  return {
    ...actual,
    QUESTIONNAIRE: {
      ...actual.QUESTIONNAIRE,
      sections: [
        ...sections,
        {
          id: "probeSponsor",
          showIf: { answer: "companions.whoPays", in: ["family", "employer"] },
          questions: [
            { id: "probeName", extra: true, rule: text(1, 60), example: "陈强" },
            {
              id: "probeRelation",
              extra: true,
              rule: text(1, 20),
              example: "父亲",
              showIf: { answer: "companions.whoPays", is: "family" },
            },
          ],
        },
        review,
      ],
    },
  };
});

const {
  INTAKE_SECTIONS,
  askedAnswers,
  askedPath,
  intakeProgress,
  nextQuestion,
  resumePoint,
  sectionState,
} = await import("./sections");
const { parseIntake } = await import("./schengen-tourism-v1");
const { placeholderIssues } = await import("./provenance");
const { declarationProblems } = await import("./declaration");
const { QUESTIONNAIRE } = await import("./questionnaire");

const iso = (months: number) => {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
};

const core = (whoPays: string) => ({
  applicant: { name: "陈静", pinyin: "CHEN JING", birthDate: "1990-05-01", phone: "13800000000" },
  passport: { number: "E12345678", issuedAt: "2020-01-01", expiresAt: iso(30) },
  residence: { city: "成都", address: "武侯区某路 1 号" },
  employment: {
    employer: "某公司",
    position: "工程师",
    startDate: "2018-03-01",
    monthlyIncome: "12000",
  },
  travel: { departureDate: iso(2), returnDate: iso(3), cities: "马德里" },
  companions: { travellingWith: "alone", whoPays },
  history: { schengenBefore: "no", refused: "no" },
});

/**
 * Every asked extra question answered with its example — except those listed.
 * The real questionnaire may have extra questions of its own on any day, and
 * these tests are about the probe, not about how many there are.
 */
function withExamples(answers: Record<string, unknown>, except: string[] = []) {
  const examples = new Map<string, string>(
    (QUESTIONNAIRE.sections as import("./questionnaire").SectionDefinition[]).flatMap((section) =>
      "questions" in section
        ? section.questions
            .filter((question) => question.extra)
            .map((question) => [`extra.${section.id}.${question.id}`, question.example!] as const)
        : [],
    ),
  );
  const result = structuredClone(answers) as Record<string, Record<string, Record<string, string>>>;
  for (const { path } of askedPath(answers)) {
    if (!path.startsWith("extra.") || except.includes(path)) continue;
    const [, section, id] = path.split(".");
    ((result.extra ??= {})[section!] ??= {})[id!] = examples.get(path)!;
  }
  return result;
}

const asked = (answers: unknown) => askedPath(answers).map((question) => question.path);
const sponsor = INTAKE_SECTIONS.find((s) => s.id === "probeSponsor")!;
const lastReal = INTAKE_SECTIONS.filter((s) => s.id !== "probeSponsor")
  .flatMap((s) => s.questions.map((q) => ({ sectionId: s.id, questionId: q.id })))
  .at(-1)!;

describe("branching", () => {
  it("is well formed", () => {
    expect(declarationProblems()).toEqual([]);
  });

  it("leaves a section out when its condition does not hold", () => {
    expect(sectionState(sponsor, core("self"))).toBe("notNeeded");
    expect(asked(core("self")).filter((p) => p.includes("probeSponsor"))).toEqual([]);
    const progress = intakeProgress(withExamples(core("self")));
    expect(progress.answered).toBe(progress.total);
  });

  it("opens the section, and the question inside it, as the answers allow", () => {
    expect(asked(core("employer"))).toContain("extra.probeSponsor.probeName");
    expect(asked(core("employer"))).not.toContain("extra.probeSponsor.probeRelation");
    expect(asked(core("family"))).toContain("extra.probeSponsor.probeRelation");
    expect(sectionState(sponsor, core("family"))).toBe("todo");
  });

  it("moves on past what is not asked, and into what has just opened", () => {
    expect(nextQuestion(lastReal.sectionId, lastReal.questionId, core("self"))).toBeNull();
    expect(nextQuestion(lastReal.sectionId, lastReal.questionId, core("employer"))).toEqual({
      sectionId: "probeSponsor",
      questionId: "probeName",
    });
    expect(nextQuestion("probeSponsor", "probeName", core("employer"))).toBeNull();
    expect(nextQuestion("probeSponsor", "probeName", core("family"))).toEqual({
      sectionId: "probeSponsor",
      questionId: "probeRelation",
    });
  });

  it("resumes at a question that is still asked", () => {
    expect(resumePoint(withExamples(core("self")), "probeSponsor/probeName")).toBeNull();
    expect(resumePoint(core("family"), "probeSponsor/probeName")).toEqual({
      sectionId: "probeSponsor",
      questionId: "probeName",
    });
  });

  it("submits without the closed branch, and drops what was answered in it", () => {
    const stale = withExamples(core("self"));
    (stale.extra ??= {}).probeSponsor = { probeName: "陈强", probeRelation: "父亲" };
    const result = parseIntake(stale);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const extra = (result.data as { extra?: Record<string, unknown> }).extra;
      expect(extra?.probeSponsor).toBeUndefined();
    }
    expect(
      (askedAnswers(stale).extra as Record<string, unknown> | undefined)?.probeSponsor,
    ).toBeUndefined();
  });

  it("requires the open branch, and only the part of it that is open", () => {
    expect(parseIntake(withExamples(core("employer"), ["extra.probeSponsor.probeName"])).ok).toBe(
      false,
    );
    const result = parseIntake(withExamples(core("employer")));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const extra = (result.data as { extra: Record<string, unknown> }).extra;
      expect(extra.probeSponsor).toEqual({ probeName: "陈强" });
    }
  });
});

describe("placeholder answers", () => {
  const answers = { ...core("family"), extra: { probeSponsor: { probeName: "陈强" } } };

  it("block a question proposed from a document until it is confirmed", () => {
    expect(
      placeholderIssues(answers, [
        { path: "passport.number", source: "document", confirmed_at: null },
      ]),
    ).toEqual([{ path: "passport.number", key: "validation.answer.unconfirmed" }]);
    expect(
      placeholderIssues(answers, [
        { path: "passport.number", source: "document", confirmed_at: "2026-10-05T00:00:00Z" },
        { path: "applicant.name", source: "applicant", confirmed_at: "2026-10-05T00:00:00Z" },
      ]),
    ).toEqual([]);
  });

  it("do not block from a branch that is closed, or from an empty answer", () => {
    const sources = [
      { path: "extra.probeSponsor.probeName", source: "document" as const, confirmed_at: null },
    ];
    expect(placeholderIssues(answers, sources)).toHaveLength(1);
    expect(placeholderIssues({ ...answers, companions: { whoPays: "self" } }, sources)).toEqual([]);
    expect(
      placeholderIssues(core("family"), [
        { path: "extra.probeSponsor.probeRelation", source: "document", confirmed_at: null },
      ]),
    ).toEqual([]);
  });

  it("are not inferred from a missing record: an answer with no source was typed", () => {
    expect(placeholderIssues(answers, [])).toEqual([]);
  });
});
