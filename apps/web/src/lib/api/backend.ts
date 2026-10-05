import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Where the backend is, and the credential it accepts (ADR-005).
 *
 * The backend is its own service, apps/api, and it takes a Bearer token and
 * nothing else. The web keeps its sign-in as cookies — that is the web's own
 * business — and this is the one place a request's cookie session becomes the
 * token the backend reads. Nothing here decides anything about the request.
 */
export const API_URL = (process.env.API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

/**
 * The access token of this request's session, refreshed if it has expired, or
 * null when nobody is signed in. Whether the token is any good is for the
 * backend to say.
 */
export async function accessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** A call to the backend, as this request's session. */
export async function callBackend(
  path: string,
  init: { method?: string; body?: BodyInit | null; contentType?: string | null } = {},
  token?: string | null,
): Promise<Response> {
  const bearer = token === undefined ? await accessToken() : token;
  const headers: Record<string, string> = { accept: "application/json" };
  if (bearer) headers.authorization = `Bearer ${bearer}`;
  if (init.contentType) headers["content-type"] = init.contentType;
  return fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body ?? null,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
}
