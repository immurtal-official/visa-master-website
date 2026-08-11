import type { Locale } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { INTAKE_SECTIONS, intakeProgress, readAnswer } from "@visa-master/core";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Link, getPathname } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { readSession } from "@/lib/supabase/session";

interface ApplicationDetail {
  id: string;
  destination: string;
  purpose: string;
  status: "draft" | "submitted" | "cancelled";
  answers: Record<string, unknown>;
  created_at: string;
  submitted_job_id: string | null;
}

/**
 * One application: where it is, and what happens next.
 *
 * A sent application must not lead back into the form that was sent — that is
 * the state someone checks on, not one they edit. So this page is what the
 * dashboard opens, and the intake is reachable from it only while there is
 * still something to fill in.
 *
 * The status wording is a mapping of the job's own state, never an invention:
 * a state named here that the system does not have is a promise nothing keeps.
 */
export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const format = await getFormatter();

  if (!isSupabaseConfigured()) redirect(getPathname({ href: "/login", locale }));

  const supabase = await createClient();
  const session = await readSession(supabase);
  if (session.status !== "signed-in") redirect(getPathname({ href: "/login", locale }));

  const { data: application } = await supabase
    .from("applications")
    .select("id, destination, purpose, status, answers, created_at, submitted_job_id")
    .eq("id", id)
    .maybeSingle<ApplicationDetail>();

  if (!application) notFound();

  // Jobs are readable by their owner, so the state comes from the row itself
  // rather than from anything this page decides.
  const { data: job } = await supabase
    .from("jobs")
    .select("state")
    .eq("id", application.submitted_job_id ?? "")
    .maybeSingle<{ state: string }>();

  const answers = application.answers ?? {};
  const progress = intakeProgress(answers);
  const sent = application.status === "submitted";

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <p style={{ margin: 0 }}>
        <Link href="/dashboard" style={{ color: "var(--text-link)", fontSize: "var(--fs-16)" }}>
          {t("application.backToList")}
        </Link>
      </p>

      <h1
        style={{
          margin: "var(--space-4) 0 0",
          fontSize: "var(--type-h2-size)",
          lineHeight: "var(--type-h2-lh)",
          fontWeight: "var(--fw-semibold)",
          color: "var(--text-heading)",
        }}
      >
        {t("application.route", {
          destination: countryName(locale, application.destination),
          purpose: t(`route.purpose.${application.purpose}` as "route.purpose.tourism"),
        })}
      </h1>
      <p style={{ marginBlock: "var(--space-2) var(--space-8)", color: "var(--text-faint)" }}>
        {t("application.createdAt", {
          date: format.dateTime(new Date(application.created_at), { dateStyle: "long" }),
        })}
      </p>

      <Card>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--type-h3-size)",
            lineHeight: "var(--type-h3-lh)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--text-heading)",
          }}
        >
          {sent && job
            ? t(`application.jobStatus.${job.state}` as "application.jobStatus.queued")
            : t(`application.status.${application.status}` as "application.status.draft")}
        </h2>

        <p style={{ marginBlock: "var(--space-3) 0", color: "var(--text-body)" }}>
          {sent
            ? t("application.asyncNote")
            : t("application.nextStep.draft") + " · " + t("intake.progress", progress)}
        </p>

        <div style={{ marginBlockStart: "var(--space-6)" }}>
          {sent ? (
            <LinkButton href={`/applications/${id}/intake/review`} variant="secondary">
              {t("application.reviewCta")}
            </LinkButton>
          ) : (
            <LinkButton href={`/applications/${id}/intake`} iconAfter="arrow-right">
              {t("application.continueCta")}
            </LinkButton>
          )}
        </div>
      </Card>

      {/* Said plainly rather than left to be discovered: nothing consumes the
          queue yet, so a sent application stays queued. Copy that implied
          progress here would be the same lie as a button that leads nowhere. */}
      {sent && job?.state === "queued" ? (
        <div style={{ marginBlockStart: "var(--space-5)" }}>
          <Callout tone="quiet">{t("application.notStartedNote")}</Callout>
        </div>
      ) : null}

      {sent ? (
        <section style={{ marginBlockStart: "var(--space-10)" }}>
          <h2
            style={{
              margin: "0 0 var(--space-4)",
              fontSize: "var(--type-h3-size)",
              fontWeight: "var(--fw-semibold)",
              color: "var(--text-heading)",
            }}
          >
            {t("application.answersTitle")}
          </h2>

          <Card padding="var(--space-5)">
            <dl style={{ margin: 0, display: "grid", gap: "var(--space-3)" }}>
              {INTAKE_SECTIONS.filter((section) => section.questions.length > 0).flatMap(
                (section) =>
                  section.questions.map((question) => {
                    const value = readAnswer(answers, question.path);
                    return (
                      <div
                        key={question.path}
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
                            color: "var(--text-body)",
                            fontWeight: "var(--fw-medium)",
                          }}
                        >
                          {typeof value === "string" && value ? value : "—"}
                        </dd>
                      </div>
                    );
                  }),
              )}
            </dl>
          </Card>
        </section>
      ) : null}
    </main>
  );
}

/** Locale-aware country names, from the platform's own data. */
function countryName(locale: Locale, code: string): string {
  return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
}
