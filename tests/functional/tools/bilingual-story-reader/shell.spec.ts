import { expect, test } from "../../support/fixtures";

test.describe("Bilingual Story Reader shell", () => {
  test("shows setup, paste, and disabled empty-state actions", async ({ page }) => {
    const response = await page.goto("/tools/bilingual-story-reader");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Bilingual Story Reader" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story Setup" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Manual Paste" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copy Prompt" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Paste Response" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Manual Paste" })).toBeEnabled();
    await expect(page.getByText("Ready", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Known language")).toHaveValue("English");
    await expect(page.getByLabel("Target language")).toHaveValue("Spanish");
  });

  test("generates and copies a prompt from defaults with automatic theme", async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/tools/bilingual-story-reader");

    await expect(page.getByRole("button", { name: "Copy Prompt" })).toBeEnabled();
    await expect(page.getByLabel("Prompt preview")).toContainText("- Known language: English");
    await expect(page.getByLabel("Prompt preview")).toContainText("- Target language: Spanish");
    await expect(page.getByLabel("Prompt preview")).toContainText("- Theme: Automatic");

    await page.getByRole("button", { name: "Copy Prompt" }).click();
    await expect(page.getByText("Prompt copied")).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain("language-learning reading story");
  });

  test("parses and reports pasted AI responses", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Manual Paste" }).click();
    const responseInput = page.getByLabel("AI response");
    await responseInput.fill('```json\n{"schemaVersion":"1.0","story":{"title":"Hola"}}\n```');
    await page.getByRole("button", { name: "Read Story" }).click();

    await expect(page.getByText("Removed Markdown code fence around the JSON.")).toBeVisible();
    await expect(page.getByText("Response parsed.")).toBeVisible();
    await expect(responseInput).toHaveValue(
      '```json\n{"schemaVersion":"1.0","story":{"title":"Hola"}}\n```',
    );
  });

  test("shows a plain error for invalid JSON", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Manual Paste" }).click();
    await page.getByLabel("AI response").fill('{"schemaVersion":"1.0"\n  "story": {}}');
    await page.getByRole("button", { name: "Read Story" }).click();

    await expect(page.getByText("Line 2, column 3")).toBeVisible();
  });

  test("validates and renders a basic story", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Manual Paste" }).click();
    await page.getByLabel("AI response").fill(
      JSON.stringify({
        schemaVersion: "1.0",
        story: {
          title: "El tren",
          targetLanguage: { name: "Spanish", direction: "ltr" },
          knownLanguage: { name: "English", direction: "ltr" },
          level: "A1",
          summary: "A short train-station story.",
        },
        paragraphs: [
          {
            id: "p1",
            sentences: [
              {
                id: "s1",
                text: "Lina entra.",
                naturalTranslation: "Lina enters.",
                segments: [
                  { text: "Lina " },
                  { text: "entra", kind: "word", meaning: "enters" },
                  { text: "." },
                ],
              },
            ],
          },
        ],
      }),
    );
    await page.getByRole("button", { name: "Read Story" }).click();

    await expect(page.getByText("Story loaded", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story Setup" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Manual Paste" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "El tren" })).toBeVisible();
    await expect(page.getByText("Spanish from English · A1")).toBeVisible();
    await expect(page.getByText("Paragraph 1 of 1")).toBeVisible();
    await expect(page.locator("article").getByText("Lina entra.", { exact: true })).toBeVisible();
  });
});
