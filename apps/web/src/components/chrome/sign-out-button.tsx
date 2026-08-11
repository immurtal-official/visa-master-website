"use client";

import { useActionState } from "react";
import { useTranslations, type Locale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { signOut, type AuthState } from "@/app/[locale]/login/actions";

/**
 * Sign out, and say so if it did not work.
 *
 * A failed sign-out that navigates to the sign-in screen anyway is the one lie
 * worth guarding against here: that screen is the universal signal for "you are
 * signed out", and someone on a shared computer would walk away believing it.
 */
export function SignOutButton({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const [state, formAction] = useActionState<AuthState, FormData>(signOut, { step: "email" });

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit" variant="quiet" size="sm">
          {t("auth.signOut")}
        </Button>
      </form>

      {state.authError ? (
        <div style={{ marginBlockStart: "var(--space-3)", maxInlineSize: "var(--measure-prose)" }}>
          <Callout tone="error">{t(state.authError)}</Callout>
        </div>
      ) : null}
    </div>
  );
}
