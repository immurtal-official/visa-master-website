import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import en from "../messages/en.json" with { type: "json" };
import { clearInbox, readSignInCode, uniqueEmail } from "./support/mailpit";

/**
 * A session whose account no longer exists.
 *
 * This is not a hypothetical: resetting the local database while a browser held
 * a session produced exactly it, and the product looked fine — it greeted the
 * deleted user by name, showed an empty application list, and quietly refused
 * every attempt to create one. The token stays cryptographically valid until it
 * expires, so a signature check alone cannot tell the difference. Only asking
 * the auth service can.
 *
 * The same shape covers a suspended account, which is the reason the check has
 * to stay: an operator revoking access must take effect now, not in an hour.
 */
function deleteUser(email: string): void {
  execFileSync("docker", [
    "exec",
    "supabase_db_db",
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-c",
    `delete from auth.users where email = '${email}'`,
  ]);
}

test("a session outliving its account is treated as signed out", async ({ page }) => {
  const email = uniqueEmail("stale");

  await clearInbox(email);
  await page.goto("/en/login");
  await page.getByLabel(en.auth.login.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.login.submit }).click();
  await page.getByLabel(en.auth.otp.codeLabel).fill(await readSignInCode(email));
  await page.getByRole("button", { name: en.auth.otp.submit }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);

  deleteUser(email);

  // The cookie is still there and still verifies. The account is not.
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/en\/login/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.auth.login.title);
});

test("a failed creation says so instead of showing an empty dashboard", async ({ page }) => {
  const email = uniqueEmail("stale-create");

  await clearInbox(email);
  await page.goto("/en/login");
  await page.getByLabel(en.auth.login.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.login.submit }).click();
  await page.getByLabel(en.auth.otp.codeLabel).fill(await readSignInCode(email));
  await page.getByRole("button", { name: en.auth.otp.submit }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);

  // Reach the supported-route card first, then remove the account underneath it,
  // so the create is attempted with a session that can no longer own anything.
  await page.goto("/en/start");
  await page.getByLabel(en.route.area.sichuan, { exact: true }).check();
  await page.getByLabel("Spain", { exact: true }).check();
  await page.getByLabel(en.route.purpose.tourism).check();
  await page.getByLabel(en.route.employment.employed, { exact: true }).check();
  await page.getByRole("button", { name: en.route.submit }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.route.supported.title);

  deleteUser(email);

  await page.getByRole("button", { name: en.route.supported.cta }).click();

  // Whatever the outcome, it must not be a dashboard implying the account is
  // simply empty. Either the failure is stated, or the reader is asked to sign
  // in again — both are honest; silence is not.
  await expect
    .poll(async () => {
      if (/\/en\/login/.test(page.url())) return "sign-in";
      if (
        await page
          .getByText(en.route.createFailed)
          .isVisible()
          .catch(() => false)
      )
        return "told";
      if (
        await page
          .getByText(en.dashboard.empty.title)
          .isVisible()
          .catch(() => false)
      )
        return "silent";
      return "pending";
    })
    .not.toBe("silent");
});
