import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";
import en from "../messages/en.json" with { type: "json" };
import { clearInbox, readSignInCode, uniqueEmail } from "./support/mailpit";

/**
 * The whole journey, once: sign in, check the route, answer every question,
 * read it back, and send it.
 *
 * The point of the last step is what it leaves behind — a queued job carrying
 * the work and not the person. That is the contract the agent plane reads, so
 * it is asserted against the database rather than against the screen.
 */

function query(sql: string): string {
  return execFileSync("docker", [
    "exec",
    "supabase_db_db",
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-tAc",
    sql,
  ]).toString();
}

function isoIn(months: number): { year: string; month: string; day: string } {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    day: "15",
  };
}

async function answerText(page: Page, question: string, value: string): Promise<void> {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(question);
  await page.getByLabel(question).fill(value);
  await page.getByRole("button", { name: en.intake.next }).click();
}

async function answerDate(
  page: Page,
  question: string,
  date: { year: string; month: string; day: string },
): Promise<void> {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(question);
  await page.getByLabel(en.intake.date.year).fill(date.year);
  await page.getByLabel(en.intake.date.month).fill(date.month);
  await page.getByLabel(en.intake.date.day).fill(date.day);
  await page.getByRole("button", { name: en.intake.next }).click();
}

async function answerChoice(page: Page, question: string, option: string): Promise<void> {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(question);
  await page.getByLabel(option, { exact: true }).check();
  await page.getByRole("button", { name: en.intake.next }).click();
}

test("a complete application is sent and leaves a queued job", async ({ page }) => {
  const email = uniqueEmail("journey");

  await clearInbox(email);
  await page.goto("/en/login");
  await page.getByLabel(en.auth.login.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.login.submit }).click();
  await page.getByLabel(en.auth.otp.codeLabel).fill(await readSignInCode(email));
  await page.getByRole("button", { name: en.auth.otp.submit }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);

  await page.goto("/en/start");
  await page.getByLabel(en.route.area.sichuan, { exact: true }).check();
  await page.getByLabel("Spain", { exact: true }).check();
  await page.getByLabel(en.route.purpose.tourism).check();
  await page.getByLabel(en.route.employment.employed, { exact: true }).check();
  await page.getByRole("button", { name: en.route.submit }).click();
  await page.getByRole("button", { name: en.route.supported.cta }).click();

  await page.getByRole("heading", { name: /Spain/ }).click();
  // The card opens the application; the form is one step further in.
  await page.getByRole("link", { name: en.application.continueCta, exact: true }).click();
  await expect(page).toHaveURL(/\/intake$/);
  await page.getByRole("link", { name: en.intake.startCta, exact: true }).click();

  const q = en.intake.question;
  await answerText(page, q.applicant.name, "陈静");
  await answerText(page, q.applicant.pinyin, "CHEN JING");
  await answerDate(page, q.applicant.birthDate, { year: "1990", month: "04", day: "12" });
  await answerText(page, q.applicant.phone, "13800000000");

  await answerText(page, q.passport.number, "E12345678");
  await answerDate(page, q.passport.issuedAt, { year: "2020", month: "06", day: "01" });
  await answerDate(page, q.passport.expiresAt, isoIn(30));

  await answerText(page, q.residence.city, "成都");
  await answerText(page, q.residence.address, "四川省成都市武侯区天府大道 1 号 2 单元 301");

  await answerText(page, q.employment.employer, "成都某某科技有限公司");
  await answerText(page, q.employment.position, "软件架构师");
  await answerDate(page, q.employment.startDate, { year: "2020", month: "03", day: "01" });
  await answerText(page, q.employment.monthlyIncome, "6000");

  await answerDate(page, q.travel.departureDate, isoIn(2));
  await answerDate(page, q.travel.returnDate, isoIn(3));
  await answerText(page, q.travel.cities, "Madrid, Seville, Barcelona");

  await answerChoice(page, q.companions.travellingWith, en.intake.option.travellingWith.alone);
  await answerChoice(page, q.companions.whoPays, en.intake.option.whoPays.self);

  await answerChoice(page, q.history.schengenBefore, en.intake.option.yesNoUnsure.no);
  await answerChoice(page, q.history.refused, en.intake.option.yesNoUnsure.no);

  // The last answer returns to the section list, now complete.
  await expect(page).toHaveURL(/\/intake$/);
  await expect(page.getByText("20 of 20 questions answered")).toBeVisible();

  await page.getByRole("link", { name: en.intake.review.title, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.intake.review.title);

  // Answers are shown back as they were given, not summarised away.
  await expect(page.getByText("CHEN JING")).toBeVisible();
  await expect(page.getByText("E12345678")).toBeVisible();

  await page.getByRole("button", { name: en.intake.review.submit }).click();

  await expect(page).toHaveURL(/\/en\/dashboard/);
  await expect(page.getByText(en.application.nextStep.submitted)).toBeVisible();

  // A sent application opens its own page, not the form it came from.
  await page.getByRole("heading", { name: /Spain/ }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(
    en.application.jobStatus.queued,
  );
  await expect(page.getByRole("link", { name: en.application.continueCta })).toHaveCount(0);

  // What the agent plane will read.
  const jobs = query(
    `select task_type || '|' || executor_kind || '|' || state || '|' || deadline_seconds
     from public.jobs j
     join auth.users u on u.id = j.user_id
     where u.email = '${email}'`,
  ).trim();
  expect(jobs).toBe("produce_pack|hermes|queued|3600");

  // The payload carries the work and not the person: no account identifier and
  // no address of the person signed in.
  const input = query(
    `select input::text from public.jobs j
     join auth.users u on u.id = j.user_id where u.email = '${email}'`,
  );
  expect(input).toContain("CHEN JING");
  expect(input).not.toContain(email);

  const idempotency = query(
    `select idempotency_key from public.jobs j
     join auth.users u on u.id = j.user_id where u.email = '${email}'`,
  ).trim();
  expect(idempotency).toMatch(/^produce_pack:application:/);
});
