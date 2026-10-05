import {
  askedAnswers,
  documentCompleteness,
  documentsFor,
  extractableFields,
  type DocumentCompleteness,
  type RequiredDocument,
} from "@visa-master/core";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "./auth-service";
import { ServiceError } from "./errors";

/**
 * The applicant's own documents.
 *
 * The invariant everything here serves: nothing counts as uploaded on a
 * client's word. A row is announced before the bytes move (so an interrupted
 * transfer leaves something to resume rather than an orphaned object), the
 * bytes go straight to storage under the owner's prefix, and only after this
 * service has looked the object up does the row say `stored` — a column no
 * client can write, by grant.
 */

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

export interface UploadRow {
  id: string;
  document: string;
  page: number;
  original_name: string | null;
  status: "pending" | "stored" | "deleted";
}

export interface DocumentsView {
  applicationStatus: string;
  required: Pick<RequiredDocument, "id" | "necessity" | "multiPage">[];
  uploads: UploadRow[];
  completeness: DocumentCompleteness;
}

function extensionOf(fileName: string): string {
  return fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "bin";
}

/**
 * Ask for a confirmed document to be read, when extraction is switched on and
 * the document can fill in answers.
 *
 * Off unless DOCUMENT_EXTRACTION=on: reading a document will cost a model
 * call, and with nothing in the conductor to run it a queued job only fails.
 * The job carries the document by reference and the answer paths it may fill —
 * never a path or the account. Written with the server's authority, like every
 * enqueue, and once per upload: a re-upload is a new upload and is read again.
 *
 * A failure here is logged and swallowed. Reading is a convenience on top of
 * an upload that has already succeeded, and the applicant can type every
 * answer it would have proposed.
 */
async function enqueueExtraction(
  userId: string,
  upload: { id: string; document: string; page: number; content_type: string },
): Promise<void> {
  if (process.env.DOCUMENT_EXTRACTION !== "on") return;
  const fields = extractableFields(upload.document);
  if (fields.length === 0) return;

  const { error } = await createAdminClient()
    .from("jobs")
    .insert({
      user_id: userId,
      task_type: "doc_field_extraction",
      executor_kind: "llm_gateway",
      idempotency_key: `doc_field_extraction:upload:${upload.id}`,
      input: {
        documents: [
          {
            uploadId: upload.id,
            document: upload.document,
            page: upload.page,
            contentType: upload.content_type,
          },
        ],
        fields,
      },
      deadline_seconds: 300,
    });

  // 23505: already asked for — a repeated confirmation is not a second reading.
  if (error && error.code !== "23505") {
    console.error("uploads.confirm: could not ask for the document to be read", {
      uploadId: upload.id,
      code: error.code,
    });
  }
}

export const uploadService = {
  /** Everything the checklist needs, computed from the rules and the rows. */
  async listForApplication(applicationId: string): Promise<DocumentsView> {
    const { supabase } = await requireUser();

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, answers, status")
      .eq("id", applicationId)
      .maybeSingle<{ id: string; answers: Record<string, unknown>; status: string }>();

    if (appError) throw new ServiceError("dashboard.loadFailed.title", 502);
    if (!application) throw new ServiceError("errors.notFound.title", 404);

    const { data: uploads, error } = await supabase
      .from("uploads")
      .select("id, document, page, original_name, status")
      .eq("application_id", applicationId)
      .order("page")
      .returns<UploadRow[]>();

    if (error) {
      console.error("uploads.list: failed", { code: error.code });
      throw new ServiceError("dashboard.loadFailed.title", 502);
    }

    // Only what is asked decides the checklist: an answer left in a branch the
    // applicant closed must not keep a document on it.
    const answers = askedAnswers(application.answers ?? {});
    const rows = uploads ?? [];

    return {
      applicationStatus: application.status,
      required: documentsFor(answers).map(({ id, necessity, multiPage }) => ({
        id,
        necessity,
        multiPage,
      })),
      uploads: rows,
      completeness: documentCompleteness(answers, rows),
    };
  },

  /**
   * Announce an upload: create the row, hand back where the bytes go.
   *
   * The path's first segment is the owner's user id — that is what the storage
   * policies compare, so ownership is a prefix rather than a lookup.
   */
  async announce(
    applicationId: string,
    input: { document?: unknown; fileName?: unknown; contentType?: unknown; page?: unknown },
  ): Promise<{ uploadId: string; storagePath: string }> {
    const documentId = String(input.document ?? "");
    const fileName = String(input.fileName ?? "");
    const contentType = String(input.contentType ?? "");
    const page = Number(input.page ?? 1);

    if (!ACCEPTED_TYPES.has(contentType)) throw new ServiceError("documents.wrongType", 422);

    const { userId, supabase } = await requireUser();

    const uploadId = crypto.randomUUID();
    const storagePath = `${userId}/${applicationId}/${uploadId}.${extensionOf(fileName)}`;

    const { error } = await supabase.from("uploads").insert({
      id: uploadId,
      application_id: applicationId,
      user_id: userId,
      document: documentId,
      page,
      storage_path: storagePath,
      content_type: contentType,
      original_name: fileName,
    });

    if (error) {
      console.error("uploads.announce: insert failed", { code: error.code });
      throw new ServiceError("documents.uploadFailed", 502);
    }

    return { uploadId, storagePath };
  },

  /**
   * Confirm an announced upload really arrived. The object is looked up in
   * storage — the browser saying the transfer finished is a claim, not a fact.
   */
  async confirm(applicationId: string, uploadId: string): Promise<void> {
    const { userId, supabase } = await requireUser();

    const { data: upload } = await supabase
      .from("uploads")
      .select("id, storage_path, application_id, document, page, content_type")
      .eq("id", uploadId)
      .maybeSingle<{
        id: string;
        storage_path: string;
        application_id: string;
        document: string;
        page: number;
        content_type: string;
      }>();

    if (!upload || upload.application_id !== applicationId) {
      throw new ServiceError("documents.confirmFailed", 404);
    }

    const folder = upload.storage_path.split("/").slice(0, -1).join("/");
    const fileName = upload.storage_path.split("/").pop()!;

    const { data: listed, error: listError } = await supabase.storage
      .from("uploads")
      .list(folder, { search: fileName });

    const object = listed?.find((entry) => entry.name === fileName);

    if (listError || !object) {
      console.error("uploads.confirm: object not found", {
        uploadId,
        message: listError?.message,
      });
      throw new ServiceError("documents.confirmFailed", 409);
    }

    // `stored` is the server's word, written with the server's authority.
    const admin = createAdminClient();
    const { error } = await admin
      .from("uploads")
      .update({
        status: "stored",
        size_bytes: (object.metadata as { size?: number } | null)?.size ?? null,
      })
      .eq("id", uploadId);

    if (error) {
      console.error("uploads.confirm: could not record", { uploadId, code: error.code });
      throw new ServiceError("documents.confirmFailed", 502);
    }

    await enqueueExtraction(userId, upload);
  },

  /**
   * Remove a document. The object goes first: a row without an object is a
   * document the reader thinks they sent; an object without a row is a file
   * nobody will ever delete, and this one holds a passport scan.
   */
  async remove(applicationId: string, uploadId: string): Promise<void> {
    const { supabase } = await requireUser();

    const { data: upload } = await supabase
      .from("uploads")
      .select("id, storage_path, application_id")
      .eq("id", uploadId)
      .maybeSingle<{ id: string; storage_path: string; application_id: string }>();

    if (!upload || upload.application_id !== applicationId) return;

    const { error: storageError } = await supabase.storage
      .from("uploads")
      .remove([upload.storage_path]);

    if (storageError) {
      console.error("uploads.remove: could not delete object", {
        uploadId,
        message: storageError.message,
      });
      throw new ServiceError("documents.confirmFailed", 502);
    }

    await supabase.from("uploads").delete().eq("id", uploadId);
  },
};
