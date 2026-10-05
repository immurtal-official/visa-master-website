import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import en from "../messages/en.json" with { type: "json" };
import { completeAnswers } from "./support/intake";
import { clearInbox, readSignInCode, uniqueEmail } from "./support/mailpit";

/**
 * Reading a document into the form, end to end: a passport scan uploaded
 * through the page, the extraction job the server queues for it, the real
 * conductor running that one job with the fixture reader in place of a model,
 * and the proposed answers it writes back — which the applicant then has to
 * confirm, one by one, before anything is sent.
 *
 * It needs the server started with DOCUMENT_EXTRACTION=on, and is reported as
 * skipped otherwise.
 */
test.skip(process.env.DOCUMENT_EXTRACTION !== "on", "needs DOCUMENT_EXTRACTION=on");

const CONDUCTOR = fileURLToPath(new URL("../../conductor", import.meta.url));

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

async function signIn(page: Page, email: string): Promise<void> {
  await clearInbox(email);
  await page.goto("/en/login");
  await page.getByLabel(en.auth.login.emailLabel).fill(email);
  await page.getByRole("button", { name: en.auth.login.submit }).click();
  await page.getByLabel(en.auth.otp.codeLabel).fill(await readSignInCode(email));
  await page.getByRole("button", { name: en.auth.otp.submit }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);
}

async function createApplication(page: Page): Promise<string> {
  await page.goto("/en/start");
  await page.getByLabel(en.route.area.sichuan, { exact: true }).check();
  await page.getByLabel("Spain", { exact: true }).check();
  await page.getByLabel(en.route.purpose.tourism).check();
  await page.getByLabel(en.route.employment.employed, { exact: true }).check();
  await page.getByRole("button", { name: en.route.submit }).click();
  await page.getByRole("button", { name: en.route.supported.cta }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);
  await page.getByRole("heading", { name: /Spain/ }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/);
  return new URL(page.url()).pathname.split("/").pop()!;
}

const JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a" +
    "HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA" +
    "AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
  "base64",
);

/** The answers the passport scan is read for, as the questionnaire stores them. */
const READ_FROM_PASSPORT = [
  ["passport", "number"],
  ["passport", "issuedAt"],
  ["passport", "expiresAt"],
  ["applicant", "pinyin"],
  ["applicant", "birthDate"],
] as const;

test("a passport scan is read into proposed answers the applicant confirms", async ({ page }) => {
  test.setTimeout(180_000);
  await signIn(page, uniqueEmail("extraction"));
  const id = await createApplication(page);

  // Everything answered except what the passport will supply.
  const answers = completeAnswers() as Record<string, Record<string, unknown>>;
  for (const [section, question] of READ_FROM_PASSPORT) delete answers[section]![question];
  query(
    `update public.applications set answers = '${JSON.stringify(answers)}'::jsonb where id = '${id}'`,
  );

  // Upload the scan the way the applicant does.
  await page.goto(`/en/applications/${id}/documents`);
  const passport = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: en.documents.item.passportBio }) });
  await passport.getByRole("button", { name: en.documents.addCta }).click();
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({ name: "passport.jpg", mimeType: "image/jpeg", buffer: JPEG });
  await expect(passport.getByText(en.documents.state.stored)).toBeVisible({ timeout: 20_000 });

  // Confirming the upload queued a reading of it — by reference, never by path.
  const job = query(
    `select j.id || '|' || j.state || '|' || j.input::text from public.jobs j
     join public.uploads u on u.id::text = j.input->'documents'->0->>'uploadId'
     where u.application_id = '${id}' and j.task_type = 'doc_field_extraction'`,
  ).trim();
  const [jobId, state, input] = job.split("|");
  expect(state).toBe("queued");
  expect(input).not.toContain("storage_path");

  // The real conductor runs that one job, with the fixture reader.
  execFileSync("pnpm", ["-s", "run:job", jobId!], {
    cwd: CONDUCTOR,
    env: {
      ...process.env,
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      EXTRACTION_EXECUTOR: "fixtures",
    },
    stdio: "pipe",
  });

  // Five answers proposed, none confirmed, and none of them the applicant's yet.
  expect(
    query(
      `select count(*) filter (where source = 'document' and confirmed_at is null)
       from public.answer_sources where application_id = '${id}'`,
    ).trim(),
  ).toBe("5");

  // The rest of the documents, so only confirmation stands in the way.
  for (const document of [
    "photo",
    "hukou",
    "employmentLetter",
    "bankStatement",
    "insurance",
    "flightBooking",
    "hotelBooking",
  ]) {
    query(
      `insert into public.uploads (application_id, user_id, document, storage_path, content_type, status)
       select a.id, a.user_id, '${document}', a.user_id || '/' || a.id || '/${document}.jpg',
              'image/jpeg', 'stored'
       from public.applications a where a.id = '${id}'`,
    );
  }

  await page.goto(`/en/applications/${id}/intake/review`);
  await expect(page.getByText(en.intake.review.toConfirm, { exact: true })).toHaveCount(5);
  await page.getByRole("button", { name: en.intake.review.submit }).click();
  await expect(page.getByText(en.validation.answer.unconfirmed)).toBeVisible();

  // Each proposal says where it came from, carries the value read, and is
  // confirmed by pressing Continue on it.
  await page.goto(`/en/applications/${id}/intake/passport/number`);
  await expect(page.getByText(en.intake.fromDocument.title)).toBeVisible();
  await expect(page.getByLabel(en.intake.question.passport.number)).toHaveValue("E12345678");
  await page.getByRole("button", { name: en.intake.next }).click();
  await expect(page).toHaveURL(/\/intake\/passport\/issuedAt$/);

  for (const [section, question] of READ_FROM_PASSPORT.slice(1)) {
    await page.goto(`/en/applications/${id}/intake/${section}/${question}`);
    await expect(page.getByText(en.intake.fromDocument.title)).toBeVisible();
    await page.getByRole("button", { name: en.intake.next }).click();
    await expect(page).not.toHaveURL(new RegExp(`/intake/${section}/${question}$`));
  }

  await page.goto(`/en/applications/${id}/intake/review`);
  await expect(page.getByText(en.intake.review.toConfirm, { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: en.intake.review.submit }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);

  // What was sent is what the applicant confirmed.
  expect(
    query(
      `select j.input->'intake'->'passport'->>'number' from public.jobs j
       join public.applications a on a.submitted_job_id = j.id where a.id = '${id}'`,
    ).trim(),
  ).toBe("E12345678");
});
