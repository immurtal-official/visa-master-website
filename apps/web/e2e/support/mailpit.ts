import { expect } from "@playwright/test";

const MAILPIT_API = "http://127.0.0.1:54324";

/** A fresh address per run, so a code is never read from an earlier test. */
export function uniqueEmail(prefix = "wk1"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@e2e.test`;
}

interface MailpitMessage {
  ID: string;
  Subject: string;
  Created?: string;
  Text?: string;
  HTML?: string;
}

/**
 * The newest message wins.
 *
 * Signing in twice with the same address leaves two codes in the mailbox, and
 * the older one has already been spent — taking whichever the search happened
 * to return first makes the second sign-in fail intermittently.
 */
function newest(messages: MailpitMessage[]): MailpitMessage | undefined {
  return [...messages].sort((a, b) => (b.Created ?? "").localeCompare(a.Created ?? ""))[0];
}

/**
 * Empty this address's mailbox before asking for a new code.
 *
 * Without it, a second sign-in reads the first code back: the old message is
 * always present, so a reader that returns as soon as it finds any code finds
 * the spent one long before the new one arrives. Waiting for "a newer message"
 * is the same race one step removed; deleting first removes it.
 */
export async function clearInbox(email: string): Promise<void> {
  const search = await fetch(
    `${MAILPIT_API}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
  );
  const { messages = [] } = (await search.json()) as { messages?: MailpitMessage[] };
  if (messages.length === 0) return;

  await fetch(`${MAILPIT_API}/api/v1/messages`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ IDs: messages.map((message) => message.ID) }),
  });
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

    const latest = newest(messages);
    if (latest) {
      const detail = await fetch(`${MAILPIT_API}/api/v1/message/${latest.ID}`);
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

  const detail = await fetch(`${MAILPIT_API}/api/v1/message/${newest(messages)!.ID}`);
  const message = (await detail.json()) as MailpitMessage;
  const body = `${message.Text ?? ""}\n${message.HTML ?? ""}`;

  expect(body).toMatch(/\b\d{6}\b/);
  // Both languages, because the recipient's is not known at this layer yet.
  expect(body).toContain("你的登录验证码");
  expect(body).toContain("Your sign-in code");
}
