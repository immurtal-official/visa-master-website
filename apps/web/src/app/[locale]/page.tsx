import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";

/**
 * Placeholder landing page. The chrome and its copy arrive with the site header
 * and footer in the next commit; this exists so both locale routes render.
 *
 * The param is typed as a Locale rather than a string because the layout above
 * has already rejected anything else with a 404.
 */
export default async function LandingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-12)" }}>
      <Card>
        <div style={{ blockSize: "var(--space-16)" }} />
      </Card>
    </main>
  );
}
