"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api/client";
import { useSessionNavigation } from "@/i18n/use-session-navigation";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

/**
 * Sign out, and say so if it did not work.
 *
 * Only navigate when the session actually ended: the sign-in screen is the
 * universal signal for "you are signed out", and showing it while the session
 * lives is the one lie that matters on a shared computer.
 */
export function SignOutButton() {
  const t = useTranslations();
  const leaveTo = useSessionNavigation();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signOut(): Promise<void> {
    setPending(true);
    setFailed(false);
    const result = await api("/api/v1/auth/signout", { method: "POST" });

    if (result.ok) {
      // A full load: pages the router remembers from the signed-in session
      // must not be shown, or replayed, once it has ended.
      leaveTo("/login");
    } else {
      setPending(false);
      setFailed(true);
    }
  }

  return (
    <div>
      <Button variant="quiet" size="sm" loading={pending} onClick={() => void signOut()}>
        {t("auth.signOut")}
      </Button>

      {failed ? (
        <div style={{ marginBlockStart: "var(--space-3)", maxInlineSize: "var(--measure-prose)" }}>
          <Callout tone="error">{t("auth.signOutFailed")}</Callout>
        </div>
      ) : null}
    </div>
  );
}
