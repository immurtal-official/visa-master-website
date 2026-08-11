"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations, type Locale } from "next-intl";
import type { ValidationIssue } from "@visa-master/core";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { submitApplication, type SubmitState } from "./actions";

/**
 * The last step: send it.
 *
 * Anything the whole-form check finds is listed here rather than at the top of
 * a page nobody scrolled to, and each item names the answer it is about, so it
 * is clear which of forty answers needs attention.
 */
export function ReviewForm({ locale, applicationId }: { locale: Locale; applicationId: string }) {
  const t = useTranslations();
  const [state, formAction] = useActionState<SubmitState, FormData>(submitApplication, {});

  return (
    <form action={formAction}>
      {state.error ? (
        <div style={{ marginBlockEnd: "var(--space-6)" }}>
          <Callout tone="error">{t(state.error)}</Callout>
        </div>
      ) : null}

      {state.issues && state.issues.length > 0 ? (
        <div style={{ marginBlockEnd: "var(--space-6)" }}>
          <Callout tone="warning" title={t("intake.review.incompleteTitle")}>
            <p style={{ margin: 0 }}>{t("intake.review.incompleteBody")}</p>
            <ul
              style={{
                margin: "var(--space-3) 0 0",
                paddingInlineStart: "var(--space-5)",
                display: "grid",
                gap: "var(--space-2)",
              }}
            >
              {state.issues.map((issue) => (
                <li key={`${issue.path}-${issue.key}`}>{messageFor(t, issue)}</li>
              ))}
            </ul>
          </Callout>
        </div>
      ) : null}

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="applicationId" value={applicationId} />
      <SubmitButton label={t("intake.review.submit")} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending}>
      {label}
    </Button>
  );
}

function messageFor(t: ReturnType<typeof useTranslations>, issue: ValidationIssue): string {
  // @ts-expect-error — the key space belongs to the catalogue, and the build
  // check guarantees every key a rule can emit is in it.
  return t(issue.key, issue.params);
}
