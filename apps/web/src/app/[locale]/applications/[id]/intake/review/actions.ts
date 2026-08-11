"use server";

import type { Locale } from "next-intl";
import { redirect } from "next/navigation";
import { parseIntake, type ValidationIssue } from "@visa-master/core";
import { getPathname } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { readSession } from "@/lib/supabase/session";

export interface SubmitState {
  issues?: ValidationIssue[];
  error?: "intake.review.submitFailed" | "intake.review.alreadySubmitted" | "route.sessionExpired";
}

/**
 * Send the application.
 *
 * Two things happen here that cannot happen anywhere else. The whole form is
 * checked at once — the per-question checks cannot see the rules that relate
 * two answers, and a job must never be created from answers that would not
 * pass. And the job row is written with the server's own authority, because
 * enqueueing costs money and is quota-checked: a client that could insert one
 * could bill this product at will.
 */
export async function submitApplication(
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const locale = formData.get("locale") as Locale;
  const applicationId = String(formData.get("applicationId") ?? "");

  const supabase = await createClient();
  const session = await readSession(supabase);
  if (session.status !== "signed-in") return { error: "route.sessionExpired" };

  const { data: application, error: readError } = await supabase
    .from("applications")
    .select("id, answers, residence_area, destination, purpose, employment, submitted_job_id")
    .eq("id", applicationId)
    .single<{
      id: string;
      answers: Record<string, unknown>;
      residence_area: string;
      destination: string;
      purpose: string;
      employment: string;
      submitted_job_id: string | null;
    }>();

  if (readError || !application) {
    console.error("submitApplication: could not read the application", { code: readError?.code });
    return { error: "intake.review.submitFailed" };
  }

  if (application.submitted_job_id) return { error: "intake.review.alreadySubmitted" };

  const parsed = parseIntake(application.answers ?? {});
  if (!parsed.ok) return { issues: parsed.issues };

  const admin = createAdminClient();

  const { data: job, error: jobError } = await admin
    .from("jobs")
    .insert({
      user_id: session.userId,
      task_type: "produce_pack",
      executor_kind: "hermes",
      // One job per application, so a double-click bills once.
      idempotency_key: `produce_pack:application:${application.id}`,
      // The payload the agent receives. It carries the work and not the person:
      // no user id, no address, no token. The applicant's own details are part
      // of the documents, so they travel here — but nothing that identifies the
      // account does.
      input: {
        route: {
          residenceArea: application.residence_area,
          destination: application.destination,
          purpose: application.purpose,
          employment: application.employment,
        },
        intake: parsed.data,
      },
      // The beta wall-clock cap. It counts from lease, so time spent waiting in
      // the queue never eats into the run.
      deadline_seconds: 3600,
    })
    .select("id")
    .single<{ id: string }>();

  if (jobError || !job) {
    console.error("submitApplication: could not enqueue", {
      code: jobError?.code,
      message: jobError?.message,
    });
    return { error: "intake.review.submitFailed" };
  }

  const { error: markError } = await admin
    .from("applications")
    .update({
      status: "submitted",
      submitted_job_id: job.id,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", application.id);

  if (markError) {
    // The job exists and will run; only the record of it failed to attach. Say
    // so rather than claiming failure, and leave the idempotency key to stop a
    // retry from enqueueing a second one.
    console.error("submitApplication: enqueued but could not mark the application", {
      code: markError.code,
      jobId: job.id,
    });
  }

  redirect(getPathname({ href: "/dashboard", locale }));
}
