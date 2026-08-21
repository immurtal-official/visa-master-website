import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, assertSupabaseConfigured } from "./config";

/**
 * The browser client.
 *
 * It carries the publishable key, which is public by design: every request it
 * makes is subject to row-level security, so what it can reach is decided by
 * the policies rather than by the key.
 */
export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
