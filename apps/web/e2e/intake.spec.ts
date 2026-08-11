import { expect, test, type Page } from "@playwright/test";
import en from "../messages/en.json" with { type: "json" };
import { clearInbox, readSignInCode, uniqueEmail } from "./support/mailpit";

async function signIn(page: Page, email: string): Promise<void> {
  await clearInbox(email);
  await page.goto("/en/login");
  await page.getByLabel(en.auth.login.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.login.submit }).click();
  await page.getByLabel(en.auth.otp.codeLabel).fill(await readSignInCode(email));
  await page.getByRole("button", { name: en.auth.otp.submit }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);
}

async function createApplication(page: Page): Promise<void> {
  await page.goto("/en/start");
  await page.getByLabel(en.route.area.sichuan, { exact: true }).check();
  await page.getByLabel("Spain", { exact: true }).check();
  await page.getByLabel(en.route.purpose.tourism).check();
  await page.getByLabel(en.route.employment.employed, { exact: true }).check();
  await page.getByRole("button", { name: en.route.submit }).click();
  await page.getByRole("button", { name: en.route.supported.cta }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);
}

test("an application opens into its sections, and the first question", async ({ page }) => {
  await signIn(page, uniqueEmail("intake"));
  await createApplication(page);

  // The card's next action is the way in.
  await page.getByRole("heading", { name: /Spain/ }).click();
  await expect(page).toHaveURL(/\/intake$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.intake.hubTitle);

  // Every section is listed, including the ones not built yet — and those say
  // why they cannot be opened.
  for (const name of Object.values(en.intake.section)) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(en.intake.unavailableHint).first()).toBeVisible();

  await page.getByRole("link", { name: en.intake.startCta, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    en.intake.question.applicant.name,
  );
});

test("an answer is checked by the shared rule before it is saved", async ({ page }) => {
  await signIn(page, uniqueEmail("intake-rule"));
  await createApplication(page);

  await page.goto(await intakeUrl(page, "applicant/pinyin"));
  await page.getByLabel(en.intake.question.applicant.pinyin).fill("陈静");
  await page.getByRole("button", { name: en.intake.next }).click();

  // The message comes from the key the rule emitted, resolved in this locale.
  await expect(page.getByText(en.validation.pinyin.invalid).first()).toBeVisible();
});

test("a passport expiring too soon is refused, and says how long it needs", async ({ page }) => {
  await signIn(page, uniqueEmail("intake-passport"));
  await createApplication(page);

  await page.goto(await intakeUrl(page, "passport/number"));
  await page.getByLabel(en.intake.question.passport.number).fill("E12345678");
  await page.getByRole("button", { name: en.intake.next }).click();

  // Wait for each question before answering it: the three date fields carry the
  // same labels on every date question, so filling before the next one has
  // rendered writes into the page being left.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    en.intake.question.passport.issuedAt,
  );
  await fillDate(page, "2020", "06", "01");
  await page.getByRole("button", { name: en.intake.next }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    en.intake.question.passport.expiresAt,
  );
  const soon = new Date();
  soon.setMonth(soon.getMonth() + 1);
  await fillDate(
    page,
    String(soon.getFullYear()),
    String(soon.getMonth() + 1).padStart(2, "0"),
    "15",
  );
  await page.getByRole("button", { name: en.intake.next }).click();

  const expected = en.validation.passport.expiry.tooSoon.replace("{monthsRequired}", "3");
  await expect(page.getByText(expected).first()).toBeVisible();
});

test("leaving mid-form and signing in again returns to the same question", async ({
  page,
  context,
}) => {
  const email = uniqueEmail("intake-resume");
  await signIn(page, email);
  await createApplication(page);

  // Answer the first question, which moves the resume point to the second.
  await page.goto(await intakeUrl(page, "applicant/name"));
  await page.getByLabel(en.intake.question.applicant.name).fill("陈静");
  await page.getByRole("button", { name: en.intake.next }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    en.intake.question.applicant.pinyin,
  );

  // Walk away: clear every cookie, which is what a killed in-app browser and a
  // cache clean both amount to.
  await context.clearCookies();
  await signIn(page, email);

  await page.getByRole("heading", { name: /Spain/ }).click();
  await expect(page).toHaveURL(/\/intake$/);
  // Exact, because the dashboard card is a link whose name contains this word
  // too — "Continue filling it in".
  await page.getByRole("link", { name: en.intake.resumeCta, exact: true }).click();

  // The exact question they were on, not the beginning.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    en.intake.question.applicant.pinyin,
  );

  // And the answer they gave is still there.
  await page.goto(await intakeUrl(page, "applicant/name"));
  await expect(page.getByLabel(en.intake.question.applicant.name)).toHaveValue("陈静");
});

/** The intake URL for a question, for the application this session just made. */
async function intakeUrl(page: Page, suffix: string): Promise<string> {
  await page.goto("/en/dashboard");
  await page.getByRole("heading", { name: /Spain/ }).click();
  await expect(page).toHaveURL(/\/intake$/);
  return `${new URL(page.url()).pathname}/${suffix}`;
}

async function fillDate(page: Page, year: string, month: string, day: string): Promise<void> {
  await page.getByLabel(en.intake.date.year).fill(year);
  await page.getByLabel(en.intake.date.month).fill(month);
  await page.getByLabel(en.intake.date.day).fill(day);
}
