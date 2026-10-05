import { expect, type Page } from "@playwright/test";
import {
  FIELD_BEHAVIOUR,
  INTAKE_SECTIONS,
  QUESTION_OPTION_GROUP,
  QUESTIONNAIRE,
  answerPath,
  askedAnswers,
  askedPath,
  type SectionDefinition,
} from "@visa-master/core";
import en from "../../messages/en.json" with { type: "json" };

/**
 * The intake, as the tests fill it in — read from the questionnaire, not
 * written out again.
 *
 * The specs used to list the twenty questions by hand, in order, with their
 * count as a literal. Adding one question then failed three specs at once,
 * and documents.spec reported a missing document when the real cause was an
 * unanswered question. Now the order, the count and the control type come
 * from the questionnaire itself, and only the answers to core questions are
 * written here, because they have to satisfy rules that relate one to another
 * (a return date after a departure, a passport that outlives the trip).
 * Extra questions are answered with the example each one declares.
 */

function isoIn(months: number, day = 15): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${String(day).padStart(2, "0")}`;
}

/** A valid answer for every core question, by answer path. */
const CORE_ANSWERS: Record<string, string> = {
  "applicant.name": "陈静",
  "applicant.pinyin": "CHEN JING",
  "applicant.birthDate": "1990-04-12",
  "applicant.phone": "13800000000",
  "passport.number": "E12345678",
  "passport.issuedAt": "2020-06-01",
  "passport.expiresAt": isoIn(30),
  "residence.city": "成都",
  "residence.address": "四川省成都市武侯区天府大道 1 号 2 单元 301",
  "employment.employer": "成都某某科技有限公司",
  "employment.position": "软件架构师",
  "employment.startDate": "2020-03-01",
  "employment.monthlyIncome": "6000",
  "travel.departureDate": isoIn(2),
  "travel.returnDate": isoIn(3),
  "travel.cities": "Madrid, Seville, Barcelona",
  "companions.travellingWith": "alone",
  "companions.whoPays": "self",
  "history.schengenBefore": "no",
  "history.refused": "no",
};

/** Each extra question's declared example, by answer path. */
const EXAMPLES: Record<string, string> = Object.fromEntries(
  (QUESTIONNAIRE.sections as SectionDefinition[]).flatMap((section) =>
    "questions" in section
      ? section.questions
          .filter((question) => question.extra && question.example !== undefined)
          .map((question) => [answerPath(section.id, question), question.example!])
      : [],
  ),
);

/** Every question the questionnaire has, asked or not. */
const ALL_QUESTIONS = INTAKE_SECTIONS.filter((section) => section.kind === "questions").flatMap(
  (section) => section.questions.map((question) => ({ sectionId: section.id, ...question })),
);

/** The answer the tests give to the question stored at `path`. */
export function answerFor(path: string): string {
  const answer = CORE_ANSWERS[path] ?? EXAMPLES[path];
  if (answer === undefined) {
    throw new Error(
      `e2e/support/intake.ts has no answer for "${path}". ` +
        "A core question needs one in CORE_ANSWERS; an extra question takes its `example`.",
    );
  }
  return answer;
}

/** An answer to every question, nested the way `applications.answers` stores them. */
function everyAnswer(): Record<string, unknown> {
  const answers: Record<string, unknown> = {};
  for (const { path } of ALL_QUESTIONS) {
    const keys = path.split(".");
    const last = keys.pop()!;
    let node = answers;
    for (const key of keys) node = (node[key] ??= {}) as Record<string, unknown>;
    node[last] = answerFor(path);
  }
  return answers;
}

/**
 * The questions these answers lead the form to ask, in order — what someone
 * clicking through it sees, branches included or skipped as the answers decide.
 */
export const QUESTIONS = askedPath(everyAnswer());

/** The answers to exactly the questions asked, as a finished form stores them. */
export function completeAnswers(): Record<string, unknown> {
  return askedAnswers(everyAnswer());
}

/** The hub's progress line once every question is answered. */
export function allAnsweredText(): string {
  return en.intake.progress
    .replace("{answered}", String(QUESTIONS.length))
    .replace("{total}", String(QUESTIONS.length));
}

type Catalogue = Record<string, Record<string, string>>;

/** Answer every question through the form, in order, from the first one. */
export async function answerEveryQuestion(page: Page): Promise<void> {
  const wording = en.intake.question as Catalogue;
  const options = en.intake.option as Catalogue;

  for (const { sectionId, id, path } of QUESTIONS) {
    const question = wording[sectionId]![id]!;
    const answer = answerFor(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(question);

    const kind = FIELD_BEHAVIOUR[path]?.kind;
    if (kind === "choice") {
      const label = options[QUESTION_OPTION_GROUP[path]!]![answer]!;
      await page.getByLabel(label, { exact: true }).check();
    } else if (kind === "date") {
      const [year, month, day] = answer.split("-");
      await page.getByLabel(en.intake.date.year).fill(year!);
      await page.getByLabel(en.intake.date.month).fill(month!);
      await page.getByLabel(en.intake.date.day).fill(day!);
    } else {
      await page.getByLabel(question).fill(answer);
    }
    await page.getByRole("button", { name: en.intake.next }).click();
  }
}
