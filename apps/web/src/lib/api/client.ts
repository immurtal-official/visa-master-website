"use client";

import type { ValidationIssue } from "@visa-master/core";

/**
 * How the browser reaches the API.
 *
 * One wire protocol for every outcome, mirroring lib/api/http.ts: rule
 * failures arrive as issues (message keys the screen resolves against the
 * active locale), everything else as one error key. Nothing here interprets a
 * message — that is the screen's job, in the reader's language.
 */
export interface ApiOutcome<T = undefined> {
  ok: boolean;
  status: number;
  data?: T;
  issues?: ValidationIssue[];
  error?: { key: string } & Record<string, unknown>;
}

export async function api<T = undefined>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<ApiOutcome<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init?.method ?? "GET",
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    // The network failing is a thing to say, not a thing to swallow.
    return { ok: false, status: 0, error: { key: "errors.request" } };
  }

  if (response.status === 204) return { ok: true, status: 204 };

  const payload = (await response.json().catch(() => null)) as
    { issues?: ValidationIssue[]; error?: { key: string } } | T | null;

  if (!response.ok) {
    const failure = (payload ?? {}) as { issues?: ValidationIssue[]; error?: { key: string } };
    return {
      ok: false,
      status: response.status,
      issues: failure.issues,
      error: failure.error ?? (failure.issues ? undefined : { key: "errors.request" }),
    };
  }

  return { ok: true, status: response.status, data: payload as T };
}
