import { cookies, headers } from "next/headers";

/**
 * How a server component reaches the API.
 *
 * Server components render data but do not own it: core business data comes
 * through the same /api/v1 contract every other client uses, so the web UI
 * cannot quietly grow a private channel the mobile app and the mini program
 * do not have. The cost is one loopback HTTP hop per read; the payment is a
 * contract that stays honest because its first consumer is ourselves.
 */
export interface ApiResult<T> {
  status: number;
  data: T | null;
  error: { key: string } | null;
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const host = headerStore.get("host") ?? "127.0.0.1:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  const response = await fetch(`${protocol}://${host}${path}`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

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
