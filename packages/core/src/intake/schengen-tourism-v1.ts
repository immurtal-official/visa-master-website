import { z } from "zod";
import { toResult, type ValidationResult } from "../validation/issue";
import {
  OPTION_GROUPS,
  QUESTIONNAIRE,
  answerPath,
  type Keyboard,
  type OptionGroup,
  type QuestionDefinition,
  type SectionDefinition,
} from "./questionnaire";

/**
 * Everything the rest of the system reads about the intake, derived from the
 * one declaration in questionnaire.ts.
 *
 * Nothing in this file is edited to change the form. It exists so that the
 * screens, the API and the submission check keep reading the shapes they
 * always have — a lookup by answer path — while the questionnaire itself is
 * written in one place.
 */

export {
  OPTION_GROUPS,
  TRAVELLING_WITH,
  WHO_PAYS,
  YES_NO_UNSURE,
  type OptionGroup,
} from "./questionnaire";
export { PASSPORT_VALIDITY_MONTHS } from "./rules";

/** How a field should behave on a phone, plus how its answer is given. */
export interface FieldBehaviour extends Keyboard {
  /** How the answer is given: free text unless stated. */
  kind?: "date" | "choice";
}

type QuestionSection = Extract<SectionDefinition, { questions: QuestionDefinition[] }>;

const questionSections: QuestionSection[] = (QUESTIONNAIRE.sections as SectionDefinition[]).filter(
  (section): section is QuestionSection => section.kind !== "review",
);

/** Every question with its section and its answer path, in form order. */
const entries = questionSections.flatMap((section) =>
  (section.questions ?? []).map((question) => ({
    section,
    question,
    path: answerPath(section.id, question),
  })),
);

function isSchema(value: unknown): value is z.ZodType {
  return typeof (value as { safeParse?: unknown } | null)?.safeParse === "function";
}

/**
 * The rule a question's answer must meet, or undefined when the declaration
 * does not give a usable one.
 *
 * Deliberately forgiving: a choice naming an option set that does not exist,
 * or a question with no rule, must not stop this module loading — then every
 * test would fail with a stack trace, and the gate could not say in plain
 * words which question is wrong. Such a question gets no rule here, the gate
 * reports it, and the whole-form check refuses any answer to it.
 */
function ruleOf(question: QuestionDefinition): z.ZodType | undefined {
  if (question.kind === "choice") {
    const options = (OPTION_GROUPS as Record<string, readonly string[]>)[question.options];
    return options && options.length > 0 ? z.enum(options as [string, ...string[]]) : undefined;
  }
  return isSchema(question.rule) ? question.rule : undefined;
}

/** The rule applied when the question is answered on its own page. */
function aloneRuleOf(question: QuestionDefinition): z.ZodType | undefined {
  if (question.kind !== "choice" && question.alone !== undefined) {
    return isSchema(question.alone) ? question.alone : undefined;
  }
  return ruleOf(question);
}

export const FIELD_BEHAVIOUR: Record<string, FieldBehaviour> = Object.fromEntries(
  entries.map(({ question, path }) => [
    path,
    question.kind === "choice"
      ? { kind: "choice" }
      : {
          ...question.keyboard,
          ...(question.kind === "date" ? { kind: "date" as const } : {}),
        },
  ]),
);

/** Which option set each choice question offers. */
export const QUESTION_OPTION_GROUP: Record<string, OptionGroup> = Object.fromEntries(
  entries.flatMap(({ question, path }) =>
    question.kind === "choice" ? [[path, question.options] as const] : [],
  ),
);

/** The options a choice question offers, in the order they are shown. */
export const QUESTION_OPTIONS: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(QUESTION_OPTION_GROUP).map(([path, group]) => [path, OPTION_GROUPS[group]]),
);

/**
 * Validate one answer, as it is given.
 *
 * The step rules are the questionnaire's own, so a rule cannot be stricter at
 * submission than it is on its own page — only rules that need another answer
 * wait.
 */
export const QUESTION_SCHEMAS: Record<string, z.ZodType> = Object.fromEntries(
  entries.flatMap(({ question, path }) => {
    const rule = aloneRuleOf(question);
    return rule ? [[path, rule] as const] : [];
  }),
);

const coreQuestions = (section: QuestionSection) =>
  (section.questions ?? []).filter((question) => !question.extra);
const extraQuestions = (section: QuestionSection) =>
  (section.questions ?? []).filter((question) => question.extra);

/** A set of questions as an object schema, keyed by question id. */
function objectOf(questions: QuestionDefinition[]) {
  return z.object(
    Object.fromEntries(questions.map((question) => [question.id, ruleOf(question) ?? z.never()])),
  );
}

/**
 * One section's core answers, with the rules that relate them.
 *
 * Extra questions are not part of it: they are stored under `extra`, and a
 * section-level rule is engineering code about the core answers.
 */
function sectionSchema(section: QuestionSection) {
  const shape = objectOf(coreQuestions(section));
  return section.check ? shape.superRefine(section.check) : shape;
}

/** A core section's schema by id; one that has been removed accepts nothing. */
function sectionSchemaById(id: string) {
  const section = questionSections.find((s) => s.id === id);
  return section ? sectionSchema(section) : z.never();
}

export const applicantSchema = sectionSchemaById("applicant");
export const passportSchema = sectionSchemaById("passport");
export const residenceSchema = sectionSchemaById("residence");
export const employmentSchema = sectionSchemaById("employment");
export const travelSchema = sectionSchemaById("travel");
export const companionsSchema = sectionSchemaById("companions");
export const historySchema = sectionSchemaById("history");

/**
 * The whole intake: each section's core answers under its id, and every
 * extra answer under `extra.<section>`.
 */
const extraSections = questionSections.filter((section) => extraQuestions(section).length > 0);
const wholeForm = z.object({
  ...Object.fromEntries(
    questionSections
      .filter((section) => coreQuestions(section).length > 0)
      .map((section) => [section.id, sectionSchema(section)]),
  ),
  ...(extraSections.length > 0
    ? {
        extra: z.object(
          Object.fromEntries(
            extraSections.map((section) => [section.id, objectOf(extraQuestions(section))]),
          ),
        ),
      }
    : {}),
});
export const intakeSchengenTourismV1 = QUESTIONNAIRE.check
  ? wholeForm.superRefine(QUESTIONNAIRE.check)
  : wholeForm;

/** The answers, as the whole-form check returns them: section → question → value. */
export type IntakeSchengenTourismV1 = Record<string, Record<string, unknown>>;

/**
 * Validate one answer with the same rules the whole form uses.
 *
 * Only rules that need another answer are held back until it exists.
 */
export function parseQuestion(path: string, value: unknown): ValidationResult<unknown> {
  const schema = QUESTION_SCHEMAS[path];
  if (schema) return toResult(schema.safeParse(value), value);

  // A path with no schema is accepted unchanged. Nothing in the intake should
  // reach this: questionnaire.test.ts fails for any question without a schema.
  return { ok: true, data: value };
}

export function parseApplicant(input: unknown) {
  return toResult(applicantSchema.safeParse(input), input);
}

export function parsePassport(input: unknown) {
  return toResult(passportSchema.safeParse(input), input);
}

/**
 * The whole form, checked at once.
 *
 * This runs before anything is enqueued, and the same schema runs again in the
 * conductor: the rules have one home, and a job is never created from answers
 * that would not pass them.
 */
export function parseIntake(input: unknown) {
  return toResult(intakeSchengenTourismV1.safeParse(input), input);
}
