"use server";

import { revalidatePath } from "next/cache";
import type { Locale } from "next-intl";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { readSession } from "@/lib/supabase/session";

export interface UploadActionResult {
  ok: boolean;
  error?: "documents.uploadFailed" | "documents.confirmFailed" | "route.sessionExpired";
}

/**
 * Confirm that an announced upload really arrived.
 *
 * This is the only thing that makes a document count. The browser says it
 * finished; that is a claim, and this is the check — the object is looked up in
 * storage, its size recorded, and only then is the row marked stored. Without
 * it, a transfer that died at the last chunk would sit in the checklist looking
 * complete, and the first person to notice would be a reviewer.
 */
export async function confirmUpload(
  applicationId: string,
  uploadId: string,
  locale: Locale,
): Promise<UploadActionResult> {
  const supabase = await createClient();
  const session = await readSession(supabase);
  if (session.status !== "signed-in") return { ok: false, error: "route.sessionExpired" };

  const { data: upload } = await supabase
    .from("uploads")
    .select("id, storage_path, status")
    .eq("id", uploadId)
    .maybeSingle<{ id: string; storage_path: string; status: string }>();

  if (!upload) return { ok: false, error: "documents.confirmFailed" };

  // Ask storage whether the object exists, rather than believing the client.
  const folder = upload.storage_path.split("/").slice(0, -1).join("/");
  const fileName = upload.storage_path.split("/").pop()!;

  const { data: listed, error: listError } = await supabase.storage
    .from("uploads")
    .list(folder, { search: fileName });

  const object = listed?.find((entry) => entry.name === fileName);

  if (listError || !object) {
    console.error("confirmUpload: the object is not there", {
      uploadId,
      path: upload.storage_path,
      message: listError?.message,
    });
    return { ok: false, error: "documents.confirmFailed" };
  }

  // `status` is the server's word, so it is written with the server's
  // authority — a client cannot set it, by grant.
  const admin = createAdminClient();
  const { error } = await admin
    .from("uploads")
    .update({
      status: "stored",
      size_bytes: (object.metadata as { size?: number } | null)?.size ?? null,
    })
    .eq("id", uploadId);

  if (error) {
    console.error("confirmUpload: could not record it", { uploadId, code: error.code });
    return { ok: false, error: "documents.confirmFailed" };
  }

  revalidatePath(`/${locale}/applications/${applicationId}/documents`);
  return { ok: true };
}

/**
 * Remove a document.
 *
 * The object goes first. A row without an object is a document the reader
 * thinks they sent; an object without a row is a file nobody will ever delete,
 * and this one holds a passport scan.
 */
export async function removeUpload(
  applicationId: string,
  uploadId: string,
  locale: Locale,
): Promise<UploadActionResult> {
  const supabase = await createClient();
  const session = await readSession(supabase);
  if (session.status !== "signed-in") return { ok: false, error: "route.sessionExpired" };

  const { data: upload } = await supabase
    .from("uploads")
    .select("id, storage_path")
    .eq("id", uploadId)
    .maybeSingle<{ id: string; storage_path: string }>();

  if (!upload) return { ok: true };

  const { error: storageError } = await supabase.storage
    .from("uploads")
    .remove([upload.storage_path]);

  if (storageError) {
    console.error("removeUpload: could not delete the object", {
      uploadId,
      message: storageError.message,
    });
    return { ok: false, error: "documents.confirmFailed" };
  }

  await supabase.from("uploads").delete().eq("id", uploadId);

  revalidatePath(`/${locale}/applications/${applicationId}/documents`);
  return { ok: true };
}
