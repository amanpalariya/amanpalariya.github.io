import { expect, test } from "../../support/fixtures";

test.describe("Bilingual Story Reader shell", () => {
  test("shows setup, paste, and disabled empty-state actions", async ({ page }) => {
    const response = await page.goto("/tools/story-reader");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Bilingual Story Reader" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story Setup" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Paste JSON" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Prompt" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Render Story" })).toBeDisabled();
    await expect(page.getByText("No story loaded")).toBeVisible();
  });
});

