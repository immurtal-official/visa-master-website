import type { Pool } from "pg";
import type { CollectedRun } from "@visa-master/executors/contract";
import {
  INTAKE_VERSION,
  decideProposals,
  extractionResultSchema,
  type AnswerSource,
} from "@visa-master/core";
import { documentRefs } from "./documents";
import type { JobRow } from "./lease";

/**
 * What a finished step's output changes, for the tasks whose output is data.
 *
 * A pack is collected and reviewed; an extraction is written back into the
 * application it was read for. That writing is the conductor's — deterministic
 * code over a validated report — and never the reader's: the reader says what
 * it saw, and decideProposals in packages/core says what may become of it.
 */

/** Raised when an output cannot be written back. Its message reaches jobs.error. */
export class WriteBackRefused extends Error {
  override name = "WriteBackRefused";
}

export interface WriteBackSummary {
  /** Fields recorded in document_fields. */
  recorded: number;
  /** Of those, how many became proposed answers. */
  proposed: number;
}

export type ResultWriter = (
  pool: Pool,
  job: JobRow,
  collected: CollectedRun,
) => Promise<WriteBackSummary>;

/** Set a value at a dot-path, creating the objects on the way. */
function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  const last = keys.pop()!;
  let node = target;
  for (const key of keys) {
    const next = node[key];
    node[key] = typeof next === "object" && next !== null ? next : {};
    node = node[key] as Record<string, unknown>;
  }
  node[last] = value;
}

/**
 * Write one document's extraction back.
 *
 * Every field the document was asked for is recorded against its upload,
 * replacing an earlier reading of the same field. Those that decideProposals
 * accepts are stored as answers and marked as document-sourced placeholders,
 * which the submission refuses until the applicant confirms each one — and
 * only while the application is still a draft. All of it in one transaction,
 * holding the application's row while deciding, so the decision is made on the
 * answers as they are rather than as they were a moment ago.
 *
 * An upload removed while it was being read is not an error: there is simply
 * nothing left to attach the reading to.
 */
export const applyExtraction: ResultWriter = async (pool, job, collected) => {
  const report = extractionResultSchema.safeParse(collected.output);
  if (!report.success) throw new WriteBackRefused("the extraction report is malformed");

  const refs = documentRefs(job.input);
  if (refs.length !== 1) throw new WriteBackRefused("an extraction reads exactly one document");
  const requested = (job.input as { fields?: unknown }).fields;
  if (!Array.isArray(requested) || !requested.every((field) => typeof field === "string")) {
    throw new WriteBackRefused("the extraction's requested fields are malformed");
  }

  const client = await pool.connect();
  try {
    await client.query("begin");

    const { rows: uploads } = await client.query<{ application_id: string }>(
      `select application_id from public.uploads
       where id = $1 and user_id = $2 and status = 'stored'`,
      [refs[0]!.uploadId, job.user_id],
    );
    const upload = uploads[0];
    if (!upload) {
      await client.query("rollback");
      return { recorded: 0, proposed: 0 };
    }

    const { rows: applications } = await client.query<{
      answers: Record<string, unknown>;
      status: string;
    }>(
      `select answers, status from public.applications
       where id = $1 and user_id = $2
       for update`,
      [upload.application_id, job.user_id],
    );
    const application = applications[0];
    if (!application) {
      await client.query("rollback");
      return { recorded: 0, proposed: 0 };
    }

    const { rows: sources } = await client.query<AnswerSource>(
      `select path, source, confirmed_at from public.answer_sources where application_id = $1`,
      [upload.application_id],
    );

    const decision = decideProposals({
      fields: report.data.fields,
      requested,
      answers: application.answers ?? {},
      sources,
    });

    const fieldIds = new Map<string, string>();
    for (const field of decision.recorded) {
      const { rows } = await client.query<{ id: string }>(
        `insert into public.document_fields
           (upload_id, application_id, user_id, field, value, confidence, source_page, job_id)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         on conflict (upload_id, field) do update
           set value = excluded.value, confidence = excluded.confidence,
               source_page = excluded.source_page, job_id = excluded.job_id,
               created_at = now()
         returning id`,
        [
          refs[0]!.uploadId,
          upload.application_id,
          job.user_id,
          field.field,
          field.value,
          field.confidence ?? null,
          field.sourcePage ?? null,
          job.id,
        ],
      );
      fieldIds.set(field.field, rows[0]!.id);
    }

    // A sent application's answers are what its pack was made from.
    const proposals = application.status === "draft" ? decision.proposals : [];

    if (proposals.length > 0) {
      const answers = structuredClone(application.answers ?? {});
      for (const proposal of proposals) setPath(answers, proposal.path, proposal.value);
      await client.query(`update public.applications set answers = $2 where id = $1`, [
        upload.application_id,
        JSON.stringify(answers),
      ]);

      for (const proposal of proposals) {
        // Never over a typed answer, even one typed after the decision above
        // was made: the condition is on the row as it is at write time.
        await client.query(
          `insert into public.answer_sources
             (application_id, user_id, path, source, document_field_id, confirmed_at, intake_version)
           values ($1, $2, $3, 'document', $4, null, $5)
           on conflict (application_id, path) do update
             set source = 'document', document_field_id = excluded.document_field_id,
                 confirmed_at = null, intake_version = excluded.intake_version
             where public.answer_sources.source <> 'applicant'`,
          [
            upload.application_id,
            job.user_id,
            proposal.path,
            fieldIds.get(proposal.path),
            INTAKE_VERSION,
          ],
        );
      }
    }

    await client.query("commit");
    return { recorded: decision.recorded.length, proposed: proposals.length };
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
};

/** The task types whose output is written back, and how. */
export const RESULT_WRITERS: Partial<Record<string, ResultWriter>> = {
  doc_field_extraction: applyExtraction,
};
