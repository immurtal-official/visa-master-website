import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";
import { INTAKE_VERSION } from "@visa-master/core";
import en from "../messages/en.json" with { type: "json" };
import { completeAnswers } from "./support/intake";
import { clearInbox, readSignInCode, uniqueEmail } from "./support/mailpit";

/**
 * An answer read off a document is a proposal until the applicant confirms it.
 *
 * Extraction does not write answers yet, so the proposal here is written the
 * way the write-back will write it — a document field, and a source row that
 * says `document`, unconfirmed — and the rest of the journey is the real one:
 * the review marks it, the submission refuses it, the question says where it
 * came from, and pressing Continue there is what confirms it.
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

const REQUIRED = [
  "passportBio",
  "photo",
  "hukou",
  "employmentLetter",
  "bankStatement",
  "insurance",
  "flightBooking",
  "hotelBooking",
];

test("an answer read from a document is held back until the applicant confirms it", async ({
  page,
}) => {
  await signIn(page, uniqueEmail("provenance"));
  const id = await createApplication(page);

  // A finished form and every document, as in the other journeys.
  query(
    `update public.applications set answers = '${JSON.stringify(completeAnswers())}'::jsonb
     where id = '${id}'`,
  );
  for (const document of REQUIRED) {
    query(
      `insert into public.uploads (application_id, user_id, document, storage_path, content_type, status)
       select a.id, a.user_id, '${document}', a.user_id || '/' || a.id || '/${document}.jpg',
              'image/jpeg', 'stored'
       from public.applications a where a.id = '${id}'`,
    );
  }

  // What the write-back will do: read the number off the passport scan and
  // propose it, unconfirmed.
  query(
    `with field as (
       insert into public.document_fields
         (upload_id, application_id, user_id, field, value, confidence, source_page)
       select u.id, u.application_id, u.user_id, 'passport.number', 'E12345678', 0.97, 1
       from public.uploads u where u.application_id = '${id}' and u.document = 'passportBio'
       returning id, application_id, user_id
     )
     insert into public.answer_sources
       (application_id, user_id, path, source, document_field_id, confirmed_at, intake_version)
     select application_id, user_id, 'passport.number', 'document', id, null, ${INTAKE_VERSION}
     from field`,
  );

  const jobs = () =>
    Number(
      query(
        `select count(*) from public.jobs j join public.applications a on a.submitted_job_id = j.id
         where a.id = '${id}'`,
      ).trim(),
    );

  // The review marks it, and sending is refused with the reason.
  await page.goto(`/en/applications/${id}/intake/review`);
  await expect(page.getByText(en.intake.review.toConfirm, { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: en.intake.review.submit }).click();
  await expect(page.getByText(en.validation.answer.unconfirmed)).toBeVisible();
  expect(jobs()).toBe(0);

  // The question says where the value came from; pressing Continue confirms it.
  await page.goto(`/en/applications/${id}/intake/passport/number`);
  await expect(page.getByText(en.intake.fromDocument.title)).toBeVisible();
  await expect(page.getByLabel(en.intake.question.passport.number)).toHaveValue("E12345678");
  await page.getByRole("button", { name: en.intake.next }).click();
  await expect(page).toHaveURL(/\/intake\/passport\/issuedAt$/);

  expect(
    query(
      `select source || '|' || (confirmed_at is not null) from public.answer_sources
       where application_id = '${id}' and path = 'passport.number'`,
    ).trim(),
  ).toBe("applicant|true");

  // Nothing is left to confirm, and it goes.
  await page.goto(`/en/applications/${id}/intake/review`);
  await expect(page.getByText(en.intake.review.toConfirm, { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: en.intake.review.submit }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);
  expect(jobs()).toBe(1);
});
