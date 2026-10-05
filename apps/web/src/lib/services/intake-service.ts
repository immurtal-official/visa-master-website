import {
  INTAKE_CHECKSUM,
  INTAKE_SECTIONS,
  INTAKE_VERSION,
  nextQuestion,
  parseQuestion,
} from "@visa-master/core";
import { createAdminClient } from "@/lib/supabase/admin";
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
 * A draft value is scratch, so it is stored flat and keyed by the path itself
 * rather than nested the way `answers` is. Deleting one is then a delete, the
 * shape can never be mistaken for the real answers at a glance, and nothing
 * has to walk a tree to clear a single question.
 */
type DraftAnswers = Record<string, string>;

/**
 * Long enough for the longest field the intake has, and short enough that a
 * client cannot grow the row without bound by holding down a key.
 */
const MAX_DRAFT_LENGTH = 1000;

function resolveQuestion(sectionId: string, questionId: string): { path: string } {
  const section = INTAKE_SECTIONS.find((s) => s.id === sectionId && s.available);
  const question = section?.questions.find((q) => q.id === questionId);
  if (!section || !question) throw new ServiceError("errors.notFound.title", 404);
  return question;
}

/**
 * The intake, one answer at a time.
 *
 * Saving happens on the way out of every question rather than at the end,
 * because inside an in-app browser an interrupted session is the median one:
 * the product has either kept the reader's place or wasted their evening.
 *
 * That left one gap, which `saveDraft` closes: the question actually in hand.
 * Until Continue is pressed the typing lived only in the page, so a reload took
 * it. Draft values are held apart from answers and are invisible to
 * `parseIntake`, so keeping them costs the submission path nothing.
 */
export const intakeService = {
  async saveAnswer(
    applicationId: string,
    input: { sectionId?: unknown; questionId?: unknown; value?: unknown },
  ): Promise<{ next: { sectionId: string; questionId: string } | null }> {
    const sectionId = String(input.sectionId ?? "");
    const questionId = String(input.questionId ?? "");
    const value = String(input.value ?? "");

    const question = resolveQuestion(sectionId, questionId);

    // The same rule the whole form uses, applied to one answer.
    const parsed = parseQuestion(question.path, value);
    if (!parsed.ok) throw new ValidationFailure(parsed.issues);

    const { userId, supabase } = await requireUser();

    const { data: application, error: readError } = await supabase
      .from("applications")
      .select("status, answers, draft_answers")
      .eq("id", applicationId)
      .maybeSingle<{
        status: string;
        answers: Record<string, unknown>;
        draft_answers: DraftAnswers;
      }>();

    if (readError) {
      console.error("intake.saveAnswer: could not read", { code: readError.code });
      throw new ServiceError("intake.saveFailed", 502);
    }
    if (!application) throw new ServiceError("errors.notFound.title", 404);
    // A sent application's answers are frozen in its job; changing them here
    // would leave the record saying something the pack was never made from.
    if (application.status !== "draft") {
      throw new ServiceError("intake.review.alreadySubmitted", 409);
    }

    const answers = { ...(application.answers ?? {}) };
    setAnswer(answers, question.path, parsed.data);

    // The draft for this question has served its purpose the moment the answer
    // is confirmed, and a stale one would win the next time the page is read.
    const draftAnswers = { ...(application.draft_answers ?? {}) };
    delete draftAnswers[question.path];

    const after = nextQuestion(sectionId, questionId);

    const { error } = await supabase
      .from("applications")
      .update({
        answers,
        draft_answers: draftAnswers,
        // The resume point is where they are going, not where they were:
        // coming back should continue the form, not re-ask what was answered.
        last_step: after ? `${after.sectionId}/${after.questionId}` : null,
        // The contract these answers were given under, as of this answer.
        intake_version: INTAKE_VERSION,
        intake_checksum: INTAKE_CHECKSUM,
      })
      .eq("id", applicationId);

    if (error) {
      console.error("intake.saveAnswer: could not save", { code: error.code });
      throw new ServiceError("intake.saveFailed", 502);
    }

    // Typed by the applicant, which is its own confirmation — and which
    // replaces any proposal read off a document for the same question. Written
    // with the server's authority: this is the row the submission gate trusts.
    const { error: sourceError } = await createAdminClient().from("answer_sources").upsert({
      application_id: applicationId,
      user_id: userId,
      path: question.path,
      source: "applicant",
      document_field_id: null,
      confirmed_at: new Date().toISOString(),
      intake_version: INTAKE_VERSION,
    });

    if (sourceError) {
      // The answer is saved; its source is not. Saying so is better than a
      // silent gap: pressing Continue again writes both.
      console.error("intake.saveAnswer: could not record the source", { code: sourceError.code });
      throw new ServiceError("intake.saveFailed", 502);
    }

    return { next: after };
  },

  /**
   * Keep what is being typed, without judging it.
   *
   * Deliberately not a smaller `saveAnswer`: it does not validate, does not
   * normalise, and does not move the resume point. Half a date and a name with
   * one character in it are both worth keeping, and neither is an answer —
   * telling someone their address is too short while they are still typing it
   * would be worse than losing it.
   *
   * The response is empty. Nothing on the page depends on a draft save having
   * landed, so a failed one is not worth interrupting anybody over; the next
   * keystroke pause tries again, and pressing Continue saves properly.
   */
  async saveDraft(
    applicationId: string,
    input: { sectionId?: unknown; questionId?: unknown; value?: unknown },
  ): Promise<void> {
    const sectionId = String(input.sectionId ?? "");
    const questionId = String(input.questionId ?? "");
    const value = String(input.value ?? "").slice(0, MAX_DRAFT_LENGTH);

    const question = resolveQuestion(sectionId, questionId);

    const { supabase } = await requireUser();

    const { data: application, error: readError } = await supabase
      .from("applications")
      .select("status, draft_answers")
      .eq("id", applicationId)
      .maybeSingle<{ status: string; draft_answers: DraftAnswers }>();

    if (readError) {
      console.error("intake.saveDraft: could not read", { code: readError.code });
      throw new ServiceError("intake.saveFailed", 502);
    }
    if (!application) throw new ServiceError("errors.notFound.title", 404);
    // Once an application is sent there is nothing left to be in the middle of
    // typing, and its answers are frozen in the job payload either way.
    if (application.status !== "draft") throw new ServiceError("errors.notFound.title", 404);

    const draftAnswers = { ...(application.draft_answers ?? {}) };
    // An empty box is not a draft — it is the absence of one, and keeping it
    // would shadow the saved answer when the page is read back.
    if (value) draftAnswers[question.path] = value;
    else delete draftAnswers[question.path];

    const { error } = await supabase
      .from("applications")
      .update({ draft_answers: draftAnswers })
      .eq("id", applicationId);

    if (error) {
      console.error("intake.saveDraft: could not save", { code: error.code });
      throw new ServiceError("intake.saveFailed", 502);
    }
  },
};
