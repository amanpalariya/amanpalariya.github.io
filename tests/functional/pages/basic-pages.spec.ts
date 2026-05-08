import { expect, test } from "../support/fixtures";
import { nonToolPageCases, toolPageCases } from "../support/page-cases";

test.describe("registered functional pages", () => {
  for (const pageCase of [...toolPageCases, ...nonToolPageCases]) {
    test(`${pageCase.name} renders its primary experience`, async ({ page }) => {
      const response = await page.goto(pageCase.path);

      expect(response?.status(), `${pageCase.path} should load successfully`).toBeLessThan(400);
      await expect(page.getByRole("heading", { name: pageCase.heading }).first()).toBeVisible();
    });
  }
});
