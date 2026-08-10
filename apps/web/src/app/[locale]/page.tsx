import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * The landing page, deliberately minimal.
 *
 * The marketing homepage is its own piece of work with its own copy decisions;
 * this is the shell that proves both locale routes render their chrome and
 * carries the one action there is.
 */
export default async function LandingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-12)" }}>
      <h1
        style={{
          margin: 0,
          maxInlineSize: "var(--measure-prose)",
          fontSize: "var(--type-h1-size)",
          lineHeight: "var(--type-h1-lh)",
          fontWeight: "var(--fw-semibold)",
          color: "var(--text-heading)",
        }}
      >
        {t("intro")}
      </h1>

      <div style={{ marginBlockStart: "var(--space-8)" }}>
        <Link href="/login" style={{ textDecoration: "none" }}>
          <Button size="lg" iconAfter="arrow-right">
            {t("cta")}
          </Button>
        </Link>
      </div>
    </main>
  );
}
