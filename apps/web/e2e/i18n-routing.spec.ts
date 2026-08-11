import { expect, test } from "@playwright/test";
import zh from "../messages/zh-CN.json" with { type: "json" };
import en from "../messages/en.json" with { type: "json" };

/**
 * Copy is read from the catalogues rather than repeated here. A test that
 * hardcodes a sentence is a third place that sentence lives, and it passes
 * happily while the catalogue drifts underneath it.
 */
const CATALOGUES = [
  { prefix: "/zh", lang: "zh-CN", messages: zh },
  { prefix: "/en", lang: "en", messages: en },
] as const;

test("the root sends the reader to a language", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(zh|en)$/);
});

for (const { prefix, lang, messages } of CATALOGUES) {
  test(`${prefix} renders in its own language`, async ({ page }) => {
    await page.goto(prefix);

    // The lang attribute is what selects the per-script line height, so it is
    // worth asserting rather than assuming.
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.landing.intro);
    await expect(page.getByText(messages.chrome.footer.disclaimer)).toBeVisible();
  });

  test(`${prefix} answers an unknown path in both languages`, async ({ page }) => {
    const response = await page.goto(`${prefix}/definitely-not-a-page`);

    expect(response?.status()).toBe(404);
    // A URL that matches no route carries no locale, so the answer is given in
    // both rather than guessed at.
    await expect(page.getByText(messages.errors.notFound.title)).toBeVisible();
    await expect(page.getByText(messages.errors.notFound.body)).toBeVisible();
  });
}

test("an unsupported language is redirected under a supported one", async ({ page }) => {
  const response = await page.goto("/fr/anything");

  // No route matches, so it is a 404 — but a rendered one, readable in either
  // language, rather than a blank page.
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/\/(zh|en)\/fr\/anything/);
  await expect(page.getByText(zh.errors.notFound.title)).toBeVisible();
  await expect(page.getByText(en.errors.notFound.title)).toBeVisible();
});

test("a not-found page tells crawlers not to index it", async ({ page }) => {
  await page.goto("/zh/definitely-not-a-page");
  // Next adds its own robots tag alongside the page's, so both are present.
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
});
