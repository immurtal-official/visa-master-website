import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { INTAKE_SECTIONS, readAnswer } from "@visa-master/core";
import { Card } from "@/components/ui/card";
import { Link, getPathname } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { readSession } from "@/lib/supabase/session";
import { ReviewForm } from "./review-form";

/**
 * Everything answered, in one reading, with a way back to each answer.
 *
 * This is the last thing anyone sees before their documents are made from
 * these words, so it shows them as given rather than summarised: a wrong
 * spelling caught here costs a minute, and caught by a consulate costs a trip.
 */
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

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
  const answers = application.answers ?? {};

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <h1
        style={{
          margin: 0,
          fontSize: "var(--type-h2-size)",
          lineHeight: "var(--type-h2-lh)",
          fontWeight: "var(--fw-semibold)",
          color: "var(--text-heading)",
        }}
      >
        {t("intake.review.title")}
      </h1>
      <p
        style={{
          marginBlock: "var(--space-3) var(--space-8)",
          maxInlineSize: "var(--measure-prose)",
          color: "var(--text-body)",
        }}
      >
        {t("intake.review.intro")}
      </p>

      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        {INTAKE_SECTIONS.filter((section) => section.questions.length > 0).map((section) => (
          <Card key={section.id} padding="var(--space-5)">
            <h2
              style={{
                margin: "0 0 var(--space-4)",
                fontSize: "var(--fs-18)",
                fontWeight: "var(--fw-semibold)",
                color: "var(--text-heading)",
              }}
            >
              {t(`intake.section.${section.id}` as "intake.section.applicant")}
            </h2>

            <dl style={{ margin: 0, display: "grid", gap: "var(--space-3)" }}>
              {section.questions.map((question) => {
                const value = readAnswer(answers, question.path);
                return (
                  <div
                    key={question.id}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "var(--space-3)",
                    }}
                  >
                    <dt style={{ color: "var(--text-muted)", maxInlineSize: "28em" }}>
                      {t(
                        `intake.question.${section.id}.${question.id}` as "intake.question.applicant.name",
                      )}
                    </dt>
                    <dd
                      style={{
                        margin: 0,
                        display: "flex",
                        gap: "var(--space-3)",
                        alignItems: "baseline",
                      }}
                    >
                      <span style={{ color: "var(--text-body)", fontWeight: "var(--fw-medium)" }}>
                        {typeof value === "string" && value ? value : "—"}
                      </span>
                      <Link
                        href={`/applications/${id}/intake/${section.id}/${question.id}`}
                        style={{ color: "var(--text-link)", fontSize: "var(--fs-14)" }}
                      >
                        {t("intake.review.editCta")}
                      </Link>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Card>
        ))}
      </div>

      <div style={{ marginBlockStart: "var(--space-8)" }}>
        <ReviewForm locale={locale} applicationId={id} />
      </div>
    </main>
  );
}
