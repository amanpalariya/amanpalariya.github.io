import { expect, test } from "../../support/fixtures";

test.describe("Bilingual Story Reader shell", () => {
  test("shows setup, paste, and disabled empty-state actions", async ({ page }) => {
    const response = await page.goto("/tools/bilingual-story-reader");

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
    await page.goto("/tools/bilingual-story-reader");

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

  test("parses, formats, and reports JSON paste results", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    const storyJson = page.getByLabel("Story JSON");
    await storyJson.fill('```json\n{"schemaVersion":"1.0","story":{"title":"Hola"}}\n```');
    await page.getByRole("button", { name: "Render Story" }).click();

    await expect(page.getByText("Removed Markdown code fence around the JSON.")).toBeVisible();
    await expect(page.getByText("JSON parsed.")).toBeVisible();
    await expect(page.getByText("JSON parsed").first()).toBeVisible();

    await page.getByRole("button", { name: "Format JSON" }).click();
    await expect(storyJson).toHaveValue(
      '{\n  "schemaVersion": "1.0",\n  "story": {\n    "title": "Hola"\n  }\n}\n',
    );
  });

  test("shows a plain error for invalid JSON", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByLabel("Story JSON").fill('{"schemaVersion":"1.0"\n  "story": {}}');
    await page.getByRole("button", { name: "Render Story" }).click();

    await expect(page.getByText("Line 2, column 3")).toBeVisible();
  });

  test("validates and renders a basic story", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByLabel("Story JSON").fill(
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
    await page.getByRole("button", { name: "Render Story" }).click();

    await expect(page.getByText("Story loaded")).toBeVisible();
    await expect(page.getByRole("heading", { name: "El tren" })).toBeVisible();
    await expect(page.getByText("Spanish from English · A1")).toBeVisible();
    await expect(page.getByText("Paragraph 1 of 1")).toBeVisible();
    await expect(page.locator("article").getByText("Lina entra.", { exact: true })).toBeVisible();
  });
});
