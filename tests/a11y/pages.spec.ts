import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  "/",
  "/projects",
  "/blogs/character-encodings-and-unicode",
];

for (const path of pages) {
  test(`axe: ${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
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
