import { expect, test } from "@playwright/test";
import zh from "../messages/zh-CN.json" with { type: "json" };
import en from "../messages/en.json" with { type: "json" };

test("switching language keeps the reader on the same page", async ({ page }) => {
  await page.goto("/zh/login");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(zh.auth.login.title);

  // The footer switcher is the one that is always present, at every width.
  await page.locator("footer").getByRole("link", { name: "English" }).click();

  await expect(page).toHaveURL(/\/en\/login/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.auth.login.title);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("each language names itself, in itself, in both interfaces", async ({ page }) => {
  for (const prefix of ["/zh", "/en"]) {
    await page.goto(prefix);
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "简体中文" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "English" })).toBeVisible();
  }
});

test("the switcher carries its note about the pack's language", async ({ page }) => {
  // This note is the reason the component exists: a reader who switches the
  // interface must not conclude the documents follow.
  await page.goto("/zh");
  await expect(page.locator("footer").getByText(zh.languageSwitcher.note)).toBeVisible();

  await page.goto("/en");
  await expect(page.locator("footer").getByText(en.languageSwitcher.note)).toBeVisible();
});

test("the switcher is reachable on a phone-sized screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/zh");

  const footerSwitcher = page.locator("footer").getByRole("link", { name: "English" });
  await expect(footerSwitcher).toBeVisible();
  await footerSwitcher.click();
  await expect(page).toHaveURL(/\/en$/);
});
