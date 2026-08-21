import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Where a finished run's files go.
 *
 * The conductor uploads with its own credential after the run — the job
 * container never holds one, which is the point: an agent that has been taken
 * over cannot reach the bucket, because it never could.
 */
export interface ArtifactStore {
  put(path: string, content: Buffer): Promise<void>;
}

const BUCKET = "artifacts";

export function createSupabaseArtifactStore(url: string, secretKey: string): ArtifactStore {
  const client: SupabaseClient = createClient(url, secretKey, {
    auth: { persistSession: false },
  });

  return {
    async put(path: string, content: Buffer): Promise<void> {
      const { error } = await client.storage.from(BUCKET).upload(path, content, {
        contentType: path.endsWith(".json") ? "application/json" : "application/octet-stream",
        upsert: true,
      });
      if (error) throw new Error(`artifact upload failed for ${path}: ${error.message}`);
    },
  };
}
