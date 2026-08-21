/**
 * Whether an authentication backend is configured.
 *
 * The app has to build and run with no Supabase project at all: the schema and
 * the screens are worth reviewing before anyone pays for hosting, and a
 * repository that only starts once someone has provisioned a cloud project is
 * a repository nobody can pick up. When these are absent the site stays fully
 * browsable and the sign-in screen says so plainly, rather than crashing or —
 * worse — pretending to work against invented credentials.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;
}

/** Guard for the client factories: reaching one unconfigured is a bug, not a state. */
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in apps/web/.env.local " +
        "(pnpm db:start prints both). Callers should check isSupabaseConfigured() first.",
    );
  }
}
