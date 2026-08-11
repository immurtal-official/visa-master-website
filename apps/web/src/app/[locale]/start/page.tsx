import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { checkRoute } from "@visa-master/core";
import { readPendingRouteCheck } from "./actions";
import { RouteCheckForm } from "./route-check-form";

/**
 * The route check. Deliberately reachable without signing in: whether the
 * product can help is the first thing someone wants to know, and asking them
 * to make an account before answering it is asking for trust that has not been
 * earned yet.
 *
 * Which means the person answering it often has no account, presses "create",
 * and is sent to sign in. Their answers are parked on the way out and restored
 * here, so they come back to the card they left rather than to a blank form.
 */
export default async function StartPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const pending = await readPendingRouteCheck();

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <RouteCheckForm
        locale={locale}
        initialState={pending ? { answers: pending, verdict: checkRoute(pending) } : {}}
      />
    </main>
  );
}
