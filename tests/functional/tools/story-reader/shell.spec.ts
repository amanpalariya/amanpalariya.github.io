import { expect, test } from "../../support/fixtures";

test.describe("Bilingual Story Reader shell", () => {
  test("shows setup, paste, and disabled empty-state actions", async ({ page }) => {
    const response = await page.goto("/tools/story-reader");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Bilingual Story Reader" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story Setup" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Paste JSON" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Prompt" })).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Copy Prompt" }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Copy Prompt" }).nth(1)).toBeDisabled();
    await expect(page.getByRole("button", { name: "Render Story" })).toBeDisabled();
    await expect(page.getByText("No story loaded")).toBeVisible();
  });

  test("generates and copies a prompt after required setup fields are filled", async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/tools/story-reader");

    await expect(page.getByRole("button", { name: "Copy Prompt" }).first()).toBeDisabled();
    await expect(page.getByLabel("Prompt preview")).toContainText("Fill known language");

    await page.getByLabel("Known language").fill("English");
    await page.getByLabel("Target language").fill("Spanish");
    await page.getByLabel("Theme").fill("lost phone at a train station");
    await page.getByLabel("Vocabulary focus").fill("travel verbs");

    await expect(page.getByRole("button", { name: "Copy Prompt" }).first()).toBeEnabled();
    await expect(page.getByLabel("Prompt preview")).toContainText("- Known language: English");
    await expect(page.getByLabel("Prompt preview")).toContainText("- Target language: Spanish");
    await expect(page.getByLabel("Prompt preview")).toContainText("- Theme: lost phone");
    await expect(page.getByLabel("Prompt preview")).toContainText("- Vocabulary focus: travel verbs");
    await expect(page.getByLabel("Prompt preview")).toContainText('"avoidTopics": null');

    await page.getByRole("button", { name: "Copy Prompt" }).first().click();
    await expect(page.getByRole("status")).toContainText("Prompt copied.");
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain("language-learning reading story");
  });
});
