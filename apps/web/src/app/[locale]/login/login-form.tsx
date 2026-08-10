"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import type { Locale } from "next-intl";
import type { ValidationIssue } from "@visa-master/core";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { ErrorSummary } from "@/components/ui/error-summary";
import { Input } from "@/components/ui/input";
import { submitLogin, type AuthState } from "./actions";

/**
 * Sign in, in two steps on one route: ask for the address, then for the code.
 *
 * One question per page, as the interaction model requires — the heading is
 * the question, its explanation sits beneath it rather than in a tooltip, and
 * there is one field to answer. Every button belongs to the same form and says
 * what it intends, so the state that comes back always knows which step it is
 * on and which address it is working with.
 */
export function LoginForm({ locale, configured }: { locale: Locale; configured: boolean }) {
  const t = useTranslations();
  const [state, formAction] = useActionState<AuthState, FormData>(submitLogin, { step: "email" });

  if (!configured) {
    return <Callout tone="warning">{t("auth.notConfigured")}</Callout>;
  }

  const onCodeStep = state.step === "code";
  const fieldId = onCodeStep ? "code" : "email";
  const issue = state.issues?.find((i) => i.path === fieldId);

  return (
    <form action={formAction}>
      {state.issues && state.issues.length > 0 ? (
        <ErrorSummary
          title={t("errorSummary.title")}
          errors={state.issues.map((i) => ({ field: i.path, message: messageFor(t, i) }))}
        />
      ) : null}

      {state.authError ? (
        <div style={{ marginBlockEnd: "var(--space-6)" }}>
          <Callout tone="error">{t(state.authError)}</Callout>
        </div>
      ) : null}

      <h1
        style={{
          margin: 0,
          fontSize: "var(--type-question-size)",
          lineHeight: "var(--type-question-lh)",
          fontWeight: "var(--fw-semibold)",
          color: "var(--text-heading)",
        }}
      >
        {onCodeStep ? t("auth.otp.title") : t("auth.login.title")}
      </h1>

      <p
        style={{
          marginBlock: "var(--space-3) var(--space-6)",
          maxInlineSize: "var(--measure-question)",
          color: "var(--text-body)",
        }}
      >
        {onCodeStep ? t("auth.otp.sentTo", { email: state.email ?? "" }) : t("auth.login.intro")}
      </p>

      <input type="hidden" name="locale" value={locale} />

      {onCodeStep ? (
        <>
          <input type="hidden" name="email" value={state.email ?? ""} />
          <Input
            id="code"
            name="code"
            label={t("auth.otp.codeLabel")}
            error={issue ? messageFor(t, issue) : undefined}
            width="sm"
            // A numeric keypad, and the code offered from the notification
            // rather than typed out of another application.
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
          />
        </>
      ) : (
        <Input
          id="email"
          name="email"
          type="email"
          label={t("auth.login.emailLabel")}
          error={issue ? messageFor(t, issue) : undefined}
          defaultValue={state.email}
          width="lg"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          autoFocus
          required
        />
      )}

      <div style={{ marginBlockStart: "var(--space-6)" }}>
        <SubmitButton
          intent={onCodeStep ? "verify" : "send"}
          label={onCodeStep ? t("auth.otp.submit") : t("auth.login.submit")}
        />
      </div>

      {onCodeStep ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-3)",
            marginBlockStart: "var(--space-8)",
          }}
        >
          <Button type="submit" name="intent" value="resend" variant="ghost">
            {t("auth.otp.resend")}
          </Button>
          <Button type="submit" name="intent" value="changeEmail" variant="quiet">
            {t("auth.otp.changeEmail")}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

/**
 * Resolve an issue's key against the active locale.
 *
 * The rule chose the key and supplied the parameters; this only looks it up.
 * No component decides what a rule's failure says.
 */
function messageFor(t: ReturnType<typeof useTranslations>, issue: ValidationIssue): string {
  // @ts-expect-error — the key space belongs to the catalogue, and the build
  // check guarantees every key a rule can emit is in it.
  return t(issue.key, issue.params);
}

function SubmitButton({ intent, label }: { intent: string; label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" name="intent" value={intent} size="lg" loading={pending}>
      {label}
    </Button>
  );
}
