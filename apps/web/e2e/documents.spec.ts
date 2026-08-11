import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";
import en from "../messages/en.json" with { type: "json" };
import { clearInbox, readSignInCode, uniqueEmail } from "./support/mailpit";

/**
 * Uploading the applicant's own documents.
 *
 * The assertion that matters is not that a file goes up; it is that one which
 * does not arrive never counts as arrived. A checklist that marks a passport
 * scan complete on the browser's word is the failure this whole arrangement
 * exists to prevent.
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

/** A small real JPEG, so the type checks and the storage limits see a true file. */
const JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a" +
    "HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA" +
    "AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
  "base64",
);

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

test("the checklist asks for what this route needs, and says why", async ({ page }) => {
  await signIn(page, uniqueEmail("docs"));
  const id = await createApplication(page);

  await page.goto(`/en/applications/${id}/documents`);

  await expect(page.getByRole("heading", { name: en.documents.item.passportBio })).toBeVisible();
  // The reason is on the page, not behind anything.
  await expect(page.getByText(en.documents.item.passportBioWhy)).toBeVisible();
  await expect(page.getByRole("heading", { name: en.documents.item.bankStatement })).toBeVisible();

  // Nothing claims to have checked more than it has.
  await expect(page.getByText(en.documents.statusNote)).toBeVisible();

  // A document only somebody else's circumstances need is not asked for.
  await expect(page.getByRole("heading", { name: en.documents.item.sponsorProof })).toHaveCount(0);
});

test("a document counts only once the server has seen it", async ({ page }) => {
  const email = uniqueEmail("docs-upload");
  await signIn(page, email);
  const id = await createApplication(page);

  await page.goto(`/en/applications/${id}/documents`);

  const passport = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: en.documents.item.passportBio }) });

  await passport.getByRole("button", { name: en.documents.addCta }).click();
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "passport.jpg",
    mimeType: "image/jpeg",
    buffer: JPEG,
  });

  // "Received" is written by the server after it has looked the object up in
  // storage — the browser saying the transfer finished is not enough.
  await expect(passport.getByText(en.documents.state.stored)).toBeVisible({ timeout: 20_000 });

  const stored = query(
    `select status from public.uploads u
     join auth.users usr on usr.id = u.user_id
     where usr.email = '${email}' and u.document = 'passportBio'`,
  ).trim();
  expect(stored).toBe("stored");

  // And the bytes are really in the bucket, under the owner's own prefix.
  const objects = query(
    `select count(*) from storage.objects o
     join auth.users usr on usr.id::text = split_part(o.name, '/', 1)
     where usr.email = '${email}' and o.bucket_id = 'uploads'`,
  ).trim();
  expect(Number(objects)).toBe(1);
});

test("an application cannot be sent with documents missing", async ({ page }) => {
  const email = uniqueEmail("docs-gate");
  await signIn(page, email);
  const id = await createApplication(page);

  // Fill the form without uploading anything, by writing the answers the way
  // the form would; the point here is the gate, not the typing.
  query(
    `update public.applications set answers = '${JSON.stringify({
      applicant: {
        name: "陈静",
        pinyin: "CHEN JING",
        birthDate: "1990-04-12",
        phone: "13800000000",
      },
      passport: { number: "E12345678", issuedAt: "2020-06-01", expiresAt: "2030-06-01" },
      residence: { city: "成都", address: "天府大道 1 号 2 单元 301" },
      employment: {
        employer: "某某科技",
        position: "架构师",
        startDate: "2020-03-01",
        monthlyIncome: "6000",
      },
      travel: { departureDate: "2027-01-10", returnDate: "2027-01-30", cities: "Madrid" },
      companions: { travellingWith: "alone", whoPays: "self" },
      history: { schengenBefore: "no", refused: "no" },
    })}'::jsonb where id = '${id}'`,
  );

  await page.goto(`/en/applications/${id}/intake/review`);
  await page.getByRole("button", { name: en.intake.review.submit }).click();

  await expect(page.getByText(en.intake.review.documentsMissing)).toBeVisible();

  // Nothing was enqueued: ten minutes of model time on an incomplete pack is
  // exactly what this gate is for.
  const jobs = query(
    `select count(*) from public.jobs j
     join auth.users u on u.id = j.user_id where u.email = '${email}'`,
  ).trim();
  expect(Number(jobs)).toBe(0);
});
