import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { documentCompleteness, documentsFor } from "@visa-master/core";
import { Callout } from "@/components/ui/callout";
import { LinkButton } from "@/components/ui/link-button";
import { Link, getPathname } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { readSession } from "@/lib/supabase/session";
import { DocumentItem, type UploadRow } from "./document-item";

/**
 * The document checklist.
 *
 * Which documents appear is decided by the route's rules and by what the
 * applicant answered — somebody whose employer is paying is asked for their
 * employer's proof of funds, and nobody else is. Each item states why it is
 * wanted, because a reason given before someone goes hunting is the difference
 * between a document arriving right and arriving twice.
 */
export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("documents");

  if (!isSupabaseConfigured()) redirect(getPathname({ href: "/login", locale }));

  const supabase = await createClient();
  const session = await readSession(supabase);
  if (session.status !== "signed-in") redirect(getPathname({ href: "/login", locale }));

  const { data: application } = await supabase
    .from("applications")
    .select("id, answers, status")
    .eq("id", id)
    .maybeSingle<{ id: string; answers: Record<string, unknown>; status: string }>();

  if (!application) notFound();

  const { data: uploads } = await supabase
    .from("uploads")
    .select("id, document, page, original_name, status")
    .eq("application_id", id)
    .order("page")
    .returns<UploadRow[]>();

  const rows = uploads ?? [];
  const answers = application.answers ?? {};
  const required = documentsFor(answers);
  const completeness = documentCompleteness(answers, rows);

  const mandatory = required.filter((document) => document.necessity !== "recommended");
  const storedCount = mandatory.length - completeness.missing.length;

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <p style={{ margin: 0 }}>
        <Link
          href={`/applications/${id}`}
          style={{ color: "var(--text-link)", fontSize: "var(--fs-16)" }}
        >
          {t("title")}
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
        {t("title")}
      </h1>
      <p
        style={{
          marginBlock: "var(--space-3) var(--space-2)",
          maxInlineSize: "var(--measure-prose)",
          color: "var(--text-body)",
        }}
      >
        {t("intro")}
      </p>
      <p style={{ marginBlock: 0, color: "var(--text-muted)", fontSize: "var(--fs-14)" }}>
        {t("progress", { stored: storedCount, required: mandatory.length })}
      </p>

      <div style={{ display: "grid", gap: "var(--space-4)", marginBlockStart: "var(--space-8)" }}>
        {required.map((document) => (
          <DocumentItem
            key={document.id}
            locale={locale}
            applicationId={id}
            userId={session.userId}
            document={document}
            uploads={rows.filter((row) => row.document === document.id)}
          />
        ))}
      </div>

      {/* What the status claims, and nothing more. Saying a document has been
          "checked" when only its legibility was looked at is the kind of
          overclaim this product cannot afford. */}
      <div style={{ marginBlockStart: "var(--space-8)" }}>
        <Callout tone="quiet">{t("statusNote")}</Callout>
      </div>

      {completeness.complete && application.status === "draft" ? (
        <div style={{ marginBlockStart: "var(--space-8)" }}>
          <LinkButton href={`/applications/${id}/intake/review`} size="lg" iconAfter="arrow-right">
            {t("doneCta")}
          </LinkButton>
        </div>
      ) : null}
    </main>
  );
}
