import {
  askedAnswers,
  askedPath,
  checkRoute,
  conditionHolds,
  documentCompleteness,
  documentsFor,
  documentsForJob,
  extractableFields,
  findAskedQuestion,
  intakeProgress,
  nextQuestion,
  parseEmail,
  parseIntake,
  parseOtpCode,
  parseQuestion,
  parseRouteCheck,
  placeholderIssues,
  type Condition,
} from "../index";
import { parseDate } from "../intake/rules";
import { INTAKE_SECTIONS } from "../intake/sections";
import { SCHENGEN_SPAIN_DOCUMENTS } from "../rules/schengen-spain";
import { DESTINATIONS, EMPLOYMENT_STATUSES, PURPOSES, RESIDENCE_AREAS } from "../routes/route-gate";

/**
 * Conformance vectors: inputs and the outputs this package gives for them.
 *
 * A second implementation of the rules (the Python backend, ADR-005) must
 * reproduce every one. They are computed at a fixed instant, NOW, because
 * several rules are relative to today; the other implementation evaluates them
 * at the same instant.
 *
 * The inputs are meant to be hostile as much as typical — every field set to a
 * spread of good and bad values, sections removed, the wrong types, relations
 * between answers broken — because the cases where two implementations of zod's
 * semantics disagree are the edges, not the middle.
 */

export const NOW = "2026-10-05T12:00:00.000Z";

/**
 * A second instant, for the boundaries a midday clock cannot reach: a date is
 * midnight, so only at midnight is "today" equal to now, and "yesterday"
 * exactly one day before it.
 */
export const MIDNIGHT = "2026-10-05T00:00:00.000Z";

export interface Vector {
  fn: string;
  args: unknown[];
  result: unknown;
  /** The instant it was computed at, when not NOW. */
  now?: string;
}

function iso(months: number, days = 0): string {
  const date = new Date(NOW);
  date.setUTCMonth(date.getUTCMonth() + months);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** A complete, valid set of answers to every core question. */
function validAnswers(): Record<string, Record<string, unknown>> {
  return {
    applicant: {
      name: "陈静",
      pinyin: "chen jing",
      birthDate: "1990-05-01",
      phone: "138 0000 0000",
    },
    passport: { number: "e1234 5678", issuedAt: "2020-01-01", expiresAt: iso(30) },
    residence: { city: "成都", address: "武侯区某路 1 号" },
    employment: {
      employer: "某公司",
      position: "工程师",
      startDate: "2018-03-01",
      monthlyIncome: "12,000",
    },
    travel: { departureDate: iso(2), returnDate: iso(2, 10), cities: "马德里、巴塞罗那" },
    companions: { travellingWith: "alone", whoPays: "self" },
    history: { schengenBefore: "no", refused: "no" },
  };
}

/** Strings a question may receive: the form always sends one. */
const STRINGS = [
  "",
  " ",
  "x",
  "ab",
  "陈静",
  "CHEN-JING",
  "chen jing",
  "Chen  Jing",
  "陈 jing",
  "1990-05-01",
  "1990-5-1",
  "2999-01-01",
  "1990-13-45",
  "1990-02-30",
  "0000-00-00",
  " 2020-01-01 ",
  iso(0),
  iso(0, 1),
  iso(0, -1),
  iso(1),
  iso(3),
  iso(3, -1),
  iso(3, 1),
  iso(4),
  iso(-1),
  iso(-24),
  "E12345678",
  "e1234 5678",
  "E1234567",
  "E123456789",
  "E1234567!",
  "13800000000",
  "138-0000-0000",
  "138 0000 0000",
  "23800000000",
  "1380000000",
  "02812345678",
  "12,000.50",
  "12000.555",
  "¥ 9000",
  "1.234",
  "1234567890",
  "abc",
  "alone",
  "family",
  "friends",
  "colleagues",
  "self",
  "employer",
  "yes",
  "no",
  "unsure",
  "nope",
  "马德里",
  "a".repeat(40),
  "a".repeat(41),
  "a".repeat(60),
  "a".repeat(61),
  "a".repeat(80),
  "a".repeat(81),
  "a".repeat(120),
  "a".repeat(121),
  "a".repeat(200),
  "a".repeat(201),
  "abc ",
  "abcd",
];

/** Values a stored answer may hold, which the whole-form check must survive. */
const STORED = [...STRINGS.filter((_, i) => i % 3 === 0), null, 42, true, {}, [], ["x"]];

const PATHS = INTAKE_SECTIONS.flatMap((section) => section.questions.map((q) => q.path));

function intakeCases(): unknown[] {
  const cases: unknown[] = [
    validAnswers(),
    {},
    null,
    "x",
    7,
    [],
    { applicant: validAnswers().applicant },
  ];
  const valid = validAnswers();
  for (const [section, fields] of Object.entries(valid)) {
    for (const field of Object.keys(fields)) {
      for (const value of STORED) {
        const copy = structuredClone(valid);
        copy[section]![field] = value;
        cases.push(copy);
      }
      const missing = structuredClone(valid);
      delete missing[section]![field];
      cases.push(missing);
    }
    const without = structuredClone(valid) as Record<string, unknown>;
    delete without[section];
    cases.push(without);
    const wrong = structuredClone(valid) as Record<string, unknown>;
    wrong[section] = "not an object";
    cases.push(wrong);
  }
  return [...cases, ...relationCases()];
}

/** Answers that break a relation between two answers, mostly between dates. */
function relationCases(): unknown[] {
  const cases: unknown[] = [];
  const valid = validAnswers();
  const patch = (change: (v: Record<string, Record<string, unknown>>) => void) => {
    const copy = structuredClone(valid);
    change(copy);
    cases.push(copy);
  };
  patch((v) => {
    v.travel!.departureDate = iso(0);
  });
  patch((v) => {
    v.passport!.issuedAt = iso(0);
  });
  patch((v) => {
    v.passport!.expiresAt = iso(3);
    v.travel!.returnDate = iso(0);
    v.travel!.departureDate = iso(0);
  });
  patch((v) => {
    v.passport!.issuedAt = "2024-01-01";
    v.passport!.expiresAt = "2023-01-01";
  });
  patch((v) => {
    v.passport!.expiresAt = iso(4);
    v.travel!.departureDate = iso(2);
    v.travel!.returnDate = iso(3);
  });
  patch((v) => {
    v.passport!.expiresAt = iso(6);
    v.travel!.returnDate = iso(3);
  });
  patch((v) => {
    v.travel!.returnDate = iso(1);
  });
  patch((v) => {
    v.travel!.departureDate = iso(0, -2);
  });
  patch((v) => {
    v.travel!.departureDate = iso(0, -1);
  });
  patch((v) => {
    v.passport!.issuedAt = iso(2);
  });
  patch((v) => {
    v.passport!.issuedAt = "bad";
    v.passport!.expiresAt = "bad";
  });
  patch((v) => {
    v.travel!.departureDate = "bad";
    v.travel!.returnDate = "2027-02-30";
  });
  patch((v) => {
    (v as Record<string, unknown>).unexpected = { anything: 1 };
    v.applicant!.unexpected = "dropped";
  });
  patch((v) => {
    (v as Record<string, unknown>).extra = { travel: { anything: "x" } };
  });
  return cases;
}

const CONDITIONS: Condition[] = [
  { answer: "companions.whoPays", is: "family" },
  { answer: "companions.whoPays", in: ["family", "employer"] },
  { answer: "history.schengenBefore", is: "yes" },
  { not: { answer: "companions.whoPays", is: "self" } },
  {
    all: [
      { answer: "companions.whoPays", is: "family" },
      { answer: "history.schengenBefore", in: ["yes", "unsure"] },
    ],
  },
  {
    any: [
      { answer: "companions.whoPays", is: "employer" },
      { not: { answer: "history.refused", is: "no" } },
    ],
  },
  { all: [] },
  { any: [] },
  { answer: "applicant.name", is: "陈静" },
  { answer: "nowhere.at.all", is: "x" },
];

function answerVariants(): unknown[] {
  const variants: unknown[] = [{}, null, "x", validAnswers()];
  for (const whoPays of ["self", "family", "employer", "somebody", null]) {
    for (const before of ["yes", "no", "unsure", undefined]) {
      const answers = validAnswers();
      if (whoPays === null) delete answers.companions!.whoPays;
      else answers.companions!.whoPays = whoPays;
      if (before === undefined) delete answers.history!.schengenBefore;
      else answers.history!.schengenBefore = before;
      variants.push(answers);
    }
  }
  const partial = validAnswers();
  delete partial.passport;
  partial.applicant!.phone = "";
  variants.push(partial);
  variants.push({ companions: "employer", history: { schengenBefore: 1 } });
  return variants;
}

function uploadsVariants() {
  const ids = SCHENGEN_SPAIN_DOCUMENTS.map((d) => d.id);
  const row = (i: number, document: string, page: number, status: string) => ({
    id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    document,
    page,
    status,
    content_type: i % 2 ? "image/jpeg" : "application/pdf",
  });
  const all = ids.map((document, i) => row(i, document, 1, "stored"));
  return [
    [],
    all,
    all.map((r, i) => (i % 3 === 0 ? { ...r, status: "pending" } : r)),
    all.map((r, i) => (i % 4 === 0 ? { ...r, status: "deleted" } : r)),
    [...all, row(90, "bankStatement", 2, "stored"), row(91, "bankStatement", 3, "pending")],
    [
      row(92, "bankStatement", 2, "stored"),
      row(93, "passportBio", 1, "stored"),
      row(94, "bankStatement", 1, "stored"),
    ],
    [row(95, "notADocument", 1, "stored")],
  ];
}

/**
 * Every vector. `setNow` moves the clock (the caller fakes it); the vectors are
 * computed at NOW, and the date boundaries again at MIDNIGHT.
 */
export function buildVectors(setNow: (instant: string) => void): Vector[] {
  const vectors: Vector[] = [];
  let now = NOW;
  setNow(now);
  const add = (fn: string, args: unknown[], result: unknown) =>
    vectors.push({
      fn,
      args,
      result: JSON.parse(JSON.stringify(result ?? null)),
      ...(now === NOW ? {} : { now }),
    });

  // How a date is read decides several rules, and JavaScript's reading of one
  // is idiosyncratic (a 30th of February rolls into March; a bare year parses).
  for (const value of [
    ...STRINGS,
    "1990-02-29",
    "2000-02-29",
    "1990-04-31",
    "1990-01-32",
    "1990-00-10",
    "1990-01-00",
    "2020",
    "2020-01",
    "2020-1",
    "+002020-01-01",
    "-000001-01-01",
    "0000-01-01",
    "9999-12-31",
  ]) {
    add("parseDate", [value], parseDate(value)?.toISOString() ?? null);
  }

  for (const path of [...PATHS, "unknown.path"]) {
    for (const value of STRINGS) add("parseQuestion", [path, value], parseQuestion(path, value));
  }
  for (const answers of intakeCases()) add("parseIntake", [answers], parseIntake(answers));

  for (const value of [
    { email: "a@example.com" },
    { email: " A@Example.com " },
    { email: "" },
    { email: "   " },
    { email: "not-an-email" },
    { email: "a@b" },
    { email: "a@b.c" },
    { email: 7 },
    {},
    null,
    "x",
  ]) {
    add("parseEmail", [value], parseEmail(value));
  }
  for (const code of [
    "123456",
    " 123 456 ",
    "",
    "  ",
    "12345",
    "1234567",
    "12a456",
    123456,
    null,
  ]) {
    add("parseOtpCode", [{ code }], parseOtpCode({ code }));
  }
  add("parseOtpCode", [{}], parseOtpCode({}));

  for (const residenceArea of RESIDENCE_AREAS) {
    for (const destination of DESTINATIONS) {
      for (const purpose of PURPOSES) {
        for (const employment of EMPLOYMENT_STATUSES) {
          const answers = { residenceArea, destination, purpose, employment };
          add("checkRoute", [answers], checkRoute(answers));
        }
      }
    }
  }
  for (const input of [
    { residenceArea: "sichuan", destination: "ES", purpose: "tourism", employment: "employed" },
    { residenceArea: "mars", destination: "ES", purpose: "tourism", employment: "employed" },
    { residenceArea: "", destination: "ES", purpose: "tourism" },
    { destination: 7, purpose: null, employment: "employed" },
    {},
    null,
    "x",
  ]) {
    add("parseRouteCheck", [input], parseRouteCheck(input));
  }

  const variants = answerVariants();
  for (const condition of CONDITIONS) {
    for (const answers of variants)
      add("conditionHolds", [condition, answers], conditionHolds(condition, answers));
  }
  for (const answers of variants) {
    add("askedPath", [answers], askedPath(answers));
    add("askedAnswers", [answers], askedAnswers(answers));
    add("intakeProgress", [answers], intakeProgress(answers));
    add("documentsFor", [answers], documentsFor(answers));
    for (const uploads of uploadsVariants()) {
      add("documentCompleteness", [answers, uploads], documentCompleteness(answers, uploads));
      add("documentsForJob", [answers, uploads], documentsForJob(answers, uploads));
    }
    for (const sources of [
      [],
      [{ path: "passport.number", source: "document", confirmed_at: null }],
      [{ path: "passport.number", source: "document", confirmed_at: "2026-10-01T00:00:00Z" }],
      [
        { path: "applicant.name", source: "applicant", confirmed_at: "2026-10-01T00:00:00Z" },
        { path: "applicant.pinyin", source: "document", confirmed_at: null },
        { path: "nowhere.at.all", source: "document", confirmed_at: null },
      ],
    ] as const) {
      add("placeholderIssues", [answers, sources], placeholderIssues(answers, [...sources]));
    }
  }

  const positions = [
    ...INTAKE_SECTIONS.flatMap((s) => s.questions.map((q) => [s.id, q.id])),
    ["review", "x"],
    ["applicant", "nope"],
    ["nope", "name"],
  ];
  for (const [sectionId, questionId] of positions) {
    for (const answers of [validAnswers(), {}]) {
      add(
        "nextQuestion",
        [sectionId, questionId, answers],
        nextQuestion(sectionId!, questionId!, answers),
      );
      add(
        "findAskedQuestion",
        [sectionId, questionId, answers],
        findAskedQuestion(sectionId!, questionId!, answers) ?? null,
      );
    }
  }
  for (const document of [...SCHENGEN_SPAIN_DOCUMENTS.map((d) => d.id), "nope"]) {
    add("extractableFields", [document], extractableFields(document));
  }

  now = MIDNIGHT;
  setNow(now);
  for (const path of PATHS) {
    for (const value of STRINGS) add("parseQuestion", [path, value], parseQuestion(path, value));
  }
  for (const answers of relationCases()) add("parseIntake", [answers], parseIntake(answers));
  setNow(NOW);

  return vectors;
}
