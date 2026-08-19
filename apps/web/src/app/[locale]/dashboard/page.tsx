import type { Locale } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api/server";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Link, getPathname } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SignOutButton } from "@/components/chrome/sign-out-button";

interface ApplicationRow {
  id: string;
  destination: string;
  purpose: string;
  status: "draft" | "submitted" | "cancelled";
  created_at: string;
}

/**
 * The signed-in home: every application, and what each one is waiting on.
 *
 * This page is a client of the API like any other — it renders what
 * /api/v1/applications says and holds no query of its own. Ownership is the
 * API's concern (row-level security underneath it); nothing here filters.
 */
export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const format = await getFormatter();

  if (!isSupabaseConfigured()) redirect(getPathname({ href: "/login", locale }));

  const [me, list] = await Promise.all([
    apiGet<{ userId: string; email: string | null }>("/api/v1/me"),
    apiGet<{ applications: ApplicationRow[] }>("/api/v1/applications"),
  ]);

  if (me.status === 401 || list.status === 401) {
    redirect(getPathname({ href: "/login", locale }));
  }

  const rows = list.data?.applications ?? [];

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          marginBlockEnd: "var(--space-6)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "var(--type-h2-size)",
            lineHeight: "var(--type-h2-lh)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--text-heading)",
          }}
        >
          {t("dashboard.title")}
        </h1>

        <SignOutButton />
      </div>

      {me.data?.email ? (
        <p style={{ marginBlockEnd: "var(--space-6)", color: "var(--text-muted)" }}>
          {t("dashboard.signedInAs", { email: me.data.email })}
        </p>
      ) : null}

      {/* A list that could not be loaded must never look like an account with
          nothing in it: one is a problem to retry, the other is a fact. */}
      {list.error ? (
        <Callout tone="error" title={t("dashboard.loadFailed.title")}>
          {t("dashboard.loadFailed.body")}
        </Callout>
      ) : rows.length === 0 ? (
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
            {t("dashboard.empty.title")}
          </h2>
          <p style={{ marginBlockStart: "var(--space-3)", color: "var(--text-body)" }}>
            {t("dashboard.empty.body")}
          </p>
        </Card>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: "var(--space-4)",
          }}
        >
          {rows.map((application) => (
            <li key={application.id}>
              {/* The card opens the application, not the form: a sent
                  application is something to check on, and leading back into
                  the intake would offer to re-edit what was already sent. */}
              <Link
                href={`/applications/${application.id}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <Card>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "var(--space-3)",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "var(--type-h3-size)",
                        lineHeight: "var(--type-h3-lh)",
                        fontWeight: "var(--fw-semibold)",
                        color: "var(--text-heading)",
                      }}
                    >
                      {t("application.route", {
                        destination: countryName(locale, application.destination),
                        purpose: t(
                          `route.purpose.${application.purpose}` as "route.purpose.tourism",
                        ),
                      })}
                    </h2>
                    <span style={{ color: "var(--text-muted)", fontSize: "var(--fs-14)" }}>
                      {t(`application.status.${application.status}` as "application.status.draft")}
                    </span>
                  </div>

                  <p style={{ marginBlock: "var(--space-3) 0", color: "var(--text-body)" }}>
                    {t(
                      `application.nextStep.${application.status}` as "application.nextStep.draft",
                    )}
                  </p>

                  <p
                    style={{
                      marginBlock: "var(--space-2) 0",
                      color: "var(--text-faint)",
                      fontSize: "var(--fs-14)",
                    }}
                  >
                    {t("application.createdAt", {
                      date: format.dateTime(new Date(application.created_at), {
                        dateStyle: "long",
                      }),
                    })}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginBlockStart: "var(--space-8)" }}>
        <LinkButton href="/start" size="lg" iconAfter="arrow-right">
          {t("application.newCta")}
        </LinkButton>
      </div>
    </main>
  );
}

/** Locale-aware country names, from the platform's own data. */
function countryName(locale: Locale, code: string): string {
  return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
}
