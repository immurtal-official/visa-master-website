"use client";

import { useState, type FormEvent } from "react";
import { useTranslations, type Locale } from "next-intl";
import {
  DESTINATIONS,
  EMPLOYMENT_STATUSES,
  PURPOSES,
  RESIDENCE_AREAS,
  checkRoute,
  parseRouteCheck,
  type RouteCheck,
  type UnsupportedReason,
  type ValidationIssue,
} from "@visa-master/core";
import { api } from "@/lib/api/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { ErrorSummary } from "@/components/ui/error-summary";
import { RadioGroup } from "@/components/ui/radio-group";

/**
 * The route check.
 *
 * Four questions, answered before anything exists. The screen is a client of
 * the API: the gate itself lives in packages/core and is applied by
 * /api/v1/route-checks, and applied AGAIN by /api/v1/applications at the step
 * that creates something — this component only collects answers and renders
 * verdicts.
 *
 * The check is deliberately readable signed out, so the person answering it
 * usually has no account. Pressing "create" then detours through sign-in; the
 * answers wait in sessionStorage and are restored when they come back, because
 * a product that forgets four answers on the way to sign-in is teaching its
 * user that it forgets things.
 */
const PARKED_KEY = "vm_route_check";

interface RouteCheckState {
  answers?: Partial<RouteCheck>;
  issues?: ValidationIssue[];
  verdict?: { supported: true } | { supported: false; reasons: UnsupportedReason[] };
  waitlisted?: boolean;
  error?: string;
  pending?: boolean;
}

function answersFrom(form: FormData): Partial<RouteCheck> {
  return {
    residenceArea: (form.get("residenceArea") as RouteCheck["residenceArea"]) || undefined,
    destination: (form.get("destination") as RouteCheck["destination"]) || undefined,
    purpose: (form.get("purpose") as RouteCheck["purpose"]) || undefined,
    employment: (form.get("employment") as RouteCheck["employment"]) || undefined,
  };
}

export function RouteCheckForm({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const router = useRouter();
  // Restore a route check parked while its owner signed in — read once, as the
  // initial state, before first paint. The verdict is recomputed from the
  // shared rules for display; the server re-runs the gate before anything is
  // created either way.
  const [state, setState] = useState<RouteCheckState>(() => {
    if (typeof window === "undefined") return {};
    const raw = window.sessionStorage.getItem(PARKED_KEY);
    if (!raw) return {};
    try {
      const parsed = parseRouteCheck(JSON.parse(raw));
      if (parsed.ok) return { answers: parsed.data, verdict: checkRoute(parsed.data) };
    } catch {
      window.sessionStorage.removeItem(PARKED_KEY);
    }
    return {};
  });

  async function check(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const answers = answersFrom(new FormData(event.currentTarget));
    setState({ answers, pending: true });

    const result = await api<{ answers: RouteCheck; verdict: RouteCheckState["verdict"] }>(
      "/api/v1/route-checks",
      { method: "POST", body: answers },
    );

    if (result.ok && result.data) {
      setState({ answers: result.data.answers, verdict: result.data.verdict });
    } else {
      setState({
        answers,
        issues: result.issues,
        error: result.issues ? undefined : result.error?.key,
      });
    }
  }

  async function createApplication(): Promise<void> {
    const answers = state.answers;
    setState((s) => ({ ...s, pending: true, error: undefined }));

    const result = await api<{ application: { id: string } }>("/api/v1/applications", {
      method: "POST",
      body: answers,
    });

    if (result.ok) {
      window.sessionStorage.removeItem(PARKED_KEY);
      router.push("/dashboard");
      router.refresh();
      return;
    }

    if (result.status === 401) {
      // Park the answers before the detour, so they come back to this card.
      window.sessionStorage.setItem(PARKED_KEY, JSON.stringify(answers));
      router.push("/login");
      return;
    }

    setState((s) => ({ ...s, pending: false, error: result.error?.key ?? "route.createFailed" }));
  }

  async function joinWaitlist(): Promise<void> {
    setState((s) => ({ ...s, pending: true, error: undefined }));
    const result = await api("/api/v1/waitlist", { method: "POST", body: state.answers });

    if (result.ok) {
      setState((s) => ({ ...s, pending: false, waitlisted: true }));
    } else {
      setState((s) => ({
        ...s,
        pending: false,
        error: result.error?.key ?? "route.waitlistFailed",
      }));
    }
  }

  if (state.verdict?.supported) {
    return (
      <SupportedRoute
        pending={state.pending}
        error={state.error}
        onCreate={() => void createApplication()}
      />
    );
  }
  if (state.verdict && !state.verdict.supported) {
    return (
      <UnsupportedRoute
        reasons={state.verdict.reasons}
        waitlisted={state.waitlisted}
        pending={state.pending}
        error={state.error}
        locale={locale}
        onJoin={() => void joinWaitlist()}
      />
    );
  }

  const issueFor = (path: string) => state.issues?.find((i) => i.path === path);

  return (
    <form onSubmit={(event) => void check(event)}>
      {state.issues && state.issues.length > 0 ? (
        <ErrorSummary
          title={t("errorSummary.title")}
          errors={state.issues.map((i) => ({ field: i.path, message: messageFor(t, i) }))}
        />
      ) : null}

      {state.error ? (
        <div style={{ marginBlockEnd: "var(--space-6)" }}>
          <Callout tone="error">{t(state.error as "errors.request")}</Callout>
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
        <Button type="submit" size="lg" loading={state.pending}>
          {t("route.submit")}
        </Button>
      </div>
    </form>
  );
}

function SupportedRoute({
  pending,
  error,
  onCreate,
}: {
  pending?: boolean;
  error?: string;
  onCreate: () => void;
}) {
  const t = useTranslations();

  return (
    <Card>
      {error ? (
        <div style={{ marginBlockEnd: "var(--space-5)" }}>
          <Callout tone="error">{t(error as "route.createFailed")}</Callout>
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

      <Button size="lg" loading={pending} onClick={onCreate}>
        {t("route.supported.cta")}
      </Button>
    </Card>
  );
}

function UnsupportedRoute({
  reasons,
  waitlisted,
  pending,
  error,
  locale,
  onJoin,
}: {
  reasons: UnsupportedReason[];
  waitlisted?: boolean;
  pending?: boolean;
  error?: string;
  locale: Locale;
  onJoin: () => void;
}) {
  const t = useTranslations();

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
        {waitlisted ? (
          <Callout tone="success">{t("route.unsupported.waitlistDone")}</Callout>
        ) : (
          <Card tone="sunken" elevation={0}>
            {error ? (
              <div style={{ marginBlockEnd: "var(--space-4)" }}>
                <Callout tone="error">{t(error as "route.waitlistFailed")}</Callout>
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

            <Button variant="secondary" size="lg" loading={pending} onClick={onJoin}>
              {t("route.unsupported.waitlistCta")}
            </Button>
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

/** Locale-aware country names, from the platform's own data. */
function countryName(locale: Locale, code: string): string {
  return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
}

function messageFor(t: ReturnType<typeof useTranslations>, issue: ValidationIssue): string {
  // @ts-expect-error — the key space belongs to the catalogue, and the build
  // check guarantees every key a rule can emit is in it.
  return t(issue.key, issue.params);
}
