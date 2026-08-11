import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { INTAKE_SECTIONS, readAnswer } from "@visa-master/core";
import { getPathname } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { readSession } from "@/lib/supabase/session";
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

  const supabase = await createClient();
  const session = await readSession(supabase);
  if (session.status !== "signed-in") redirect(getPathname({ href: "/login", locale }));

  const { data: application } = await supabase
    .from("applications")
    .select("id, answers")
    .eq("id", id)
    .maybeSingle<{ id: string; answers: Record<string, unknown> }>();

  if (!application) notFound();

  const saved = readAnswer(application.answers ?? {}, question.path);

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <QuestionForm
        locale={locale}
        applicationId={id}
        sectionId={sectionId}
        questionId={questionId}
        path={question.path}
        savedValue={typeof saved === "string" ? saved : ""}
      />
    </main>
  );
}
