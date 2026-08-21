"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { ValidationIssue } from "@visa-master/core";
import { api } from "@/lib/api/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { ErrorSummary } from "@/components/ui/error-summary";
import { Input } from "@/components/ui/input";

/**
 * Sign in, in two steps on one route: ask for the address, then for the code.
 *
 * The screen is a client of /api/v1/auth like any other — it collects input,
 * calls the contract, and renders what came back. One question per page, the
 * heading is the question, and every failure arrives as a catalogue key this
 * component resolves against the active locale.
 */
interface AuthState {
  step: "email" | "code";
  email?: string;
  issues?: ValidationIssue[];
  authError?: string;
  pending?: boolean;
}

export function LoginForm({ configured }: { configured: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ step: "email" });

  if (!configured) {
    return <Callout tone="warning">{t("auth.notConfigured")}</Callout>;
  }

  const onCodeStep = state.step === "code";
  const fieldId = onCodeStep ? "code" : "email";
  const issue = state.issues?.find((i) => i.path === fieldId);

  async function requestCode(email: string): Promise<void> {
    setState((s) => ({ ...s, pending: true }));
    const result = await api<{ email: string }>("/api/v1/auth/otp", {
      method: "POST",
      body: { email },
    });

    if (result.ok && result.data) {
      setState({ step: "code", email: result.data.email });
    } else {
      setState({
        step: "email",
        email,
        issues: result.issues,
        authError: result.error?.key,
      });
    }
  }

  async function verifyCode(email: string, code: string): Promise<void> {
    setState((s) => ({ ...s, pending: true }));
    const result = await api("/api/v1/auth/verify", {
      method: "POST",
      body: { email, code },
    });

    if (result.ok) {
      // The session cookie is set; land on the dashboard with fresh data.
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // The address travelled in state; a failed check keeps it and the step.
    setState({
      step: result.issues?.some((i) => i.path === "email") ? "email" : "code",
      email,
      issues: result.issues,
      authError: result.error?.key,
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value || (onCodeStep ? "verify" : "send");

    const email = String(form.get("email") ?? state.email ?? "");

    if (intent === "changeEmail") {
      setState({ step: "email", email });
      return;
    }
    if (intent === "verify") {
      void verifyCode(email, String(form.get("code") ?? ""));
      return;
    }
    // "send" from the first step, "resend" from the second.
    void requestCode(email);
  }

  return (
    <form onSubmit={onSubmit}>
      {state.issues && state.issues.length > 0 ? (
        <ErrorSummary
          title={t("errorSummary.title")}
          errors={state.issues.map((i) => ({ field: i.path, message: messageFor(t, i) }))}
        />
      ) : null}

      {state.authError ? (
        <div style={{ marginBlockEnd: "var(--space-6)" }}>
          <Callout tone="error">{t(state.authError as "auth.otp.failed")}</Callout>
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
        <Button
          type="submit"
          name="intent"
          value={onCodeStep ? "verify" : "send"}
          size="lg"
          loading={state.pending}
        >
          {onCodeStep ? t("auth.otp.submit") : t("auth.login.submit")}
        </Button>
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
