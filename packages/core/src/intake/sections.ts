import { hasAnswer, readAnswer } from "./answers";
import { conditionHolds, type Condition } from "./condition";
import { QUESTIONNAIRE, answerPath, type SectionDefinition } from "./questionnaire";

export { readAnswer };

/**
 * The intake, as a list of sections and the questions inside them.
 *
 * The form is long and gets filled in over several sittings, so its shape has
 * to be data rather than a sequence of hand-written pages: the hub needs to
 * know what is done, the resume path needs to know where someone stopped, and
 * the completeness check needs to know what "finished" means. One definition
 * answers all three — questionnaire.ts — and this is the navigable view of it.
 *
 * Sections that are not built yet are listed anyway, marked unavailable. The
 * design system is explicit that a section which cannot be entered must say
 * why — hiding it would make the form look shorter than it is, and someone
 * planning an evening around it deserves to see the whole thing.
 */

export interface IntakeQuestion {
  /** Stable id. Used in the URL and stored as the resume point. */
  id: string;
  /** Dot-path into `applications.answers`: `<section>.<question>`, or `extra.…` */
  path: string;
  /** Asked only when this holds of the answers so far. */
  showIf?: Condition;
}

export interface IntakeSection {
  id: string;
  /**
   * "review" is the reading of everything answered at the end. It is stated,
   * not inferred from having no questions: a section emptied by mistake must
   * not turn into a second review card.
   */
  kind: "questions" | "review";
  questions: IntakeQuestion[];
  /** False while the section has not been built. */
  available: boolean;
  /** Asked at all only when this holds of the answers so far. */
  showIf?: Condition;
}

export const INTAKE_SECTIONS: IntakeSection[] = (QUESTIONNAIRE.sections as SectionDefinition[]).map(
  (section) =>
    section.kind === "review"
      ? { id: section.id, kind: "review", questions: [], available: true }
      : {
          id: section.id,
          kind: "questions",
          questions: section.questions.map((question) => ({
            id: question.id,
            path: answerPath(section.id, question),
            ...(question.showIf ? { showIf: question.showIf } : {}),
          })),
          available: section.available ?? true,
          ...(section.showIf ? { showIf: section.showIf } : {}),
        },
);

/**
 * "notNeeded": every question in the section is conditional, and none of the
 * conditions holds for these answers — there is nothing in it to answer.
 */
export type SectionState = "done" | "inProgress" | "todo" | "unavailable" | "notNeeded";

/**
 * Whether a question is asked, given the answers so far.
 *
 * A question is asked when its section is available, its section's `showIf`
 * holds, and its own does. A question that is not asked does not count towards
 * finishing, is skipped when moving on, and its answer — kept if it was given
 * before a controlling answer changed — is left out of the submission.
 */
export function isAsked(
  section: IntakeSection,
  question: IntakeQuestion,
  answers: unknown,
): boolean {
  if (!section.available || section.kind !== "questions") return false;
  if (section.showIf && !conditionHolds(section.showIf, answers)) return false;
  return !question.showIf || conditionHolds(question.showIf, answers);
}

/** The questions of a section that are asked, in order. */
export function askedQuestions(section: IntakeSection, answers: unknown): IntakeQuestion[] {
  return section.questions.filter((question) => isAsked(section, question, answers));
}

/** Every asked question across the intake, in order, with its section. */
export function askedPath(answers: unknown): (IntakeQuestion & { sectionId: string })[] {
  return INTAKE_SECTIONS.flatMap((section) =>
    askedQuestions(section, answers).map((question) => ({ sectionId: section.id, ...question })),
  );
}

/** Whether this question exists and is asked, given the answers. */
export function findAskedQuestion(
  sectionId: string,
  questionId: string,
  answers: unknown,
): IntakeQuestion | undefined {
  const section = INTAKE_SECTIONS.find((s) => s.id === sectionId);
  const question = section?.questions.find((q) => q.id === questionId);
  return section && question && isAsked(section, question, answers) ? question : undefined;
}

export function sectionState(section: IntakeSection, answers: unknown): SectionState {
  if (!section.available) return "unavailable";
  // The review section has nothing of its own to answer; it is ready exactly
  // when everything before it is.
  if (section.kind === "review") {
    const rest = intakeProgress(answers);
    return rest.answered === rest.total ? "done" : "todo";
  }

  const asked = askedQuestions(section, answers);
  if (asked.length === 0) return "notNeeded";
  const answered = asked.filter((question) => hasAnswer(answers, question.path)).length;
  if (answered === 0) return "todo";
  return answered === asked.length ? "done" : "inProgress";
}

/** How far through the whole intake someone is, for the progress line. */
export function intakeProgress(answers: unknown): { answered: number; total: number } {
  const asked = askedPath(answers);
  return {
    answered: asked.filter((question) => hasAnswer(answers, question.path)).length,
    total: asked.length,
  };
}

/**
 * The question to open when someone returns.
 *
 * Their stored position wins, because it is where they actually were —
 * including a question they had opened and not answered — as long as that
 * question is still asked. Otherwise this falls back to the first unanswered
 * question that is.
 */
export function resumePoint(
  answers: unknown,
  lastStep: string | null,
): { sectionId: string; questionId: string } | null {
  if (lastStep) {
    const [sectionId, questionId] = lastStep.split("/");
    if (findAskedQuestion(sectionId ?? "", questionId ?? "", answers)) {
      return { sectionId: sectionId!, questionId: questionId! };
    }
  }

  const first = askedPath(answers).find((question) => !hasAnswer(answers, question.path));
  return first ? { sectionId: first.sectionId, questionId: first.id } : null;
}

/**
 * The next question after this one, across section boundaries, given the
 * answers including the one just given — which is what decides whether a
 * branch that depends on it opens.
 */
export function nextQuestion(
  sectionId: string,
  questionId: string,
  answers: unknown,
): { sectionId: string; questionId: string } | null {
  // Every question in form order, so the position of the current one is
  // known even when it is not itself asked any more.
  const all = INTAKE_SECTIONS.flatMap((section) =>
    section.questions.map((question) => ({ section, question })),
  );
  const index = all.findIndex(
    ({ section, question }) => section.id === sectionId && question.id === questionId,
  );
  if (index < 0) return null;

  const next = all
    .slice(index + 1)
    .find(({ section, question }) => isAsked(section, question, answers));
  return next ? { sectionId: next.section.id, questionId: next.question.id } : null;
}

/**
 * The answers with every question that is not asked removed — what the
 * checklist and the job should read. An answer left from a branch the
 * applicant has since closed stays stored, in case they reopen it, but counts
 * for nothing.
 */
export function askedAnswers(answers: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const { path } of askedPath(answers)) {
    if (!hasAnswer(answers, path)) continue;
    const keys = path.split(".");
    const last = keys.pop()!;
    let node = result;
    for (const key of keys) node = (node[key] ??= {}) as Record<string, unknown>;
    node[last] = readAnswer(answers, path);
  }
  return result;
}
