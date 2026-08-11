import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { RouteCheckForm } from "./route-check-form";

/**
 * The route check. Deliberately reachable without signing in: whether the
 * product can help is the first thing someone wants to know, and asking them
 * to make an account before answering it is asking for trust that has not been
 * earned yet.
 */
export default async function StartPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <RouteCheckForm locale={locale} />
    </main>
  );
}
