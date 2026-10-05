import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Pool } from "pg";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The applicant's documents, put where the job can read them.
 *
 * The job's input names its documents by upload id and nothing else: a storage
 * path begins with the owner's user id, and the input never carries the
 * account. Resolving an id to the bytes is done here, by the conductor, with
 * its own credential — the container never holds one, so an agent that has
 * been taken over still cannot reach the bucket, or any document but the ones
 * staged for it.
 *
 * Each id is resolved against the job's owner and against `stored`, so an id
 * that names somebody else's upload, or one the server has not confirmed,
 * stages nothing. The files land in `documents/` inside the scratch, beside a
 * `documents.json` that says which file is which checklist item and page —
 * and, like the input, carries no path and no account.
 */

/** Where uploaded documents are read from. */
export interface DocumentStore {
  get(storagePath: string): Promise<Buffer>;
}

const BUCKET = "uploads";

export function createSupabaseDocumentStore(url: string, secretKey: string): DocumentStore {
  const client: SupabaseClient = createClient(url, secretKey, {
    auth: { persistSession: false },
  });

  return {
    async get(storagePath: string): Promise<Buffer> {
      const { data, error } = await client.storage.from(BUCKET).download(storagePath);
      if (error || !data) throw new DocumentUnavailable("the document could not be downloaded");
      return Buffer.from(await data.arrayBuffer());
    },
  };
}

/** One document page as the job's input names it. */
export interface JobDocumentRef {
  uploadId: string;
  document: string;
  page: number;
  contentType: string;
}

/** One document page as staged, as `documents.json` lists it. */
export interface StagedDocument {
  uploadId: string;
  document: string;
  page: number;
  contentType: string;
  /** Relative to the job directory, e.g. `documents/passportBio-1.jpg`. */
  file: string;
}

/**
 * Raised when the documents a job names cannot all be staged. Its message is
 * written to jobs.error, which the applicant's session can read, so it never
 * carries a path, an id or a fragment of a file.
 */
export class DocumentUnavailable extends Error {
  override name = "DocumentUnavailable";
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_NAME = /^[A-Za-z][A-Za-z0-9]*$/;

/** The document references in a job's input; none when it names none. */
export function documentRefs(input: unknown): JobDocumentRef[] {
  const documents = (input as { documents?: unknown } | null)?.documents;
  if (documents === undefined) return [];
  if (!Array.isArray(documents))
    throw new DocumentUnavailable("the input's documents are malformed");

  return documents.map((entry) => {
    const ref = entry as Partial<JobDocumentRef>;
    // The document name becomes part of a file name, so it is held to what a
    // checklist id can be: nothing in it can climb out of the directory.
    if (
      typeof ref.uploadId !== "string" ||
      !UUID.test(ref.uploadId) ||
      typeof ref.document !== "string" ||
      !SAFE_NAME.test(ref.document) ||
      !Number.isInteger(ref.page) ||
      (ref.page as number) < 1 ||
      typeof ref.contentType !== "string"
    ) {
      throw new DocumentUnavailable("the input's documents are malformed");
    }
    return {
      uploadId: ref.uploadId,
      document: ref.document,
      page: ref.page as number,
      contentType: ref.contentType,
    };
  });
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

function extensionFor(contentType: string): string {
  return EXTENSIONS[contentType] ?? "bin";
}

/**
 * Download the job's documents into `<scratchDir>/documents/` and write the
 * manifest. Every named document is staged, or none is: a pack made from half
 * the documents is worse than a job that waits for the rest.
 */
export async function stageDocuments(
  pool: Pool,
  job: { user_id: string; input: unknown },
  scratchDir: string,
  store: DocumentStore | null,
): Promise<StagedDocument[]> {
  const refs = documentRefs(job.input);
  if (refs.length === 0) return [];
  if (!store) throw new DocumentUnavailable("no document store is configured");

  const { rows } = await pool.query<{ id: string; storage_path: string }>(
    `select id, storage_path from public.uploads
     where id = any($1::uuid[]) and user_id = $2 and status = 'stored'`,
    [refs.map((ref) => ref.uploadId), job.user_id],
  );
  const pathById = new Map(rows.map((row) => [row.id, row.storage_path]));

  const missing = refs.filter((ref) => !pathById.has(ref.uploadId)).length;
  if (missing > 0) {
    throw new DocumentUnavailable(`${missing} of ${refs.length} documents are not available`);
  }

  const directory = join(scratchDir, "documents");
  await mkdir(directory, { recursive: true });

  const staged: StagedDocument[] = [];
  for (const ref of refs) {
    const file = `documents/${ref.document}-${ref.page}.${extensionFor(ref.contentType)}`;
    const bytes = await store.get(pathById.get(ref.uploadId)!);
    await writeFile(join(scratchDir, file), bytes);
    staged.push({ ...ref, file });
  }

  await writeFile(join(scratchDir, "documents.json"), JSON.stringify(staged, null, 2));
  return staged;
}
