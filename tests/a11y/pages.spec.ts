import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

import { nonToolPageCases, toolPageCases } from "../functional/support/page-cases";

const pageCases = [...nonToolPageCases, ...toolPageCases];

async function getPreferredColorScheme(page: Page) {
  return page.evaluate(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
}

for (const pageCase of pageCases) {
  test(`page: ${pageCase.name} renders a non-empty document`, async ({ page }) => {
    const response = await page.goto(pageCase.path);

    expect(response?.status(), `${pageCase.path} should not return an HTTP error`).toBeLessThan(400);
    await expect(page.locator("body")).toContainText(/\S/);
    await expect(page.locator("body")).not.toContainText("404");
    await expect(page).toHaveTitle(/\S/);
  });

  test(`axe: ${pageCase.name} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(pageCase.path);
    await page.waitForLoadState("networkidle");
    const colorScheme = await getPreferredColorScheme(page);

    await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${colorScheme}\\b`));

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
