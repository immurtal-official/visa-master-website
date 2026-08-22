import { execFileSync } from "node:child_process";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { clearInbox, readSignInCode, uniqueEmail } from "./support/mailpit";

/**
 * The /api/v1 contract, consumed the way a mini program or a mobile app will
 * consume it: no browser, no page — requests and their shapes.
 *
 * Two invariants carry the whole suite. Every failure is a catalogue key
 * (issues for rule failures, one error key for everything else), never a
 * sentence in anybody's language. And nothing succeeds that the rules say may
 * not: the negative paths here are the product's promises, stated as HTTP.
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

async function signIn(request: APIRequestContext, email: string): Promise<void> {
  await clearInbox(email);
  const sent = await request.post("/api/v1/auth/otp", { data: { email } });
  expect(sent.status()).toBe(200);
  const verified = await request.post("/api/v1/auth/verify", {
    data: { email, code: await readSignInCode(email) },
  });
  expect(verified.status()).toBe(204);
}

const ROUTE_OK = {
  residenceArea: "sichuan",
  destination: "ES",
  purpose: "tourism",
  employment: "employed",
};

const FULL_ANSWERS = {
  applicant: { name: "陈静", pinyin: "CHEN JING", birthDate: "1990-04-12", phone: "13800000000" },
  passport: { number: "E12345678", issuedAt: "2020-06-01", expiresAt: "2031-06-01" },
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
};

test("rule failures arrive as issues with keys, never sentences", async ({ request }) => {
  const response = await request.post("/api/v1/auth/otp", { data: { email: "not-an-email" } });
  expect(response.status()).toBe(422);

  const payload = (await response.json()) as { issues: { path: string; key: string }[] };
  expect(payload.issues).toEqual([{ path: "email", key: "validation.email.invalid" }]);
});

test("a wrong sign-in code is one key; a malformed one never reaches the service", async ({
  request,
}) => {
  const email = uniqueEmail("contract-code");
  await clearInbox(email);
  await request.post("/api/v1/auth/otp", { data: { email } });

  const malformed = await request.post("/api/v1/auth/verify", {
    data: { email, code: "12" },
  });
  expect(malformed.status()).toBe(422);
  expect(((await malformed.json()) as { issues: { key: string }[] }).issues[0]!.key).toBe(
    "validation.otp.invalidFormat",
  );

  const wrong = await request.post("/api/v1/auth/verify", {
    data: { email, code: "000000" },
  });
  expect(wrong.status()).toBe(401);
  expect(((await wrong.json()) as { error: { key: string } }).error.key).toBe("auth.otp.failed");
});

test("signed out means signed out, in both directions", async ({ request }) => {
  // Before any session: protected reads and writes refuse with one key.
  for (const [method, path] of [
    ["get", "/api/v1/me"],
    ["get", "/api/v1/applications"],
    ["post", "/api/v1/applications"],
  ] as const) {
    const response =
      method === "get" ? await request.get(path) : await request.post(path, { data: ROUTE_OK });
    expect(response.status(), `${method} ${path}`).toBe(401);
    expect(((await response.json()) as { error: { key: string } }).error.key).toBe(
      "route.sessionExpired",
    );
  }

  const email = uniqueEmail("contract-session");
  await signIn(request, email);
  expect((await request.get("/api/v1/me")).status()).toBe(200);

  expect((await request.post("/api/v1/auth/signout")).status()).toBe(204);
  expect((await request.get("/api/v1/me")).status()).toBe(401);
});

test("the route gate answers without an account, and the waiting list accepts one", async ({
  request,
}) => {
  const supported = await request.post("/api/v1/route-checks", { data: ROUTE_OK });
  expect(supported.status()).toBe(200);
  expect(((await supported.json()) as { verdict: { supported: boolean } }).verdict.supported).toBe(
    true,
  );

  const refused = await request.post("/api/v1/route-checks", {
    data: { ...ROUTE_OK, destination: "FR", employment: "student" },
  });
  const verdict = (
    (await refused.json()) as {
      verdict: { supported: boolean; reasons: string[] };
    }
  ).verdict;
  // Every failing part, not just the first — as catalogue keys.
  expect(verdict.reasons).toEqual([
    "route.unsupported.reason.destination",
    "route.unsupported.reason.employment",
  ]);

  expect(
    (await request.post("/api/v1/waitlist", { data: { ...ROUTE_OK, destination: "FR" } })).status(),
  ).toBe(204);
});

test("an application that is not yours is not there", async ({ request }) => {
  await signIn(request, uniqueEmail("contract-owner"));
  const missing = await request.get("/api/v1/applications/00000000-0000-0000-0000-000000000000");
  expect(missing.status()).toBe(404);
});

test("the whole journey, as a headless client: create, answer, gate, submit, only once", async ({
  request,
}) => {
  const email = uniqueEmail("contract-journey");
  await signIn(request, email);

  // Create — the gate runs server-side at the step that writes.
  const created = await request.post("/api/v1/applications", { data: ROUTE_OK });
  expect(created.status()).toBe(201);
  const id = ((await created.json()) as { application: { id: string } }).application.id;

  // A rule failure on one answer names the rule.
  const badAnswer = await request.post(`/api/v1/applications/${id}/answers`, {
    data: { sectionId: "applicant", questionId: "pinyin", value: "陈静" },
  });
  expect(badAnswer.status()).toBe(422);
  expect(((await badAnswer.json()) as { issues: { key: string }[] }).issues[0]!.key).toBe(
    "validation.pinyin.invalid",
  );

  // A good answer advances and lands in the stored draft.
  const goodAnswer = await request.post(`/api/v1/applications/${id}/answers`, {
    data: { sectionId: "applicant", questionId: "name", value: "陈静" },
  });
  expect(goodAnswer.status()).toBe(200);
  expect(((await goodAnswer.json()) as { next: { questionId: string } }).next.questionId).toBe(
    "pinyin",
  );

  // Submitting an unfinished form is refused with the unanswered fields.
  const early = await request.post(`/api/v1/applications/${id}/submit`);
  expect(early.status()).toBe(422);
  expect(((await early.json()) as { issues: { key: string }[] }).issues.length).toBeGreaterThan(3);

  // Finish the form the way the form would have; then the document gate holds.
  query(
    `update public.applications set answers = '${JSON.stringify(FULL_ANSWERS)}'::jsonb
     where id = '${id}'`,
  );
  const noDocs = await request.post(`/api/v1/applications/${id}/submit`);
  expect(noDocs.status()).toBe(422);
  const noDocsBody = (await noDocs.json()) as {
    error: { key: string; missingDocuments: string[] };
  };
  expect(noDocsBody.error.key).toBe("intake.review.documentsMissing");
  expect(noDocsBody.error.missingDocuments).toContain("passportBio");

  // The documents view names what is needed and what is not.
  const documents = await request.get(`/api/v1/applications/${id}/documents`);
  const view = (await documents.json()) as { required: { id: string }[] };
  expect(view.required.map((d) => d.id)).not.toContain("sponsorProof");

  // Store the mandatory documents the way the server stores them, then send.
  for (const doc of [
    "passportBio",
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
       select a.id, a.user_id, '${doc}', a.user_id || '/' || a.id || '/${doc}.jpg', 'image/jpeg', 'stored'
       from public.applications a where a.id = '${id}'`,
    );
  }
  expect((await request.post(`/api/v1/applications/${id}/submit`)).status()).toBe(204);

  // Once. The second press is told why, and no second job exists.
  const again = await request.post(`/api/v1/applications/${id}/submit`);
  expect(again.status()).toBe(409);
  expect(((await again.json()) as { error: { key: string } }).error.key).toBe(
    "intake.review.alreadySubmitted",
  );
  const jobs = query(
    `select count(*) from public.jobs j join auth.users u on u.id = j.user_id
     where u.email = '${email}'`,
  ).trim();
  expect(Number(jobs)).toBe(1);

  // And the detail view now reports the job's own state.
  const detail = await request.get(`/api/v1/applications/${id}`);
  const body = (await detail.json()) as { application: { status: string }; job: { state: string } };
  expect(body.application.status).toBe("submitted");
  expect(body.job.state).toBe("queued");
});
