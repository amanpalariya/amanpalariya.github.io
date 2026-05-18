import { expect, test } from "../../support/fixtures";

async function dispatchPasteOnFocusedElement(page: import("@playwright/test").Page, text: string) {
  await page.evaluate((pastedText) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", pastedText);
    document.activeElement?.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData,
      }),
    );
  }, text);
}

function validStory() {
  return {
    story: {
      title: "El tren",
      targetLanguage: "Spanish",
      knownLanguage: "English",
      level: "A1",
      estimatedMinutes: 3,
    },
    paragraphs: [
      {
        sentences: [
          {
            text: "Lina entra.",
            translation: "Lina enters.",
            note: "Entra is present tense.",
          },
          {
            text: "Mira el tren.",
            translation: "She looks at the train.",
          },
        ],
      },
    ],
  };
}

test.describe("Bilingual Story Reader shell", () => {
  test("shows setup and paste actions", async ({ page }) => {
    const response = await page.goto("/tools/bilingual-story-reader");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Bilingual Story Reader" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story Setup" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Manual Paste" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copy Prompt" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "View generated prompt" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Open story reader help" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Load Story from Clipboard" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Show manual paste" })).toBeEnabled();
    await expect(page.getByText("Ready", { exact: true })).toHaveCount(0);
    await expect(page.getByLabel("Known language")).toHaveValue("English");
    await expect(page.getByLabel("Target language")).toHaveValue("Spanish");
    await expect(page.getByLabel("Level")).not.toHaveValue("Custom");
    await expect(page.getByRole("textbox", { name: "Generated prompt" })).toBeHidden();
    await expect(page.getByText("Clipboard responses are checked locally in your browser.")).toBeHidden();
    await expect(page.getByText("Copy the prompt.", { exact: true })).toBeHidden();
  });

  test("generates and copies a simplified prompt from defaults", async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/tools/bilingual-story-reader");

    await expect(page.getByRole("button", { name: "Copy Prompt" })).toBeEnabled();
    await page.getByRole("button", { name: "View generated prompt" }).click();
    const promptTextbox = page.getByRole("textbox", { name: "Generated prompt" });
    await expect(promptTextbox).toContainText("- Known language: English");
    await expect(promptTextbox).toContainText("- Target language: Spanish");
    await expect(promptTextbox).toContainText("- Theme: Automatic");
    await expect(promptTextbox).toContainText(
      "Keep each note one short sentence",
    );
    await expect(promptTextbox).toContainText("```json");
    await expect(promptTextbox).toContainText('"translation"');
    await expect(promptTextbox).not.toContainText('"summary"');
    await expect(promptTextbox).not.toContainText('"schemaVersion"');
    await expect(promptTextbox).not.toContainText('"naturalTranslation"');

    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByText("Edits are temporary and are not saved to the setup.")).toBeVisible();
    await promptTextbox.fill("custom edited prompt");
    await page.getByRole("button", { name: "Copy generated prompt" }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe("custom edited prompt");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Copy Prompt" }).click();
    await expect(page.getByText("Copied", { exact: true })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain("language-learning reading story");
  });

  test("updates level without crashing and reflects beginner constraints", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByLabel("Level").selectOption("Beginner");

    await expect(page.getByLabel("Level")).toHaveValue("Beginner");
    await page.getByRole("button", { name: "View generated prompt" }).click();
    const promptTextbox = page.getByRole("textbox", { name: "Generated prompt" });
    await expect(promptTextbox).toContainText("- Learner level: Beginner");
    await expect(promptTextbox).toContainText('"level": "Beginner"');
  });

  test("parses and reports pasted AI responses", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
    const responseInput = page.getByLabel("AI response");
    await responseInput.fill('```json\n{"story":{"title":"Hola"}}\n```');
    await page.getByRole("button", { name: "Load Story", exact: true }).click();

    await expect(page.getByText("Removed Markdown code fence around the JSON.")).toBeVisible();
    await expect(page.getByText("Response parsed.")).toBeVisible();
    await expect(responseInput).toHaveValue('```json\n{"story":{"title":"Hola"}}\n```');
  });

  test("shows a plain error for invalid JSON", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
    await page.getByLabel("AI response").fill('{"story": {}\n  "paragraphs": []}');
    await page.getByRole("button", { name: "Load Story", exact: true }).click();

    await expect(page.getByText("Line 2, column 3")).toBeVisible();
  });

  test("validates and renders a basic story", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
    await page.getByLabel("AI response").fill(JSON.stringify(validStory()));
    await page.getByRole("button", { name: "Load Story", exact: true }).click();

    await expect(page.getByText("Story loaded", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Story Setup" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copy Prompt" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "View generated prompt" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open story reader help" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Load Story from Clipboard" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Edit Prompt" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "El tren" })).toBeVisible();
    await expect(page.getByText("Spanish from English")).toBeVisible();
    await expect(page.getByText("A1", { exact: true })).toBeVisible();
    await expect(page.getByText("1 paragraph")).toBeVisible();
    await expect(page.getByText("2 sentences")).toBeVisible();
    await expect(page.getByText("3 min")).toBeVisible();
    await expect(page.getByText("Paragraph 1 of 1")).toHaveCount(0);
    await expect(page.locator("article").getByText("Lina entra.", { exact: true })).toBeVisible();
  });

  test("shows sentence translation and concise note in a popover", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
    await page.getByLabel("AI response").fill(JSON.stringify(validStory()));
    await page.getByRole("button", { name: "Load Story", exact: true }).click();

    await expect(page.getByRole("heading", { name: "El tren" })).toBeVisible();
    await expect(page.getByText("Sentence Translation")).toHaveCount(0);

    const sentenceButton = page.getByRole("button", {
      name: "Open translation for sentence 1",
    });
    const beforeHelpBox = await sentenceButton.boundingBox();
    expect(beforeHelpBox).not.toBeNull();

    await sentenceButton.click();
    await expect(page.getByText("Translation", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Lina enters.", { exact: true })).toBeVisible();
    await expect(page.getByText("Note")).toHaveCount(0);
    await expect(page.getByText("Entra is present tense.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reveal next" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Check paragraph" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "entra help" })).toHaveCount(0);

    const afterHelpBox = await sentenceButton.boundingBox();
    expect(afterHelpBox).not.toBeNull();
    expect(afterHelpBox?.width ?? 0).toBeCloseTo(beforeHelpBox?.width ?? 0, 1);
    expect(afterHelpBox?.height ?? 0).toBeCloseTo(beforeHelpBox?.height ?? 0, 1);

    await page.getByRole("button", { name: "Close sentence help" }).click();
    await expect(page.getByText("Sentence Translation")).toHaveCount(0);

    await page.getByRole("button", { name: "Open translation for sentence 2" }).click();
    await expect(page.getByText("She looks at the train.")).toBeVisible();
    await expect(page.getByText("Note")).toHaveCount(0);
  });

  test("auto-reads pasted manual responses and rejects pasted prompts", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "View generated prompt" }).click();
    const prompt = await page.getByRole("textbox", { name: "Generated prompt" }).inputValue();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Show manual paste" }).click();
    await page.getByLabel("AI response").focus();
    await dispatchPasteOnFocusedElement(page, prompt);

    await expect(page.getByText("That is the prompt")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story title in the target language" })).toHaveCount(0);

    await page.getByLabel("AI response").focus();
    await dispatchPasteOnFocusedElement(
      page,
      JSON.stringify({
        story: {
          title: "El mercado",
          targetLanguage: "Spanish",
          knownLanguage: "English",
          level: "A1",
        },
        paragraphs: [
          {
            sentences: [
              {
                text: "Ana mira pan.",
                translation: "Ana looks at bread.",
              },
            ],
          },
        ],
      }),
    );

    await expect(page.getByRole("heading", { name: "El mercado" })).toBeVisible();
  });
});
