import { INTAKE_SECTIONS, nextQuestion, parseQuestion } from "@visa-master/core";
import { requireUser } from "./auth-service";
import { ServiceError, ValidationFailure } from "./errors";

/** Write a value at a dot-path without disturbing the rest of the answers. */
function setAnswer(answers: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  const last = keys.pop()!;
  let node = answers;
  for (const key of keys) {
    const existing = node[key];
    node[key] = typeof existing === "object" && existing !== null ? existing : {};
    node = node[key] as Record<string, unknown>;
  }
  node[last] = value;
}

/**
 * The intake, one answer at a time.
 *
 * Saving happens on the way out of every question rather than at the end,
 * because inside an in-app browser an interrupted session is the median one:
 * the product has either kept the reader's place or wasted their evening.
 */
export const intakeService = {
  async saveAnswer(
    applicationId: string,
    input: { sectionId?: unknown; questionId?: unknown; value?: unknown },
  ): Promise<{ next: { sectionId: string; questionId: string } | null }> {
    const sectionId = String(input.sectionId ?? "");
    const questionId = String(input.questionId ?? "");
    const value = String(input.value ?? "");

    const section = INTAKE_SECTIONS.find((s) => s.id === sectionId && s.available);
    const question = section?.questions.find((q) => q.id === questionId);
    if (!section || !question) throw new ServiceError("errors.notFound.title", 404);

    // The same rule the whole form uses, applied to one answer.
    const parsed = parseQuestion(question.path, value);
    if (!parsed.ok) throw new ValidationFailure(parsed.issues);

    const { supabase } = await requireUser();

    const { data: application, error: readError } = await supabase
      .from("applications")
      .select("answers")
      .eq("id", applicationId)
      .maybeSingle<{ answers: Record<string, unknown> }>();

    if (readError) {
      console.error("intake.saveAnswer: could not read", { code: readError.code });
      throw new ServiceError("intake.saveFailed", 502);
    }
    if (!application) throw new ServiceError("errors.notFound.title", 404);

    const answers = { ...(application.answers ?? {}) };
    setAnswer(answers, question.path, parsed.data);

    const after = nextQuestion(sectionId, questionId);

    const { error } = await supabase
      .from("applications")
      .update({
        answers,
        // The resume point is where they are going, not where they were:
        // coming back should continue the form, not re-ask what was answered.
        last_step: after ? `${after.sectionId}/${after.questionId}` : null,
      })
      .eq("id", applicationId);

    if (error) {
      console.error("intake.saveAnswer: could not save", { code: error.code });
      throw new ServiceError("intake.saveFailed", 502);
    }

    return { next: after };
  },
};
