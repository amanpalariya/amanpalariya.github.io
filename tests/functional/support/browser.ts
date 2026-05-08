import type { Page } from "@playwright/test";

export async function resetBrowserStorage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}
