import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Pool } from "pg";
import {
  DocumentUnavailable,
  createSupabaseDocumentStore,
  documentRefs,
  stageDocuments,
  type DocumentStore,
} from "./documents";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const pool = new Pool({ connectionString: DATABASE_URL, max: 4 });

afterAll(async () => {
  await pool.end();
});

/** A store over a map, recording what was asked of it. */
function memoryStore(objects: Record<string, string>): DocumentStore & { asked: string[] } {
  const asked: string[] = [];
  return {
    asked,
    async get(path: string) {
      asked.push(path);
      if (!(path in objects)) throw new DocumentUnavailable("not there");
      return Buffer.from(objects[path]!);
    },
  };
}

let owner: string;
let stranger: string;
let scratch: string;
const uploads: Record<string, { id: string; path: string }> = {};

async function user(): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into auth.users (id, email, instance_id)
     values (gen_random_uuid(), 'docs-' || gen_random_uuid() || '@test.local',
             '00000000-0000-0000-0000-000000000000')
     returning id`,
  );
  return rows[0]!.id;
}

async function upload(userId: string, document: string, page: number, status: string) {
  const { rows } = await pool.query<{ id: string; storage_path: string }>(
    `with app as (
       insert into public.applications (user_id, residence_area, destination)
       values ($1::uuid, 'sichuan', 'ES') returning id
     )
     insert into public.uploads (application_id, user_id, document, page, storage_path, content_type, status)
     select app.id, $1::uuid, $2::text, $3::smallint,
            $1::text || '/' || app.id || '/' || $2::text || '-' || $3::text || '.jpg', 'image/jpeg', $4::text
     from app
     returning id, storage_path`,
    [userId, document, page, status],
  );
  return { id: rows[0]!.id, path: rows[0]!.storage_path };
}

const ref = (key: string, document: string, page = 1) => ({
  uploadId: uploads[key]!.id,
  document,
  page,
  contentType: "image/jpeg",
});

beforeEach(async () => {
  // Only this suite's own rows; cascades take their applications and uploads.
  await pool.query(`delete from auth.users where email like 'docs-%@test.local'`);
  owner = await user();
  stranger = await user();
  uploads.passport = await upload(owner, "passportBio", 1, "stored");
  uploads.bank2 = await upload(owner, "bankStatement", 2, "stored");
  uploads.pending = await upload(owner, "photo", 1, "pending");
  uploads.theirs = await upload(stranger, "passportBio", 1, "stored");
  scratch = await mkdtemp(join(tmpdir(), "vm-docs-test-"));
});

describe("the documents a job names", () => {
  it("are none when the input names none", () => {
    expect(documentRefs({ route: {} })).toEqual([]);
    expect(documentRefs(null)).toEqual([]);
  });

  it("are refused when malformed, including a name that could leave the directory", () => {
    const good = {
      uploadId: "00000000-0000-0000-0000-000000000000",
      document: "photo",
      page: 1,
      contentType: "image/jpeg",
    };
    expect(() => documentRefs({ documents: "x" })).toThrow(DocumentUnavailable);
    expect(() => documentRefs({ documents: [{ ...good, document: "../../etc" }] })).toThrow(
      DocumentUnavailable,
    );
    expect(() => documentRefs({ documents: [{ ...good, uploadId: "x" }] })).toThrow(
      DocumentUnavailable,
    );
    expect(() => documentRefs({ documents: [{ ...good, page: 0 }] })).toThrow(DocumentUnavailable);
  });
});

describe("staging a job's documents", () => {
  it("writes each one into the scratch, with a manifest that carries no path and no account", async () => {
    const store = memoryStore({
      [uploads.passport!.path]: "PASSPORT",
      [uploads.bank2!.path]: "BANK",
    });
    const staged = await stageDocuments(
      pool,
      {
        user_id: owner,
        input: { documents: [ref("passport", "passportBio"), ref("bank2", "bankStatement", 2)] },
      },
      scratch,
      store,
    );

    expect(staged.map((d) => d.file)).toEqual([
      "documents/passportBio-1.jpg",
      "documents/bankStatement-2.jpg",
    ]);
    expect(await readFile(join(scratch, "documents/passportBio-1.jpg"), "utf8")).toBe("PASSPORT");
    expect(await readFile(join(scratch, "documents/bankStatement-2.jpg"), "utf8")).toBe("BANK");

    const manifest = await readFile(join(scratch, "documents.json"), "utf8");
    expect(JSON.parse(manifest)).toEqual(staged);
    expect(manifest).not.toContain(owner);
    expect(manifest).not.toContain(uploads.passport!.path);
  });

  it("stages nothing for an upload the server has not confirmed", async () => {
    const store = memoryStore({ [uploads.pending!.path]: "PHOTO" });
    await expect(
      stageDocuments(
        pool,
        { user_id: owner, input: { documents: [ref("pending", "photo")] } },
        scratch,
        store,
      ),
    ).rejects.toThrow(DocumentUnavailable);
    expect(store.asked).toEqual([]);
  });

  it("stages nothing for somebody else's upload, whatever the input says", async () => {
    const store = memoryStore({ [uploads.theirs!.path]: "THEIRS" });
    await expect(
      stageDocuments(
        pool,
        {
          user_id: owner,
          input: { documents: [ref("passport", "passportBio"), ref("theirs", "passportBio")] },
        },
        scratch,
        store,
      ),
    ).rejects.toThrow("1 of 2 documents are not available");
    // Nothing was read at all: every document or none.
    expect(store.asked).toEqual([]);
    expect(await readdir(scratch)).toEqual([]);
  });

  it("needs a store only when there is something to stage", async () => {
    expect(await stageDocuments(pool, { user_id: owner, input: {} }, scratch, null)).toEqual([]);
    await expect(
      stageDocuments(
        pool,
        { user_id: owner, input: { documents: [ref("passport", "passportBio")] } },
        scratch,
        null,
      ),
    ).rejects.toThrow(DocumentUnavailable);
  });
});

// Against the real bucket, when the local stack's secret key is provided.
// Reported as skipped otherwise — never silently passed.
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const SECRET = process.env.SUPABASE_SECRET_KEY;

describe("the Supabase document store", () => {
  it.skipIf(!SECRET)("reads back an object from the uploads bucket", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(SUPABASE_URL, SECRET!, { auth: { persistSession: false } });
    const path = `${owner}/conductor-test/${Date.now()}.pdf`;
    const { error } = await admin.storage
      .from("uploads")
      .upload(path, Buffer.from("%PDF-1.4 test"), { contentType: "application/pdf" });
    expect(error).toBeNull();

    try {
      const bytes = await createSupabaseDocumentStore(SUPABASE_URL, SECRET!).get(path);
      expect(bytes.toString()).toBe("%PDF-1.4 test");
      await expect(
        createSupabaseDocumentStore(SUPABASE_URL, SECRET!).get(`${path}.missing`),
      ).rejects.toThrow(DocumentUnavailable);
    } finally {
      await admin.storage.from("uploads").remove([path]);
    }
  });
});

afterEach(async () => {
  if (scratch) await rm(scratch, { recursive: true, force: true });
});
