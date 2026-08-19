import { documentCompleteness, parseIntake } from "@visa-master/core";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "./auth-service";
import { ServiceError, ValidationFailure } from "./errors";

/**
 * Sending the application.
 *
 * Two things happen here that can happen nowhere else. The whole form is
 * checked at once — per-question checks cannot see the rules that relate two
 * answers, and a job must never be created from answers that would not pass.
 * And the job row is written with the server's own authority, because
 * enqueueing costs money and is quota-checked: a client that could insert one
 * could bill this product at will.
 */
export const submissionService = {
  async submit(applicationId: string): Promise<void> {
    const { userId, supabase } = await requireUser();

    const { data: application, error: readError } = await supabase
      .from("applications")
      .select("id, answers, residence_area, destination, purpose, employment, submitted_job_id")
      .eq("id", applicationId)
      .maybeSingle<{
        id: string;
        answers: Record<string, unknown>;
        residence_area: string;
        destination: string;
        purpose: string;
        employment: string;
        submitted_job_id: string | null;
      }>();

    if (readError) {
      console.error("submit: could not read the application", { code: readError.code });
      throw new ServiceError("intake.review.submitFailed", 502);
    }
    if (!application) throw new ServiceError("errors.notFound.title", 404);
    if (application.submitted_job_id) {
      throw new ServiceError("intake.review.alreadySubmitted", 409);
    }

    const parsed = parseIntake(application.answers ?? {});
    if (!parsed.ok) throw new ValidationFailure(parsed.issues);

    // The documents are half the pack. Enqueueing without them would spend ten
    // minutes of model time to produce something a reviewer must reject.
    const { data: uploads } = await supabase
      .from("uploads")
      .select("document, status")
      .eq("application_id", application.id)
      .returns<{ document: string; status: string }[]>();

    const documents = documentCompleteness(application.answers ?? {}, uploads ?? []);
    if (!documents.complete) {
      throw new ServiceError("intake.review.documentsMissing", 422, {
        missingDocuments: documents.missing,
      });
    }

    const admin = createAdminClient();

    const { data: job, error: jobError } = await admin
      .from("jobs")
      .insert({
        user_id: userId,
        task_type: "produce_pack",
        executor_kind: "hermes",
        // One job per application, so a double press bills once.
        idempotency_key: `produce_pack:application:${application.id}`,
        // The payload carries the work and not the person: the applicant's
        // details belong in the documents, so they travel — nothing that
        // identifies the account does.
        input: {
          route: {
            residenceArea: application.residence_area,
            destination: application.destination,
            purpose: application.purpose,
            employment: application.employment,
          },
          intake: parsed.data,
        },
        // Beta wall-clock cap; the clock starts at lease, never in the queue.
        deadline_seconds: 3600,
      })
      .select("id")
      .single<{ id: string }>();

    if (jobError || !job) {
      console.error("submit: could not enqueue", { code: jobError?.code });
      throw new ServiceError("intake.review.submitFailed", 502);
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
      // The job exists and will run; only the record failed to attach. The
      // idempotency key stops a retry from enqueueing a second one.
      console.error("submit: enqueued but could not mark", {
        code: markError.code,
        jobId: job.id,
      });
    }
  },
};
