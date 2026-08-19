"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ValidationIssue } from "@visa-master/core";
import { api } from "@/lib/api/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

interface SubmitState {
  issues?: ValidationIssue[];
  error?: string;
  pending?: boolean;
}

/**
 * The last step: send it.
 *
 * Anything the whole-form check finds is listed here rather than at the top of
 * a page nobody scrolled to, and each item names the answer it is about, so it
 * is clear which of forty answers needs attention.
 */
export function ReviewForm({ applicationId }: { applicationId: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({});

  async function submit(): Promise<void> {
    setState({ pending: true });
    const result = await api(`/api/v1/applications/${applicationId}/submit`, { method: "POST" });

    if (result.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    if (result.status === 401) {
      setState({ error: "route.sessionExpired" });
      return;
    }
    setState({
      issues: result.issues,
      error: result.issues ? undefined : (result.error?.key ?? "intake.review.submitFailed"),
    });
  }

  return (
    <div>
      {state.error ? (
        <div style={{ marginBlockEnd: "var(--space-6)" }}>
          <Callout tone="error">{t(state.error as "intake.review.submitFailed")}</Callout>
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

      <Button size="lg" loading={state.pending} onClick={() => void submit()}>
        {t("intake.review.submit")}
      </Button>
    </div>
  );
}

function messageFor(t: ReturnType<typeof useTranslations>, issue: ValidationIssue): string {
  // @ts-expect-error — the key space belongs to the catalogue, and the build
  // check guarantees every key a rule can emit is in it.
  return t(issue.key, issue.params);
}
