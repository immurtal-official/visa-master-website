import * as tus from "tus-js-client";
import { SUPABASE_URL } from "@/lib/supabase/config";

export const UPLOAD_BUCKET = "uploads";
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

/**
 * Send one file, in chunks, resuming if it is interrupted.
 *
 * A single POST is the wrong shape for this product. Half the traffic arrives
 * inside an in-app browser that is killed when the reader answers a message,
 * and mobile connections drop mid-transfer as a matter of course. A monolithic
 * upload that dies at 90% either fails outright or — worse — reports success
 * for a passport scan that never arrived.
 *
 * tus keeps the offset, so a resumed transfer continues rather than restarting,
 * and the browser stores the URL so a reload can pick the same upload back up.
 */
export interface UploadProgress {
  bytesSent: number;
  bytesTotal: number;
}

export async function uploadResumable({
  file,
  path,
  accessToken,
  onProgress,
  signal,
}: {
  file: File;
  path: string;
  accessToken: string;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 6000, 12000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      // Storage requires exactly this size, and it is what makes a resumed
      // upload line up with what the server already has.
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName: UPLOAD_BUCKET,
        objectName: path,
        contentType: file.type,
        cacheControl: "3600",
      },
      onProgress: (bytesSent, bytesTotal) => onProgress?.({ bytesSent, bytesTotal }),
      onSuccess: () => resolve(),
      onError: (error) => reject(error),
    });

    signal?.addEventListener("abort", () => {
      void upload.abort();
      reject(new DOMException("aborted", "AbortError"));
    });

    // Continue where a previous attempt stopped, rather than starting again.
    void upload.findPreviousUploads().then((previous) => {
      if (previous.length > 0 && previous[0]) upload.resumeFromPreviousUpload(previous[0]);
      upload.start();
    });
  });
}

/** Where a file lives. The first segment is the owner, which is what the storage policies compare. */
export function objectPath({
  userId,
  applicationId,
  uploadId,
  fileName,
}: {
  userId: string;
  applicationId: string;
  uploadId: string;
  fileName: string;
}): string {
  const extension = fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "bin";
  // The stored name is opaque: the applicant's own filename is frequently
  // Chinese, and it is kept as data rather than baked into a path.
  return `${userId}/${applicationId}/${uploadId}.${extension}`;
}
