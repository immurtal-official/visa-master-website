import type { Executor } from "@visa-master/executors/contract";

/**
 * Which executor runs which task.
 *
 * A pure function over the task type, so the routing decision is readable in
 * one place and testable without a database. The frontend and the schema never
 * learn which executor ran — that is the point of the adapter contract, and it
 * is what lets an executor be swapped for a better one later without touching
 * anything a user can see.
 */
export type ExecutorRegistry = Partial<Record<string, Executor>>;

export const TASK_ROUTES: Record<string, string> = {
  produce_pack: "hermes",
  qa_check: "hermes",
  intake_chat: "llm_gateway",
  doc_field_extraction: "llm_gateway",
  translation: "llm_gateway",
  itinerary_draft: "llm_gateway",
  custom_research: "custom_agent",
  // Runs inside the trusted zone and touches no model at all.
  requirements_check: "backend_code",
};

export function executorKindFor(taskType: string): string | null {
  return TASK_ROUTES[taskType] ?? null;
}

export function routeToExecutor(taskType: string, registry: ExecutorRegistry): Executor | null {
  const kind = executorKindFor(taskType);
  return kind ? (registry[kind] ?? null) : null;
}
