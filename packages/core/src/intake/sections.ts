/**
 * The intake, as a list of sections and the questions inside them.
 *
 * The form is long and gets filled in over several sittings, so its shape has
 * to be data rather than a sequence of hand-written pages: the hub needs to
 * know what is done, the resume path needs to know where someone stopped, and
 * the completeness check needs to know what "finished" means. One definition
 * answers all three.
 *
 * Sections that are not built yet are listed anyway, marked unavailable. The
 * design system is explicit that a section which cannot be entered must say
 * why — hiding it would make the form look shorter than it is, and someone
 * planning an evening around it deserves to see the whole thing.
 */

export interface IntakeQuestion {
  /** Stable id. Used in the URL and stored as the resume point. */
  id: string;
  /** Dot-path into `applications.answers`. */
  path: string;
}

export interface IntakeSection {
  id: string;
  questions: IntakeQuestion[];
  /** False while the section has not been built. */
  available: boolean;
}

export const INTAKE_SECTIONS: IntakeSection[] = [
  {
    id: "applicant",
    available: true,
    questions: [
      { id: "name", path: "applicant.name" },
      { id: "pinyin", path: "applicant.pinyin" },
      { id: "birthDate", path: "applicant.birthDate" },
      { id: "phone", path: "applicant.phone" },
    ],
  },
  {
    id: "passport",
    available: true,
    questions: [
      { id: "number", path: "passport.number" },
      { id: "issuedAt", path: "passport.issuedAt" },
      { id: "expiresAt", path: "passport.expiresAt" },
    ],
  },
  { id: "residence", available: false, questions: [] },
  { id: "employment", available: false, questions: [] },
  { id: "travel", available: false, questions: [] },
  { id: "companions", available: false, questions: [] },
  { id: "history", available: false, questions: [] },
  { id: "review", available: false, questions: [] },
];

export type SectionState = "done" | "inProgress" | "todo" | "unavailable";

export function readAnswer(answers: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (typeof value !== "object" || value === null) return undefined;
    return (value as Record<string, unknown>)[key];
  }, answers);
}

function isAnswered(answers: unknown, question: IntakeQuestion): boolean {
  const value = readAnswer(answers, question.path);
  return value !== undefined && value !== null && value !== "";
}

export function sectionState(section: IntakeSection, answers: unknown): SectionState {
  if (!section.available) return "unavailable";

  const answered = section.questions.filter((question) => isAnswered(answers, question)).length;
  if (answered === 0) return "todo";
  return answered === section.questions.length ? "done" : "inProgress";
}

/** How far through the whole intake someone is, for the progress line. */
export function intakeProgress(answers: unknown): { answered: number; total: number } {
  const questions = INTAKE_SECTIONS.filter((s) => s.available).flatMap((s) => s.questions);
  return {
    answered: questions.filter((question) => isAnswered(answers, question)).length,
    total: questions.length,
  };
}

/**
 * The question to open when someone returns.
 *
 * Their stored position wins, because it is where they actually were —
 * including a question they had opened and not answered. Only when there is no
 * stored position does this fall back to the first unanswered one.
 */
export function resumePoint(
  answers: unknown,
  lastStep: string | null,
): { sectionId: string; questionId: string } | null {
  if (lastStep) {
    const [sectionId, questionId] = lastStep.split("/");
    const section = INTAKE_SECTIONS.find((s) => s.id === sectionId && s.available);
    if (section?.questions.some((q) => q.id === questionId)) {
      return { sectionId: sectionId!, questionId: questionId! };
    }
  }

  for (const section of INTAKE_SECTIONS) {
    if (!section.available) continue;
    for (const question of section.questions) {
      if (!isAnswered(answers, question)) {
        return { sectionId: section.id, questionId: question.id };
      }
    }
  }

  return null;
}

/** The next question after this one, across section boundaries. */
export function nextQuestion(
  sectionId: string,
  questionId: string,
): { sectionId: string; questionId: string } | null {
  const available = INTAKE_SECTIONS.filter((s) => s.available);
  const flat = available.flatMap((s) => s.questions.map((q) => ({ sectionId: s.id, ...q })));
  const index = flat.findIndex((q) => q.sectionId === sectionId && q.id === questionId);
  if (index < 0 || index + 1 >= flat.length) return null;

  const next = flat[index + 1]!;
  return { sectionId: next.sectionId, questionId: next.id };
}
