import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { INTAKE_SECTIONS, intakeProgress, resumePoint, sectionState } from "@visa-master/core";
import { LinkButton } from "@/components/ui/link-button";
import { Card } from "@/components/ui/card";
import { Link, getPathname } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * The section list.
 *
 * Every section is shown, including the ones that are not built yet — a form
 * that hides its later half looks shorter than it is, and someone setting aside
 * an evening for it deserves to see the whole shape. A section that cannot be
 * opened says why, because greying something out without a reason reads as a
 * fault rather than a sequence.
 */
export default async function IntakeHubPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("intake");

  if (!isSupabaseConfigured()) redirect(getPathname({ href: "/login", locale }));

  const result = await apiGet<{
    application: { id: string; answers: Record<string, unknown>; last_step: string | null };
  }>(`/api/v1/applications/${id}`);
  if (result.status === 401) redirect(getPathname({ href: "/login", locale }));
  // Someone else's application is simply not there — the API's 404 is the
  // honest answer, and this page passes it on.
  if (result.status === 404 || !result.data) notFound();

  const application = result.data.application;

  const answers = application.answers ?? {};
  const progress = intakeProgress(answers);
  const resume = resumePoint(answers, application.last_step);

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
        {t("hubTitle")}
      </h1>
      <p
        style={{
          marginBlock: "var(--space-3) var(--space-2)",
          maxInlineSize: "var(--measure-prose)",
          color: "var(--text-body)",
        }}
      >
        {t("hubIntro")}
      </p>
      <p style={{ marginBlock: 0, color: "var(--text-muted)", fontSize: "var(--fs-14)" }}>
        {t("progress", progress)}
      </p>

      <ol
        style={{
          listStyle: "none",
          margin: "var(--space-8) 0 0",
          padding: 0,
          display: "grid",
          gap: "var(--space-3)",
        }}
      >
        {INTAKE_SECTIONS.map((section) => {
          const state = sectionState(section, answers);
          const open = state !== "unavailable";
          const first = section.questions[0];

          const body = (
            <Card
              padding="var(--space-5)"
              elevation={open ? 1 : 0}
              tone={open ? "default" : "sunken"}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "var(--space-3)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--fs-18)",
                    fontWeight: "var(--fw-medium)",
                    color: open ? "var(--text-heading)" : "var(--text-muted)",
                  }}
                >
                  {t(`section.${section.id}` as "section.applicant")}
                </span>
                <span style={{ fontSize: "var(--fs-14)", color: "var(--text-muted)" }}>
                  {t(`state.${state}` as "state.todo")}
                </span>
              </div>

              {open ? null : (
                <p
                  style={{
                    marginBlock: "var(--space-2) 0",
                    fontSize: "var(--type-hint-size)",
                    color: "var(--text-muted)",
                  }}
                >
                  {t("unavailableHint")}
                </p>
              )}
            </Card>
          );

          return (
            <li key={section.id}>
              {open ? (
                <Link
                  href={
                    first
                      ? `/applications/${id}/intake/${section.id}/${first.id}`
                      : `/applications/${id}/intake/${section.id}`
                  }
                  style={{ textDecoration: "none", display: "block" }}
                >
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ol>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBlockStart: "var(--space-8)",
        }}
      >
        {resume ? (
          <LinkButton
            href={`/applications/${id}/intake/${resume.sectionId}/${resume.questionId}`}
            size="lg"
            iconAfter="arrow-right"
          >
            {progress.answered === 0 ? t("startCta") : t("resumeCta")}
          </LinkButton>
        ) : (
          <LinkButton href={`/applications/${id}/intake/review`} size="lg" iconAfter="arrow-right">
            {t("review.title")}
          </LinkButton>
        )}
      </div>
    </main>
  );
}
