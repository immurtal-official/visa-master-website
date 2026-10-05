import { describe, expect, it, vi } from "vitest";

/**
 * Extra questions, against a questionnaire that has some.
 *
 * The real questionnaire has none yet, so this one is the real questionnaire
 * plus one extra question appended to a core section and a whole extra-only
 * section — the two shapes a partner's edit takes.
 */
vi.mock("./questionnaire", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./questionnaire")>();
  const { text } = await import("./rules");
  const sections = (
    actual.QUESTIONNAIRE.sections as import("./questionnaire").SectionDefinition[]
  ).map((section) =>
    section.id === "travel" && "questions" in section
      ? {
          ...section,
          questions: [
            ...section.questions,
            { id: "probeHotel", extra: true, rule: text(1, 100), example: "Hotel Sol" },
          ],
        }
      : section,
  );
  const review = sections.pop()!;
  return {
    ...actual,
    QUESTIONNAIRE: {
      ...actual.QUESTIONNAIRE,
      sections: [
        ...sections,
        {
          id: "probeSection",
          questions: [
            {
              id: "probeChoice",
              extra: true,
              kind: "choice",
              options: "yesNoUnsure",
              example: "yes",
            },
          ],
        },
        review,
      ],
    },
  };
});

const { INTAKE_SECTIONS, askedPath, intakeProgress } = await import("./sections");
const { FIELD_BEHAVIOUR, QUESTION_SCHEMAS, parseIntake, parseQuestion } =
  await import("./schengen-tourism-v1");
const { currentContract } = await import("./contract");
const { QUESTIONNAIRE } = await import("./questionnaire");
type SectionDefinition = import("./questionnaire").SectionDefinition;
const { declarationProblems } = await import("./declaration");

const iso = (months: number) => {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
};

const CORE = {
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
  companions: { travellingWith: "alone", whoPays: "self" },
  history: { schengenBefore: "no", refused: "no" },
};

describe("extra questions", () => {
  it("are stored under extra.<section>.<id>, in the section they were placed in", () => {
    const travel = INTAKE_SECTIONS.find((s) => s.id === "travel")!;
    expect(travel.questions.map((q) => q.path)).toContain("extra.travel.probeHotel");
    const probeSection = INTAKE_SECTIONS.find((s) => s.id === "probeSection")!;
    expect(probeSection.questions).toEqual([
      { id: "probeChoice", path: "extra.probeSection.probeChoice" },
    ]);
  });

  it("are validated one at a time like any other question", () => {
    expect(parseQuestion("extra.travel.probeHotel", "Hotel Sol").ok).toBe(true);
    expect(parseQuestion("extra.travel.probeHotel", "").ok).toBe(false);
    expect(parseQuestion("extra.probeSection.probeChoice", "maybe").ok).toBe(false);
    expect(FIELD_BEHAVIOUR["extra.probeSection.probeChoice"]).toEqual({ kind: "choice" });
    expect(Object.keys(QUESTION_SCHEMAS)).toContain("extra.travel.probeHotel");
  });

  it("count towards finishing the form", () => {
    const asked = askedPath(CORE).map((question) => question.path);
    expect(asked).toContain("extra.travel.probeHotel");
    expect(asked).toContain("extra.probeSection.probeChoice");
    const progress = intakeProgress(CORE);
    expect(progress.total - progress.answered).toBe(
      asked.filter((path) => path.startsWith("extra.")).length,
    );
  });

  it("must be answered before submission, and travel to the job under extra", () => {
    expect(parseIntake(CORE).ok).toBe(false);

    // Every asked extra question answered with its own declared example.
    const examples = new Map<string, string>(
      (QUESTIONNAIRE.sections as SectionDefinition[]).flatMap((section) =>
        "questions" in section
          ? section.questions
              .filter((q) => q.extra)
              .map((q) => [`extra.${section.id}.${q.id}`, q.example!] as const)
          : [],
      ),
    );
    const extra: Record<string, Record<string, string>> = {};
    for (const { path } of askedPath(CORE)) {
      if (!path.startsWith("extra.")) continue;
      const [, section, id] = path.split(".");
      (extra[section!] ??= {})[id!] = examples.get(path)!;
    }
    expect(extra.travel?.probeHotel).toBe("Hotel Sol");
    expect(extra.probeSection?.probeChoice).toBe("yes");

    const result = parseIntake({ ...CORE, extra });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const data = result.data as Record<string, unknown>;
    expect(data.extra).toEqual(extra);
    // The core section itself is unchanged by the extra question placed in it.
    expect(data.travel).toEqual(CORE.travel);
  });

  it("leave the contract exactly as it was", async () => {
    const { readFileSync } = await import("node:fs");
    const locked = JSON.parse(
      readFileSync(new URL("./contract.lock.json", import.meta.url), "utf8"),
    ) as { questions: unknown; checks: unknown };
    const current = currentContract();
    expect(current.questions).toEqual(locked.questions);
    expect(current.checks).toEqual(locked.checks);
  });

  it("are well formed", () => {
    expect(declarationProblems()).toEqual([]);
  });

  it("may only use a named rule, because the backend runs rules by name", async () => {
    const { z } = await import("zod");
    const travel = (QUESTIONNAIRE.sections as SectionDefinition[]).find((s) => s.id === "travel");
    if (!travel || !("questions" in travel)) throw new Error("travel section missing");
    const inline = { id: "probeInline", extra: true as const, rule: z.string(), example: "x" };
    travel.questions.push(inline);
    try {
      expect(declarationProblems()).toEqual([
        expect.stringContaining("`travel/probeInline` 的 rule 必须是 rules.ts 里有名字的规则"),
      ]);
    } finally {
      travel.questions.splice(travel.questions.indexOf(inline), 1);
    }
  });
});
