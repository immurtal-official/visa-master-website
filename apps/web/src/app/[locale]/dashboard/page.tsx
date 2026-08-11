import type { Locale } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, getPathname } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

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
 * Applications are read through the request-scoped client, so row-level
 * security is what limits the result to this user's own. There is deliberately
 * no ownership filter in this file — the policy is the check, and pgTAP
 * asserts it holds.
 */
export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const format = await getFormatter();

  if (!isSupabaseConfigured()) redirect(getPathname({ href: "/login", locale }));

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect(getPathname({ href: "/login", locale }));

  const { data: applications } = await supabase
    .from("applications")
    .select("id, destination, purpose, status, created_at")
    .order("updated_at", { ascending: false })
    .returns<ApplicationRow[]>();

  const rows = applications ?? [];

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

        <form action={signOut}>
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" variant="quiet" size="sm">
            {t("auth.signOut")}
          </Button>
        </form>
      </div>

      <p style={{ marginBlockEnd: "var(--space-6)", color: "var(--text-muted)" }}>
        {t("dashboard.signedInAs", { email: String(claims.email ?? "") })}
      </p>

      {rows.length === 0 ? (
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
                      purpose: t(`route.purpose.${application.purpose}` as "route.purpose.tourism"),
                    })}
                  </h2>
                  <span style={{ color: "var(--text-muted)", fontSize: "var(--fs-14)" }}>
                    {t(`application.status.${application.status}` as "application.status.draft")}
                  </span>
                </div>

                <p style={{ marginBlock: "var(--space-3) 0", color: "var(--text-body)" }}>
                  {t(`application.nextStep.${application.status}` as "application.nextStep.draft")}
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
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginBlockStart: "var(--space-8)" }}>
        <Link href="/start" style={{ textDecoration: "none" }}>
          <Button size="lg" iconAfter="arrow-right">
            {t("application.newCta")}
          </Button>
        </Link>
      </div>
    </main>
  );
}

/** Locale-aware country names, from the platform's own data. */
function countryName(locale: Locale, code: string): string {
  return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
}
