const SUPABASE_API = "http://127.0.0.1:54321";
const MAILPIT_API = "http://127.0.0.1:54324";

/**
 * Fail early, and say what to do.
 *
 * These tests sign a real user in against the local stack and read the code out
 * of the local mail catcher. Without either running, every spec fails on a
 * timeout that says nothing useful.
 */
export default async function globalSetup() {
  for (const [name, url, remedy] of [
    ["Supabase", `${SUPABASE_API}/auth/v1/health`, "pnpm db:start"],
    ["Mailpit", `${MAILPIT_API}/api/v1/info`, "pnpm db:start"],
  ] as const) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status}`);
    } catch {
      throw new Error(
        `${name} is not reachable at ${url}. Start the local stack first: ${remedy}` +
          " (Docker must be running).",
      );
    }
  }
}
