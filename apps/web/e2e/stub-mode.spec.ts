import { expect, test } from "@playwright/test";
import zh from "../messages/zh-CN.json" with { type: "json" };

/**
 * The app with no authentication configured.
 *
 * This is how the repository runs before anyone has provisioned a project, so
 * it has to keep working: the site stays browsable, and the sign-in screen says
 * plainly that sign-in is unavailable rather than crashing or pretending.
 */
test("the site is browsable without any authentication configuration", async ({ page }) => {
  await page.goto("/zh");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(zh.landing.intro);
  await expect(page.getByText(zh.chrome.footer.disclaimer)).toBeVisible();
});

test("the sign-in screen says sign-in is unavailable", async ({ page }) => {
  await page.goto("/zh/login");

  await expect(page.getByText(zh.auth.notConfigured)).toBeVisible();
  await expect(page.getByLabel(zh.auth.login.emailLabel)).toHaveCount(0);
});

test("the dashboard sends the reader to sign in rather than failing", async ({ page }) => {
  await page.goto("/zh/dashboard");
  await expect(page).toHaveURL(/\/zh\/login/);
});
