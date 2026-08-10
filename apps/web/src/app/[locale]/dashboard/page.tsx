import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

/**
 * The signed-in home. Empty until applications exist, and honest about it —
 * an empty state with no action beats a button that goes nowhere.
 *
 * The profile is read through the request-scoped client, which acts as the
 * signed-in user, so row-level security is what limits the result to their own
 * row. There is no ownership check in this file because there does not need to
 * be one: the policy is the check, and pgTAP asserts it holds.
 */
export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  if (!isSupabaseConfigured()) redirect(getPathname({ href: "/login", locale }));

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect(getPathname({ href: "/login", locale }));

  const { data: profile } = await supabase.from("profiles").select("user_id, locale").maybeSingle();

  if (!profile) {
    // The row is created by a trigger on signup, so its absence means that
    // trigger did not run — worth knowing about, but not worth failing a page
    // over: nothing on this screen depends on the row's contents yet.
    console.warn("dashboard: no profile row for the signed-in user", { userId: claims.sub });
  }

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
          <Button type="submit" variant="secondary" size="sm">
            {t("auth.signOut")}
          </Button>
        </form>
      </div>

      <p style={{ marginBlockEnd: "var(--space-6)", color: "var(--text-muted)" }}>
        {t("dashboard.signedInAs", { email: String(claims.email ?? "") })}
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
          {t("dashboard.empty.title")}
        </h2>
        <p style={{ marginBlockStart: "var(--space-3)", color: "var(--text-body)" }}>
          {t("dashboard.empty.body")}
        </p>
      </Card>
    </main>
  );
}
