import "server-only";
import { callBackend } from "./backend";

/**
 * How a server component reaches the API.
 *
 * Server components render data but do not own it: core business data comes
 * through the same /api/v1 contract every other client uses, so the web UI
 * cannot quietly grow a private channel the mobile app does not have. They
 * call the backend directly, as this request's session — the same credential
 * the forwarder in app/api/v1 attaches for the browser.
 */
export interface ApiResult<T> {
  status: number;
  data: T | null;
  error: { key: string } | null;
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await callBackend(path);
  } catch {
    return { status: 503, data: null, error: { key: "errors.request" } };
  }

  if (response.status === 204) return { status: 204, data: null, error: null };

  const payload = (await response.json().catch(() => null)) as
    (T & { error?: { key: string } }) | null;

  if (!response.ok) {
    return {
      status: response.status,
      data: null,
      error: payload?.error ?? { key: "errors.request" },
    };
  }
  return { status: response.status, data: payload as T, error: null };
}
