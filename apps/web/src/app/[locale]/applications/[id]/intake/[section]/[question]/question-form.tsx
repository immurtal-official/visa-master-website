"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  FIELD_BEHAVIOUR,
  QUESTION_OPTION_GROUP,
  QUESTION_OPTIONS,
  type ValidationIssue,
} from "@visa-master/core";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { DateInput } from "@/components/ui/date-input";
import { ErrorSummary } from "@/components/ui/error-summary";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { api } from "@/lib/api/client";
import { Link, useRouter } from "@/i18n/navigation";

interface AnswerState {
  value?: string;
  issues?: ValidationIssue[];
  error?: string;
  pending?: boolean;
}

/**
 * How long the typing has to stop before it is worth a request. Long enough
 * that ordinary typing sends nothing, short enough that putting the phone down
 * mid-word and never coming back still keeps the word.
 */
const DRAFT_IDLE_MS = 800;

/**
 * What is in the field right now, including the states that are not yet an
 * answer.
 *
 * A date's hidden field is empty until year, month and day are all present, so
 * "2019" on its own would autosave as nothing. The three parts are named, so
 * read them instead and keep the gaps — `2019--` rehydrates into a year box
 * with a year in it, which is the whole point.
 */
function currentValue(form: HTMLFormElement, isDate: boolean): string {
  const data = new FormData(form);
  const complete = String(data.get("value") ?? "");
  if (complete || !isDate) return complete;

  const parts = (["year", "month", "day"] as const).map((p) =>
    String(data.get(`value.${p}`) ?? ""),
  );
  return parts.some(Boolean) ? parts.join("-") : "";
}

/**
 * One question, on its own page.
 *
 * The question is the heading, its explanation sits underneath it rather than
 * behind a tooltip, and there is one thing to answer. On a phone that means the
 * answer and the button are both visible without scrolling; on a desktop it
 * means nobody loses their place in a wall of fields.
 */
export function QuestionForm({
  applicationId,
  sectionId,
  questionId,
  path,
  savedValue,
  fromDocument = false,
}: {
  applicationId: string;
  sectionId: string;
  questionId: string;
  path: string;
  savedValue: string;
  /** The saved value was read off a document and is waiting to be confirmed. */
  fromDocument?: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [state, setState] = useState<AnswerState>({ value: savedValue });

  const behaviour = FIELD_BEHAVIOUR[path] ?? {};
  const isDate = behaviour.kind === "date";

  const formRef = useRef<HTMLFormElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** What the server was last told, so an unchanged field sends nothing. */
  const lastKept = useRef(savedValue);
  /** Once the answer is confirmed, the draft is gone and must not come back. */
  const confirmed = useRef(false);

  const draftPath = `/api/v1/applications/${applicationId}/draft-answers`;

  const keepDraft = useCallback(
    (value: string) => {
      if (confirmed.current || value === lastKept.current) return;
      lastKept.current = value;
      // Nothing on the page waits for this. A draft that fails to save is
      // retried by the next pause in typing, and Continue saves properly.
      void api(draftPath, { method: "POST", body: { sectionId, questionId, value } });
    },
    [draftPath, sectionId, questionId],
  );

  const onInput = useCallback(() => {
    clearTimeout(idleTimer.current);
    const form = formRef.current;
    if (!form) return;
    idleTimer.current = setTimeout(() => keepDraft(currentValue(form, isDate)), DRAFT_IDLE_MS);
  }, [isDate, keepDraft]);

  useEffect(() => {
    // Held here rather than read at cleanup time: by then the form is on its
    // way out of the tree and the ref may already be empty, which is the one
    // moment this effect most needs it.
    const form = formRef.current;
    if (!form) return;

    // Leaving is the case that matters most and the one fetch handles worst:
    // a request started while the page is being torn down can be cancelled. A
    // beacon is handed to the browser to deliver on its own time.
    function keepOnHide(): void {
      if (document.visibilityState !== "hidden" || confirmed.current || !form) return;
      clearTimeout(idleTimer.current);
      const value = currentValue(form, isDate);
      if (value === lastKept.current) return;
      lastKept.current = value;
      navigator.sendBeacon(
        draftPath,
        new Blob([JSON.stringify({ sectionId, questionId, value })], {
          type: "application/json",
        }),
      );
    }

    document.addEventListener("visibilitychange", keepOnHide);
    return () => {
      document.removeEventListener("visibilitychange", keepOnHide);
      clearTimeout(idleTimer.current);
      // Moving to another question is still leaving this one, and here the
      // page survives, so an ordinary request is enough.
      keepDraft(currentValue(form, isDate));
    };
  }, [draftPath, isDate, keepDraft, sectionId, questionId]);

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    clearTimeout(idleTimer.current);
    const value = String(new FormData(event.currentTarget).get("value") ?? "");
    setState({ value, pending: true });

    const result = await api<{ next: { sectionId: string; questionId: string } | null }>(
      `/api/v1/applications/${applicationId}/answers`,
      { method: "POST", body: { sectionId, questionId, value } },
    );

    if (result.ok && result.data) {
      // The answer is stored and the server has dropped the draft with it.
      confirmed.current = true;
      const next = result.data.next;
      router.push(
        next
          ? `/applications/${applicationId}/intake/${next.sectionId}/${next.questionId}`
          : `/applications/${applicationId}/intake`,
      );
      router.refresh();
      return;
    }

    if (result.status === 401) {
      setState({ value, error: "route.sessionExpired" });
      return;
    }
    setState({
      value,
      issues: result.issues,
      error: result.issues ? undefined : (result.error?.key ?? "intake.saveFailed"),
    });
  }

  const value = state.value ?? savedValue;
  const issue = state.issues?.[0];
  const message = issue ? messageFor(t, issue) : undefined;

  const questionKey = `intake.question.${sectionId}.${questionId}`;
  const hintKey = `${questionKey}Hint`;
  const hint = t.has(hintKey as "intake.question.applicant.nameHint")
    ? t(hintKey as "intake.question.applicant.nameHint")
    : undefined;

  return (
    <form ref={formRef} onInput={onInput} onChange={onInput} onSubmit={(event) => void save(event)}>
      {state.issues && state.issues.length > 0 ? (
        <ErrorSummary
          title={t("errorSummary.title")}
          errors={state.issues.map((i) => ({ field: "value", message: messageFor(t, i) }))}
        />
      ) : null}

      {state.error ? (
        <div style={{ marginBlockEnd: "var(--space-6)" }}>
          <Callout tone="error">{t(state.error as "intake.saveFailed")}</Callout>
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

      {/* Said before the answer, not after: the reader should check the value
          knowing where it came from. Pressing Continue is the confirmation. */}
      {fromDocument ? (
        <div style={{ marginBlockStart: "var(--space-6)" }}>
          <Callout tone="info" title={t("intake.fromDocument.title")}>
            {t("intake.fromDocument.body")}
          </Callout>
        </div>
      ) : null}

      <div style={{ marginBlockStart: "var(--space-6)" }}>
        {behaviour.kind === "choice" ? (
          <RadioGroup
            name="value"
            legend={
              <span className="vm-visually-hidden">
                {t(questionKey as "intake.question.applicant.name")}
              </span>
            }
            error={message}
            defaultValue={value}
            options={(QUESTION_OPTIONS[path] ?? []).map((option) => ({
              value: option,
              title: optionLabel(t, path, option),
            }))}
          />
        ) : behaviour.kind === "date" ? (
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
        <SaveButton label={t("intake.next")} pending={state.pending} />
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

function SaveButton({ label, pending }: { label: string; pending?: boolean }) {
  return (
    <Button type="submit" size="lg" loading={pending}>
      {label}
    </Button>
  );
}

/**
 * The label for one option, filed under the set the question declares in
 * packages/core. questionnaire.test.ts checks that every set's labels exist in
 * both catalogues, which is what makes the cast below safe.
 */
function optionLabel(
  t: ReturnType<typeof useTranslations<never>>,
  path: string,
  option: string,
): string {
  const group = QUESTION_OPTION_GROUP[path];
  return t(`intake.option.${group}.${option}` as "intake.option.yesNoUnsure.yes");
}

function messageFor(t: ReturnType<typeof useTranslations>, issue: ValidationIssue): string {
  // @ts-expect-error — the key space belongs to the catalogue, and the build
  // check guarantees every key a rule can emit is in it.
  return t(issue.key, issue.params);
}
