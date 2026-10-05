import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

/**
 * Conformance vectors for branching, which the real questionnaire does not use
 * yet — so a second implementation could get it wrong and every vector from the
 * real one would still agree.
 *
 * The questionnaire here is the real one plus a probe: a section asked only
 * when somebody else pays, holding a core question, a core question asked only
 * when that somebody is family, an extra question, and a rule relating the two
 * core questions that runs only when both are asked; and an extra question in
 * an existing section with a condition of its own. The data and the vectors go
 * into one file, which the backend's tests load in place of the real data.
 */
vi.mock("../intake/questionnaire", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../intake/questionnaire")>();
  const { dateString, text, travelDatesCheck } = await import("../intake/rules");
  const sections = [
    ...(actual.QUESTIONNAIRE.sections as import("../intake/questionnaire").SectionDefinition[]),
  ];
  const review = sections.pop()!;
  const history = sections.findIndex((s) => s.id === "history");
  const withExtra = {
    ...(sections[history] as Extract<(typeof sections)[number], { questions: unknown }>),
  };
  withExtra.questions = [
    ...withExtra.questions,
    {
      id: "probeWhere",
      extra: true,
      rule: text(2, 40),
      example: "法国",
      showIf: { answer: "history.schengenBefore", in: ["yes", "unsure"] },
    },
  ];
  sections[history] = withExtra;
  return {
    ...actual,
    QUESTIONNAIRE: {
      ...actual.QUESTIONNAIRE,
      sections: [
        ...sections,
        {
          id: "probeSponsor",
          showIf: { answer: "companions.whoPays", in: ["family", "employer"] },
          check: travelDatesCheck,
          questions: [
            { id: "departureDate", kind: "date", rule: dateString },
            {
              id: "returnDate",
              kind: "date",
              rule: dateString,
              showIf: { answer: "companions.whoPays", is: "family" },
            },
            { id: "probeName", extra: true, rule: text(1, 60), example: "陈强" },
          ],
        },
        review,
      ],
    },
  };
});

const FILE = fileURLToPath(new URL("../../conformance/branching.json", import.meta.url));

beforeAll(async () => {
  const { NOW } = await import("./vectors");
  vi.useFakeTimers({ now: new Date(NOW), toFake: ["Date"] });
});
afterAll(() => {
  vi.useRealTimers();
});

async function build() {
  const core = await import("../index");
  const { intakeData } = await import("./export");
  const { NOW } = await import("./vectors");

  const base = () => ({
    applicant: { name: "陈静", pinyin: "chen jing", birthDate: "1990-05-01", phone: "13800000000" },
    passport: { number: "E12345678", issuedAt: "2020-01-01", expiresAt: "2029-01-01" },
    residence: { city: "成都", address: "武侯区某路 1 号" },
    employment: {
      employer: "某公司",
      position: "工程师",
      startDate: "2018-03-01",
      monthlyIncome: "1",
    },
    travel: { departureDate: "2026-12-01", returnDate: "2026-12-10", cities: "马德里" },
    companions: { travellingWith: "alone", whoPays: "self" },
    history: { schengenBefore: "no", refused: "no" },
  });

  const answers: unknown[] = [{}, null];
  for (const whoPays of ["self", "family", "employer", undefined]) {
    for (const before of ["yes", "no"]) {
      for (const probe of [
        undefined,
        { departureDate: "2026-12-01", returnDate: "2026-12-10" },
        { departureDate: "2026-12-01", returnDate: "2026-11-01" },
        { departureDate: "2026-12-01", returnDate: "" },
        { departureDate: "2026-12-01" },
        { departureDate: "nope", returnDate: 4 },
      ]) {
        for (const extra of [
          undefined,
          { history: { probeWhere: "法国" }, probeSponsor: { probeName: "陈强" } },
          { history: { probeWhere: "x" }, probeSponsor: { probeName: "", stray: "y" } },
        ]) {
          const a: Record<string, unknown> = base();
          if (whoPays === undefined) delete (a.companions as Record<string, unknown>).whoPays;
          else (a.companions as Record<string, unknown>).whoPays = whoPays;
          (a.history as Record<string, unknown>).schengenBefore = before;
          if (probe) a.probeSponsor = probe;
          if (extra) a.extra = extra;
          answers.push(a);
        }
      }
    }
  }

  const vectors: { fn: string; args: unknown[]; result: unknown }[] = [];
  const add = (fn: string, args: unknown[], result: unknown) =>
    vectors.push({ fn, args, result: JSON.parse(JSON.stringify(result ?? null)) });

  const positions = core.INTAKE_SECTIONS.flatMap((s) => s.questions.map((q) => [s.id, q.id]));
  for (const a of answers) {
    add("parseIntake", [a], core.parseIntake(a));
    add("askedPath", [a], core.askedPath(a));
    add("askedAnswers", [a], core.askedAnswers(a));
    add("intakeProgress", [a], core.intakeProgress(a));
    add("documentsFor", [a], core.documentsFor(a));
    add(
      "sectionState",
      [a],
      core.INTAKE_SECTIONS.map((s) => core.sectionState(s, a)),
    );
    for (const lastStep of [null, "probeSponsor/returnDate"]) {
      add("resumePoint", [a, lastStep], core.resumePoint(a, lastStep));
    }
    add(
      "placeholderIssues",
      [a, [{ path: "probeSponsor.returnDate", source: "document", confirmed_at: null }]],
      core.placeholderIssues(a, [
        { path: "probeSponsor.returnDate", source: "document", confirmed_at: null },
      ]),
    );
  }
  for (const a of answers.filter((_, i) => i % 16 === 2)) {
    for (const [sectionId, questionId] of positions) {
      add(
        "nextQuestion",
        [sectionId, questionId, a],
        core.nextQuestion(sectionId!, questionId!, a),
      );
      add(
        "findAskedQuestion",
        [sectionId, questionId, a],
        core.findAskedQuestion(sectionId!, questionId!, a) ?? null,
      );
    }
  }
  for (const path of [
    "extra.history.probeWhere",
    "probeSponsor.returnDate",
    "extra.probeSponsor.probeName",
  ]) {
    for (const value of ["", "x", "法国", "2026-12-01", 4, null]) {
      add("parseQuestion", [path, value], core.parseQuestion(path, value));
    }
  }
  return { now: NOW, data: intakeData(), vectors };
}

it("分支的一致性测试数据是最新的", async () => {
  const { now, data, vectors } = await build();
  // One vector per line: diffable, and a fraction of the size indented.
  const content =
    `{"now":${JSON.stringify(now)},\n"data":${JSON.stringify(data)},\n"vectors":[\n` +
    `${vectors.map((v) => JSON.stringify(v)).join(",\n")}\n]}\n`;
  if (process.env.UPDATE_CONFORMANCE) {
    writeFileSync(FILE, content);
    return;
  }
  expect(
    readFileSync(FILE, "utf8") === content,
    "packages/core/conformance/branching.json 不是最新的。请运行 pnpm check:intake，然后把它一起提交。",
  ).toBe(true);
});
