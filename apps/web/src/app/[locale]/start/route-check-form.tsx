"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations, type Locale } from "next-intl";
import {
  DESTINATIONS,
  EMPLOYMENT_STATUSES,
  PURPOSES,
  RESIDENCE_AREAS,
  type UnsupportedReason,
  type ValidationIssue,
} from "@visa-master/core";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { ErrorSummary } from "@/components/ui/error-summary";
import { RadioGroup } from "@/components/ui/radio-group";
import { checkRouteAction, createApplication, joinWaitlist, type RouteCheckState } from "./actions";

/** Form field names. Not copy — they are the contract with the server action. */
const ANSWER_FIELDS = ["residenceArea", "destination", "purpose", "employment"] as const;

/**
 * The route check.
 *
 * Four questions, answered before anything exists. The product serves one
 * route today, so the honest thing is to ask early and say plainly when the
 * answer is no — a form that only accepts one combination, or a rejection
 * after payment, are both worse.
 */
export function RouteCheckForm({
  locale,
  initialState = {},
}: {
  locale: Locale;
  /** A route check parked while its owner signed in, restored on their return. */
  initialState?: RouteCheckState;
}) {
  const t = useTranslations();
  const [state, formAction] = useActionState<RouteCheckState, FormData>(
    checkRouteAction,
    initialState,
  );

  if (state.verdict?.supported) {
    return <SupportedRoute state={state} locale={locale} />;
  }
  if (state.verdict && !state.verdict.supported) {
    return <UnsupportedRoute state={state} locale={locale} reasons={state.verdict.reasons} />;
  }

  const issueFor = (path: string) => state.issues?.find((i) => i.path === path);

  return (
    <form action={formAction}>
      {state.issues && state.issues.length > 0 ? (
        <ErrorSummary
          title={t("errorSummary.title")}
          errors={state.issues.map((i) => ({ field: i.path, message: messageFor(t, i) }))}
        />
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
        {t("route.title")}
      </h1>
      <p
        style={{
          marginBlock: "var(--space-3) var(--space-8)",
          maxInlineSize: "var(--measure-question)",
          color: "var(--text-body)",
        }}
      >
        {t("route.intro")}
      </p>

      <input type="hidden" name="locale" value={locale} />

      <div style={{ display: "grid", gap: "var(--space-8)" }}>
        <RadioGroup
          name="residenceArea"
          legend={t("route.areaLabel")}
          hint={t("route.areaHint")}
          error={issueFor("residenceArea") ? messageFor(t, issueFor("residenceArea")!) : undefined}
          defaultValue={state.answers?.residenceArea}
          options={RESIDENCE_AREAS.map((area) => ({
            value: area,
            title: t(`route.area.${area}`),
          }))}
        />

        <RadioGroup
          name="destination"
          legend={t("route.destinationLabel")}
          error={issueFor("destination") ? messageFor(t, issueFor("destination")!) : undefined}
          defaultValue={state.answers?.destination}
          options={DESTINATIONS.map((code) => ({
            value: code,
            // Country names come from the platform rather than the catalogue:
            // they are locale data, and nobody should be translating them here.
            title: code === "other" ? t("route.destinationOther") : countryName(locale, code),
          }))}
        />

        <RadioGroup
          name="purpose"
          legend={t("route.purposeLabel")}
          error={issueFor("purpose") ? messageFor(t, issueFor("purpose")!) : undefined}
          defaultValue={state.answers?.purpose}
          options={PURPOSES.map((purpose) => ({
            value: purpose,
            title: t(`route.purpose.${purpose}`),
          }))}
        />

        <RadioGroup
          name="employment"
          legend={t("route.employmentLabel")}
          error={issueFor("employment") ? messageFor(t, issueFor("employment")!) : undefined}
          defaultValue={state.answers?.employment}
          options={EMPLOYMENT_STATUSES.map((status) => ({
            value: status,
            title: t(`route.employment.${status}`),
          }))}
        />
      </div>

      <div style={{ marginBlockStart: "var(--space-8)" }}>
        <SubmitButton label={t("route.submit")} />
      </div>
    </form>
  );
}

function SupportedRoute({ state, locale }: { state: RouteCheckState; locale: Locale }) {
  const t = useTranslations();
  const [createState, createAction] = useActionState<RouteCheckState, FormData>(
    createApplication,
    state,
  );

  return (
    <Card>
      {createState.error ? (
        <div style={{ marginBlockEnd: "var(--space-5)" }}>
          <Callout tone="error">{t(createState.error)}</Callout>
        </div>
      ) : null}
      <h1
        style={{
          margin: 0,
          fontSize: "var(--type-h2-size)",
          lineHeight: "var(--type-h2-lh)",
          fontWeight: "var(--fw-semibold)",
          color: "var(--text-heading)",
        }}
      >
        {t("route.supported.title")}
      </h1>
      <p
        style={{
          marginBlock: "var(--space-3) var(--space-6)",
          maxInlineSize: "var(--measure-prose)",
          color: "var(--text-body)",
        }}
      >
        {t("route.supported.body")}
      </p>

      <form action={createAction}>
        <input type="hidden" name="locale" value={locale} />
        <HiddenAnswers state={state} />
        <SubmitButton label={t("route.supported.cta")} />
      </form>
    </Card>
  );
}

function UnsupportedRoute({
  state,
  locale,
  reasons,
}: {
  state: RouteCheckState;
  locale: Locale;
  reasons: UnsupportedReason[];
}) {
  const t = useTranslations();
  const [waitlistState, waitlistAction] = useActionState<RouteCheckState, FormData>(
    joinWaitlist,
    state,
  );

  return (
    <>
      <Card>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--type-h2-size)",
            lineHeight: "var(--type-h2-lh)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--text-heading)",
          }}
        >
          {t("route.unsupported.title")}
        </h1>
        <p
          style={{
            marginBlock: "var(--space-3) var(--space-4)",
            maxInlineSize: "var(--measure-prose)",
            color: "var(--text-body)",
          }}
        >
          {t("route.unsupported.intro")}
        </p>

        <ul
          style={{
            margin: 0,
            paddingInlineStart: "var(--space-5)",
            display: "grid",
            gap: "var(--space-2)",
            color: "var(--text-body)",
            maxInlineSize: "var(--measure-prose)",
          }}
        >
          {reasons.map((reason) => (
            // The gate emits catalogue keys, so a reason is looked up the same
            // way any other rule outcome is.
            <li key={reason}>{t(reason)}</li>
          ))}
        </ul>
      </Card>

      <div style={{ marginBlockStart: "var(--space-6)" }}>
        {waitlistState.waitlisted ? (
          <Callout tone="success">{t("route.unsupported.waitlistDone")}</Callout>
        ) : (
          <Card tone="sunken" elevation={0}>
            {waitlistState.error ? (
              <div style={{ marginBlockEnd: "var(--space-4)" }}>
                <Callout tone="error">{t(waitlistState.error)}</Callout>
              </div>
            ) : null}
            <h2
              style={{
                margin: 0,
                fontSize: "var(--type-h3-size)",
                lineHeight: "var(--type-h3-lh)",
                fontWeight: "var(--fw-semibold)",
                color: "var(--text-heading)",
              }}
            >
              {t("route.unsupported.waitlistTitle")}
            </h2>
            <p
              style={{
                marginBlock: "var(--space-3) var(--space-5)",
                maxInlineSize: "var(--measure-prose)",
                color: "var(--text-body)",
              }}
            >
              {t("route.unsupported.waitlistBody")}
            </p>

            <form action={waitlistAction}>
              <input type="hidden" name="locale" value={locale} />
              <HiddenAnswers state={state} />
              <SubmitButton label={t("route.unsupported.waitlistCta")} variant="secondary" />
            </form>
          </Card>
        )}
      </div>

      <p style={{ marginBlockStart: "var(--space-6)" }}>
        <a href={`/${locale === "en" ? "en" : "zh"}/start`} style={{ color: "var(--text-link)" }}>
          {t("route.unsupported.backCta")}
        </a>
      </p>
    </>
  );
}

function HiddenAnswers({ state }: { state: RouteCheckState }) {
  return (
    <>
      {ANSWER_FIELDS.map((field) => (
        <input key={field} type="hidden" name={field} value={state.answers?.[field] ?? ""} />
      ))}
    </>
  );
}

function SubmitButton({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant={variant} loading={pending}>
      {label}
    </Button>
  );
}

/** Locale-aware country names, from the platform's own data. */
function countryName(locale: Locale, code: string): string {
  return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
}

function messageFor(t: ReturnType<typeof useTranslations>, issue: ValidationIssue): string {
  // @ts-expect-error — the key space belongs to the catalogue, and the build
  // check guarantees every key a rule can emit is in it.
  return t(issue.key, issue.params);
}
