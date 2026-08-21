import { NextResponse } from "next/server";
import { ServiceError, ValidationFailure } from "@/lib/services/errors";

/**
 * The HTTP adapter, shared by every /api/v1 route handler.
 *
 * A handler is request parsing, one service call, and this mapping — nothing
 * else. The wire protocol carries catalogue keys, never sentences, so every
 * client (web, a future app, a future mini program) resolves messages against
 * its own active locale, the same way validation has worked since the first
 * schema:
 *
 *   422 (rule failures)    { issues: [{ path, key, params? }] }
 *   other failures         { error: { key, ...extra } }
 *   success                the endpoint's own shape, or 204
 */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ValidationFailure) {
      return NextResponse.json({ issues: error.issues }, { status: 422 });
    }
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { error: { key: error.key, ...error.extra } },
        { status: error.status },
      );
    }
    console.error("api: unexpected failure", error);
    return NextResponse.json({ error: { key: "errors.request" } }, { status: 500 });
  }
}

export function json(data: unknown, status = 200): Response {
  return NextResponse.json(data, { status });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

/** Parse a JSON body, tolerating an empty one. */
export async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const parsed = (await request.json()) as unknown;
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
