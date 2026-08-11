"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations, type Locale } from "next-intl";
import { FIELD_BEHAVIOUR, type ValidationIssue } from "@visa-master/core";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { DateInput } from "@/components/ui/date-input";
import { ErrorSummary } from "@/components/ui/error-summary";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { saveAnswer, type AnswerState } from "../../actions";

/**
 * One question, on its own page.
 *
 * The question is the heading, its explanation sits underneath it rather than
 * behind a tooltip, and there is one thing to answer. On a phone that means the
 * answer and the button are both visible without scrolling; on a desktop it
 * means nobody loses their place in a wall of fields.
 */
export function QuestionForm({
  locale,
  applicationId,
  sectionId,
  questionId,
  path,
  savedValue,
}: {
  locale: Locale;
  applicationId: string;
  sectionId: string;
  questionId: string;
  path: string;
  savedValue: string;
}) {
  const t = useTranslations();
  const [state, formAction] = useActionState<AnswerState, FormData>(saveAnswer, {
    value: savedValue,
  });

  const behaviour = FIELD_BEHAVIOUR[path] ?? {};
  const value = state.value ?? savedValue;
  const issue = state.issues?.[0];
  const message = issue ? messageFor(t, issue) : undefined;

  const questionKey = `intake.question.${sectionId}.${questionId}`;
  const hintKey = `${questionKey}Hint`;
  const hint = t.has(hintKey as "intake.question.applicant.nameHint")
    ? t(hintKey as "intake.question.applicant.nameHint")
    : undefined;

  return (
    <form action={formAction}>
      {state.issues && state.issues.length > 0 ? (
        <ErrorSummary
          title={t("errorSummary.title")}
          errors={state.issues.map((i) => ({ field: "value", message: messageFor(t, i) }))}
        />
      ) : null}

      {state.error ? (
        <div style={{ marginBlockEnd: "var(--space-6)" }}>
          <Callout tone="error">{t(state.error)}</Callout>
        </div>
      ) : null}

      {/* The question is the page heading AND the field's label. Tying the two
          together is what lets a screen reader announce the question when the
          field takes focus, rather than an unlabelled box beneath a heading it
          has no way to connect to. */}
      <h1 style={{ margin: 0 }}>
        <label
          htmlFor="value"
          style={{
            display: "block",
            maxInlineSize: "var(--measure-question)",
            fontSize: "var(--type-question-size)",
            lineHeight: "var(--type-question-lh)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--text-heading)",
          }}
        >
          {t(questionKey as "intake.question.applicant.name")}
        </label>
      </h1>

      {hint ? (
        <p
          id="value-hint"
          style={{
            marginBlock: "var(--space-3) 0",
            maxInlineSize: "var(--measure-question)",
            fontSize: "var(--type-hint-size)",
            lineHeight: "var(--type-hint-lh)",
            color: "var(--text-muted)",
          }}
        >
          {hint}
        </p>
      ) : null}

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="questionId" value={questionId} />

      <div style={{ marginBlockStart: "var(--space-6)" }}>
        {behaviour.kind === "date" ? (
          <>
            {message ? (
              <p
                style={{
                  marginBlockEnd: "var(--space-2)",
                  fontSize: "var(--fs-14)",
                  fontWeight: "var(--fw-medium)",
                  color: "var(--status-error-fg)",
                }}
              >
                {message}
              </p>
            ) : null}
            <DateInput
              name="value"
              defaultValue={value}
              invalid={Boolean(message)}
              describedBy={hint ? "value-hint" : undefined}
              labels={{
                year: t("intake.date.year"),
                month: t("intake.date.month"),
                day: t("intake.date.day"),
              }}
            />
          </>
        ) : (
          <Input
            id="value"
            name="value"
            defaultValue={value}
            error={message}
            // Keyboard behaviour belongs to the field's type, which the schema
            // declares — not to this screen.
            inputMode={behaviour.inputMode}
            autoComplete={behaviour.autoComplete}
            autoCapitalize={behaviour.autoCapitalize}
            autoCorrect={behaviour.autoCorrect}
            maxLength={behaviour.maxLength}
            width={behaviour.maxLength && behaviour.maxLength <= 20 ? "md" : "lg"}
            uppercase={behaviour.uppercase}
            aria-describedby={hint ? "value-hint" : undefined}
            autoFocus
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-5)",
          marginBlockStart: "var(--space-8)",
        }}
      >
        <SaveButton label={t("intake.next")} />
        <Link
          href={`/applications/${applicationId}/intake`}
          style={{ color: "var(--text-link)", fontSize: "var(--fs-16)" }}
        >
          {t("intake.backToHub")}
        </Link>
      </div>

      {/* Reassurance that is specific rather than warm: it says what happened
          and what that means for leaving. */}
      <p
        style={{
          marginBlockStart: "var(--space-6)",
          fontSize: "var(--type-hint-size)",
          color: "var(--text-muted)",
          maxInlineSize: "var(--measure-prose)",
        }}
      >
        {t("intake.saved")}
      </p>
    </form>
  );
}

function SaveButton({ label }: { label: string }) {
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
