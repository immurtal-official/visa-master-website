import { expect } from "@playwright/test";

const MAILPIT_API = "http://127.0.0.1:54324";

/** A fresh address per run, so a code is never read from an earlier test. */
export function uniqueEmail(prefix = "wk1"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@e2e.test`;
}

interface MailpitMessage {
  ID: string;
  Subject: string;
  Text?: string;
  HTML?: string;
}

/**
 * Read the sign-in code out of the local mail catcher.
 *
 * This is what makes the sign-in journey testable without a person in it: the
 * code only exists in an email, and Mailpit exposes the mailbox over HTTP.
 */
export async function readSignInCode(email: string, timeoutMs = 15_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let lastSubject = "";

  while (Date.now() < deadline) {
    const search = await fetch(
      `${MAILPIT_API}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
    );
    const { messages = [] } = (await search.json()) as { messages?: MailpitMessage[] };

    if (messages.length > 0) {
      const detail = await fetch(`${MAILPIT_API}/api/v1/message/${messages[0]!.ID}`);
      const message = (await detail.json()) as MailpitMessage;
      lastSubject = message.Subject;

      const body = `${message.Text ?? ""}\n${message.HTML ?? ""}`;
      const code = body.match(/\b\d{6}\b/)?.[0];
      if (code) return code;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(
    `No sign-in code arrived for ${email} within ${timeoutMs}ms` +
      (lastSubject ? ` (last message subject: ${lastSubject})` : ""),
  );
}

/** The email must carry a code, not a link — the sign-in screen asks for digits. */
export async function expectCodeNotLink(email: string): Promise<void> {
  const search = await fetch(
    `${MAILPIT_API}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
  );
  const { messages = [] } = (await search.json()) as { messages?: MailpitMessage[] };
  expect(messages.length).toBeGreaterThan(0);

  const detail = await fetch(`${MAILPIT_API}/api/v1/message/${messages[0]!.ID}`);
  const message = (await detail.json()) as MailpitMessage;
  const body = `${message.Text ?? ""}\n${message.HTML ?? ""}`;

  expect(body).toMatch(/\b\d{6}\b/);
  // Both languages, because the recipient's is not known at this layer yet.
  expect(body).toContain("你的登录验证码");
  expect(body).toContain("Your sign-in code");
}
