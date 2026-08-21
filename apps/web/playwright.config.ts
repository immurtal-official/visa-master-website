import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against the local stack.
 *
 * Two servers, because two of the things worth proving are mutually exclusive
 * configurations: the app signed into a real Supabase project, and the app with
 * no authentication configured at all. The second is not a curiosity — it is
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
        SUPABASE_SECRET_KEY: "",
        NEXT_DIST_DIR: ".next-stub",
      },
    },
  ],
});
