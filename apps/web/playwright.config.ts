import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against the local stack.
 *
 * Three servers: the backend, and two web servers, because two of the things
 * worth proving are mutually exclusive configurations: the app signed into a
 * real Supabase project, and the app with no authentication configured at all. The second is not a curiosity — it is
 * how the repository builds and runs before anyone has provisioned anything,
 * so it has to keep working.
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  /**
   * One retry, for one known cause.
   *
   * The token is stamped by the auth container and validated by the REST one,
   * and PostgREST rejects any `iat` in its own future with PGRST303 — so a few
   * hundred milliseconds of drift between two Docker containers fails a request
   * made immediately after signing in. There is no leeway setting to widen, and
   * putting a retry into the product to paper over a local clock would be the
   * wrong place for it. A retried test is still reported as flaky, so this
   * hides nothing.
   */
  retries: 1,
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /stub-mode\.spec\.ts/,
    },
    {
      // The unconfigured app, served separately on its own port.
      name: "stub",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3100" },
      testMatch: /stub-mode\.spec\.ts/,
    },
  ],

  webServer: [
    {
      // The backend (ADR-005). The web forwards /api/v1 to it. Configured from
      // the environment, then apps/api/.env; the Supabase values default to
      // the ones the web is given, which is the same local project.
      command: "bash scripts/py.sh uvicorn app.main:app --port 8000",
      cwd: "../api",
      url: "http://127.0.0.1:8000/api/v1/health",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        DATABASE_URL:
          process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        ...(process.env.NEXT_PUBLIC_SUPABASE_URL
          ? { SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL }
          : {}),
        ...(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          ? { SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }
          : {}),
        DOCUMENT_EXTRACTION: process.env.DOCUMENT_EXTRACTION ?? "off",
      },
    },
    {
      command: "pnpm dev --port 3000",
      url: "http://127.0.0.1:3000/zh",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm dev --port 3100",
      url: "http://127.0.0.1:3100/zh",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      // Emptied rather than absent: this is the no-Supabase configuration.
      // Its own build directory, because Next allows one dev server per one.
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
        NEXT_DIST_DIR: ".next-stub",
      },
    },
  ],
});
