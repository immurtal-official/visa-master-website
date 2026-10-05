import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { INTAKE_SECTIONS, readAnswer } from "@visa-master/core";
import { getPathname } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { QuestionForm } from "./question-form";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string; section: string; question: string }>;
}) {
  const { locale, id, section: sectionId, question: questionId } = await params;
  setRequestLocale(locale);

  const section = INTAKE_SECTIONS.find((s) => s.id === sectionId && s.available);
  const question = section?.questions.find((q) => q.id === questionId);
  if (!section || !question) notFound();

  if (!isSupabaseConfigured()) redirect(getPathname({ href: "/login", locale }));

  const result = await apiGet<{
    application: {
      id: string;
      answers: Record<string, unknown>;
      draft_answers: Record<string, string>;
    };
  }>(`/api/v1/applications/${id}`);
  if (result.status === 401) redirect(getPathname({ href: "/login", locale }));
  if (result.status === 404 || !result.data) notFound();

  const application = result.data.application;

  const saved = readAnswer(application.answers ?? {}, question.path);
  const draft = (application.draft_answers ?? {})[question.path];

  // What was being typed wins over what was last confirmed, because it is the
  // later of the two — someone who came back to change an answer and reloaded
  // mid-edit should find their edit, not the value they were replacing.
  const initialValue = typeof draft === "string" && draft ? draft : saved;

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <QuestionForm
        applicationId={id}
        sectionId={sectionId}
        questionId={questionId}
        path={question.path}
        savedValue={typeof initialValue === "string" ? initialValue : ""}
      />
    </main>
  );
}
