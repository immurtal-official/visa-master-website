import { checkRoute, parseRouteCheck } from "@visa-master/core";
import { requireUser } from "./auth-service";
import { ServiceError, ValidationFailure } from "./errors";

/**
 * Applications: the drafts someone fills in, and the record of what they sent.
 *
 * Reads go through the caller's own request-scoped client, so row-level
 * security limits every query to their rows — there is deliberately no
 * ownership filter here, because the policy is the check and pgTAP asserts it.
 */

export interface ApplicationSummary {
  id: string;
  destination: string;
  purpose: string;
  status: "draft" | "submitted" | "cancelled";
  created_at: string;
}

export interface ApplicationDetail extends ApplicationSummary {
  answers: Record<string, unknown>;
  last_step: string | null;
  submitted_job_id: string | null;
}

export const applicationService = {
  async list(): Promise<ApplicationSummary[]> {
    const { supabase } = await requireUser();

    const { data, error } = await supabase
      .from("applications")
      .select("id, destination, purpose, status, created_at")
      .order("updated_at", { ascending: false })
      .returns<ApplicationSummary[]>();

    if (error) {
      console.error("applications.list: failed", { code: error.code });
      throw new ServiceError("dashboard.loadFailed.title", 502);
    }
    return data ?? [];
  },

  async get(
    id: string,
  ): Promise<{ application: ApplicationDetail; job: { state: string } | null }> {
    const { supabase } = await requireUser();

    const { data: application, error } = await supabase
      .from("applications")
      .select("id, destination, purpose, status, answers, last_step, created_at, submitted_job_id")
      .eq("id", id)
      .maybeSingle<ApplicationDetail>();

    if (error) {
      console.error("applications.get: failed", { code: error.code });
      throw new ServiceError("dashboard.loadFailed.title", 502);
    }
    // Someone else's application is simply not there — the honest answer is
    // "no such thing", not "you may not".
    if (!application) throw new ServiceError("errors.notFound.title", 404);

    const { data: job } = await supabase
      .from("jobs")
      .select("state")
      .eq("id", application.submitted_job_id ?? "")
      .maybeSingle<{ state: string }>();

    return { application, job: job ?? null };
  },

  /**
   * Create the draft. The gate runs again here rather than trusting whatever
   * form said it passed — the answers travelled through a client, and this is
   * the step that writes something.
   */
  async create(input: unknown): Promise<{ id: string }> {
    const parsed = parseRouteCheck(input);
    if (!parsed.ok) throw new ValidationFailure(parsed.issues);

    const verdict = checkRoute(parsed.data);
    if (!verdict.supported) {
      throw new ServiceError("route.unsupported.title", 422, { reasons: verdict.reasons });
    }

    const { userId, supabase } = await requireUser();

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: userId,
        residence_area: parsed.data.residenceArea,
        destination: parsed.data.destination,
        purpose: parsed.data.purpose,
        employment: parsed.data.employment,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) {
      console.error("applications.create: insert failed", {
        code: error?.code,
        message: error?.message,
        userId,
      });
      throw new ServiceError("route.createFailed", 502);
    }

    return { id: data.id };
  },
};
