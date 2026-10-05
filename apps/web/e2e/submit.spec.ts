import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import { INTAKE_CHECKSUM, INTAKE_VERSION } from "@visa-master/core";
import en from "../messages/en.json" with { type: "json" };
import { answerEveryQuestion, allAnsweredText, QUESTIONS } from "./support/intake";
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

/**
 * Mark every mandatory document as received.
 *
 * Written as the server writes it — the status column means the bytes were
 * seen, and only the server can set it, so a test that needs the precondition
 * sets it the same way rather than pretending through the browser.
 */
function storeRequiredDocuments(email: string): void {
  const documents = [
    "passportBio",
    "photo",
    "hukou",
    "employmentLetter",
    "bankStatement",
    "insurance",
    "flightBooking",
    "hotelBooking",
  ];

  for (const document of documents) {
    query(
      `insert into public.uploads
         (application_id, user_id, document, storage_path, content_type, status)
       select a.id, a.user_id, '${document}',
              a.user_id || '/' || a.id || '/${document}.jpg', 'image/jpeg', 'stored'
       from public.applications a
       join auth.users u on u.id = a.user_id
       where u.email = '${email}'`,
    );
  }
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

  // Every question, in the order the questionnaire asks them.
  await answerEveryQuestion(page);

  // The documents are a precondition here rather than the subject: the upload
  // path itself is covered by documents.spec, and repeating it eight times
  // would test the same thing eight times.
  storeRequiredDocuments(email);

  // The last answer returns to the section list, now complete.
  await expect(page).toHaveURL(/\/intake$/);
  await expect(page.getByText(allAnsweredText())).toBeVisible();

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

  // The job names the contract it was validated against.
  const contract = query(
    `select input->'intakeContract'->>'version' || '|' || (input->'intakeContract'->>'checksum')
     from public.jobs j join auth.users u on u.id = j.user_id where u.email = '${email}'`,
  ).trim();
  expect(contract).toBe(`${INTAKE_VERSION}|${INTAKE_CHECKSUM}`);

  // Every answer was typed, so every answer's source says so, confirmed.
  const sources = query(
    `select count(*) filter (where s.source = 'applicant' and s.confirmed_at is not null)
            || '|' || count(*) || '|' || min(a.intake_version)
     from public.answer_sources s
     join public.applications a on a.id = s.application_id
     join auth.users u on u.id = a.user_id where u.email = '${email}'`,
  ).trim();
  expect(sources).toBe(`${QUESTIONS.length}|${QUESTIONS.length}|${INTAKE_VERSION}`);
});
