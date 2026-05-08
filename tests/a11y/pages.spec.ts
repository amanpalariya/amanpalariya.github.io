import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  "/",
  "/about",
  "/cv",
  "/projects",
  "/projects/console-game-language",
  "/blogs",
  "/blogs/character-encodings-and-unicode",
  "/tools",
  "/tools/calendar-drill",
  "/tools/epub-maker",
  "/features",
];

for (const path of pages) {
  test(`page: ${path} renders a non-empty document`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status(), `${path} should not return an HTTP error`).toBeLessThan(400);
    await expect(page.locator("body")).toContainText(/\S/);
    await expect(page.locator("body")).not.toContainText("404");
    await expect(page).toHaveTitle(/\S/);
  });

  test(`axe: ${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .exclude('iframe[src*="youtube.com"], iframe[src*="youtube-nocookie.com"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const seriousOrWorse = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );

    expect(
      seriousOrWorse,
      seriousOrWorse
        .map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`)
        .join("\n"),
    ).toEqual([]);
  });
}
