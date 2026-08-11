import { expect, test } from "@playwright/test";
import zh from "../messages/zh-CN.json" with { type: "json" };
import en from "../messages/en.json" with { type: "json" };
import { readSignInCode, uniqueEmail } from "./support/mailpit";

/** Sign in, so the application can be created against a real account. */
async function signIn(page: import("@playwright/test").Page, prefix: string, messages: typeof en) {
  const email = uniqueEmail("route");
  await page.goto(`${prefix}/login`);
  await page.getByLabel(messages.auth.login.emailLabel).fill(email);
  await page.getByRole("button", { name: messages.auth.login.submit }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.auth.otp.title);
  await page.getByLabel(messages.auth.otp.codeLabel).fill(await readSignInCode(email));
  await page.getByRole("button", { name: messages.auth.otp.submit }).click();
  await expect(page).toHaveURL(new RegExp(`${prefix}/dashboard`));
  return email;
}

test("the served route creates an application that appears on the dashboard", async ({ page }) => {
  await signIn(page, "/en", en);

  await page.getByRole("link", { name: en.application.newCta }).click();
  await expect(page).toHaveURL(/\/en\/start/);

  await page.getByLabel(en.route.area.sichuan, { exact: true }).check();
  await page.getByLabel("Spain", { exact: true }).check();
  await page.getByLabel(en.route.purpose.tourism).check();
  await page.getByLabel(en.route.employment.employed, { exact: true }).check();
  await page.getByRole("button", { name: en.route.submit }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.route.supported.title);
  await page.getByRole("button", { name: en.route.supported.cta }).click();

  // Back on the dashboard, the application is listed with what it is waiting on.
  await expect(page).toHaveURL(/\/en\/dashboard/);
  await expect(page.getByText(en.application.nextStep.draft)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Spain/ })).toBeVisible();
  await expect(page.getByText(en.dashboard.empty.title)).toHaveCount(0);
});

test("an unserved route is refused with its reasons and offers the waiting list", async ({
  page,
}) => {
  await page.goto("/en/start");

  await page.getByLabel(en.route.area.other, { exact: true }).check();
  await page.getByLabel("France", { exact: true }).check();
  await page.getByLabel(en.route.purpose.business).check();
  await page.getByLabel(en.route.employment.student, { exact: true }).check();
  await page.getByRole("button", { name: en.route.submit }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.route.unsupported.title);

  // Every failing part, not just the first.
  for (const reason of Object.values(en.route.unsupported.reason)) {
    await expect(page.getByText(reason)).toBeVisible();
  }

  await page.getByRole("button", { name: en.route.unsupported.waitlistCta }).click();
  await expect(page.getByText(en.route.unsupported.waitlistDone)).toBeVisible();
});

test("an unanswered question is reported as unanswered, in Chinese", async ({ page }) => {
  await page.goto("/zh/start");
  await page.getByRole("button", { name: zh.route.submit }).click();

  await expect(page.getByText(zh.errorSummary.title)).toBeVisible();
  // Four questions, four times the same instruction — from the message key the
  // rule emitted, not from anything the screen decided.
  await expect(page.getByText(zh.validation.required)).toHaveCount(8);
});

test("the route check is readable without signing in", async ({ page }) => {
  await page.goto("/zh/start");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(zh.route.title);
  await expect(page.getByText(zh.route.areaHint)).toBeVisible();
});
