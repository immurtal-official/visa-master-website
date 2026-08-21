"use server";

import type { Locale } from "next-intl";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  INTAKE_SECTIONS,
  nextQuestion,
  parseQuestion,
  type ValidationIssue,
} from "@visa-master/core";
import { getPathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { readSession } from "@/lib/supabase/session";

export interface AnswerState {
  value?: string;
  issues?: ValidationIssue[];
  error?: "intake.saveFailed" | "route.sessionExpired";
}

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
 * Save one answer and move on.
 *
 * Saving happens on the way out of every question rather than at the end,
 * because inside an in-app browser an interrupted session is the median one:
 * someone answers a message and comes back twenty minutes later, and the
 * product has either kept their place or wasted their evening.
 */
export async function saveAnswer(_previous: AnswerState, formData: FormData): Promise<AnswerState> {
  const locale = formData.get("locale") as Locale;
  const applicationId = String(formData.get("applicationId") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");
  const questionId = String(formData.get("questionId") ?? "");
  const value = String(formData.get("value") ?? "");

  const section = INTAKE_SECTIONS.find((s) => s.id === sectionId && s.available);
  const question = section?.questions.find((q) => q.id === questionId);
  if (!section || !question) redirect(getPathname({ href: "/dashboard", locale }));

  // The same rule the whole form uses, applied to one answer.
  const parsed = parseQuestion(question.path, value);
  if (!parsed.ok) return { value, issues: parsed.issues };

  const supabase = await createClient();
  const session = await readSession(supabase);
  if (session.status !== "signed-in") return { value, error: "route.sessionExpired" };

  const { data: application, error: readError } = await supabase
    .from("applications")
    .select("answers")
    .eq("id", applicationId)
    .single<{ answers: Record<string, unknown> }>();

  if (readError || !application) {
    console.error("saveAnswer: could not read the application", { code: readError?.code });
    return { value, error: "intake.saveFailed" };
  }

  const answers = { ...(application.answers ?? {}) };
  setAnswer(answers, question.path, parsed.data);

  const after = nextQuestion(sectionId, questionId);

  const { error } = await supabase
    .from("applications")
    .update({
      answers,
      // The resume point is where they are going, not where they were: coming
      // back should continue the form rather than re-ask the answered question.
      last_step: after ? `${after.sectionId}/${after.questionId}` : null,
    })
    .eq("id", applicationId);

  if (error) {
    console.error("saveAnswer: could not save", { code: error.code, message: error.message });
    return { value, error: "intake.saveFailed" };
  }

  revalidatePath(`/${locale}/applications/${applicationId}/intake`);

  redirect(
    after
      ? getPathname({
          href: `/applications/${applicationId}/intake/${after.sectionId}/${after.questionId}`,
          locale,
        })
      : getPathname({ href: `/applications/${applicationId}/intake`, locale }),
  );
}
