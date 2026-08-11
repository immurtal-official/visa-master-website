import { expect, test } from "@playwright/test";
import zh from "../messages/zh-CN.json" with { type: "json" };
import en from "../messages/en.json" with { type: "json" };
import { expectCodeNotLink, readSignInCode, uniqueEmail } from "./support/mailpit";

const LOCALES = [
  { prefix: "/zh", messages: zh },
  { prefix: "/en", messages: en },
] as const;

/** ICU interpolation, resolved the way the page resolves it. */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => values[name] ?? "");
}

for (const { prefix, messages } of LOCALES) {
  test(`${prefix}: a new visitor signs in with an emailed code and signs out`, async ({ page }) => {
    const email = uniqueEmail();

    await page.goto(`${prefix}/login`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.auth.login.title);

    await page.getByLabel(messages.auth.login.emailLabel).fill(email);
    await page.getByRole("button", { name: messages.auth.login.submit }).click();

    // The code step names the address it sent to, so a typo is visible before
    // the reader goes looking in the wrong mailbox.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.auth.otp.title);
    await expect(page.getByText(fill(messages.auth.otp.sentTo, { email }))).toBeVisible();

    await expectCodeNotLink(email);
    const code = await readSignInCode(email);

    await page.getByLabel(messages.auth.otp.codeLabel).fill(code);
    await page.getByRole("button", { name: messages.auth.otp.submit }).click();

    // Reaching the dashboard means the session cookie survived the redirect and
    // the profile read passed row-level security as the signed-in user.
    await expect(page).toHaveURL(new RegExp(`${prefix}/dashboard`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.dashboard.title);
    await expect(page.getByText(fill(messages.dashboard.signedInAs, { email }))).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(
      messages.dashboard.empty.title,
    );

    await page.getByRole("button", { name: messages.auth.signOut }).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/login`));

    // And the session is really gone, not just navigated away from.
    await page.goto(`${prefix}/dashboard`);
    await expect(page).toHaveURL(new RegExp(`${prefix}/login`));
  });
}

test("a signed-out visitor cannot reach the dashboard", async ({ page }) => {
  await page.goto("/zh/dashboard");
  await expect(page).toHaveURL(/\/zh\/login/);
});

test("a wrong code is refused, and the address is not lost", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/en/login");
  await page.getByLabel(en.auth.login.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.login.submit }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.auth.otp.title);

  await page.getByLabel(en.auth.otp.codeLabel).fill("000000");
  await page.getByRole("button", { name: en.auth.otp.submit }).click();

  await expect(page.getByText(en.auth.otp.failed)).toBeVisible();
  // Still on the code step, still working with the same address: a failed
  // attempt must not send the reader back to the beginning.
  await expect(page.getByText(fill(en.auth.otp.sentTo, { email }))).toBeVisible();
});

test("a malformed code is caught by the shared rule, not by the service", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/en/login");
  await page.getByLabel(en.auth.login.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.login.submit }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.auth.otp.title);

  await page.getByLabel(en.auth.otp.codeLabel).fill("12");
  await page.getByRole("button", { name: en.auth.otp.submit }).click();

  // The message comes from the message key the rule emitted, resolved against
  // this locale — the rule itself never produced a sentence.
  await expect(page.getByText(en.validation.otp.invalidFormat).first()).toBeVisible();
  await expect(page.getByText(en.errorSummary.title)).toBeVisible();
});

test("an address the browser accepts can still be refused by the shared rule", async ({ page }) => {
  await page.goto("/zh/login");

  // A browser's own email check passes anything with an @ in it; the shared
  // rule wants a real domain. This is the case that proves the rule runs at
  // all, rather than the field type doing the work.
  await page.getByLabel(zh.auth.login.emailLabel).fill("someone@localhost");
  await page.getByRole("button", { name: zh.auth.login.submit }).click();

  await expect(page.getByText(zh.validation.email.invalid).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(zh.auth.login.title);
});
