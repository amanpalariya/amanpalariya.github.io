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

test.describe("Bilingual Story Reader shell", () => {
  test("shows setup, paste, and disabled empty-state actions", async ({ page }) => {
    const response = await page.goto("/tools/bilingual-story-reader");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Bilingual Story Reader" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story Setup" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Manual Paste" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copy Prompt" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Paste Response" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Show manual paste" })).toBeEnabled();
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

  test("updates level without crashing and reflects beginner constraints", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByLabel("Level").selectOption("Beginner");

    await expect(page.getByLabel("Level")).toHaveValue("Beginner");
    await expect(page.getByLabel("Prompt preview")).toContainText("- Learner level: Beginner");
    await expect(page.getByLabel("Prompt preview")).toContainText(
      '"level": "Beginner"',
    );
  });

  test("parses and reports pasted AI responses", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
    const responseInput = page.getByLabel("AI response");
    await responseInput.fill('```json\n{"schemaVersion":"1.0","story":{"title":"Hola"}}\n```');
    await page.getByRole("button", { name: "Read pasted response" }).click();

    await expect(page.getByText("Removed Markdown code fence around the JSON.")).toBeVisible();
    await expect(page.getByText("Response parsed.")).toBeVisible();
    await expect(responseInput).toHaveValue(
      '```json\n{"schemaVersion":"1.0","story":{"title":"Hola"}}\n```',
    );
  });

  test("shows a plain error for invalid JSON", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
    await page.getByLabel("AI response").fill('{"schemaVersion":"1.0"\n  "story": {}}');
    await page.getByRole("button", { name: "Read pasted response" }).click();

    await expect(page.getByText("Line 2, column 3")).toBeVisible();
  });

  test("validates and renders a basic story", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
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
    await page.getByRole("button", { name: "Read pasted response" }).click();

    await expect(page.getByText("Story loaded", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story Setup" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copy Prompt" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Paste Response" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Adjust Prompt" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "El tren" })).toBeVisible();
    await expect(page.getByText("Spanish from English · A1")).toBeVisible();
    await expect(page.getByText("Paragraph 1 of 1")).toBeVisible();
    await expect(page.locator("article").getByText("Lina entra.", { exact: true })).toBeVisible();
  });

  test("shows sentence and word help in popovers", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
    await page.getByLabel("AI response").fill(
      JSON.stringify({
        schemaVersion: "1.0",
        story: {
          title: "El tren",
          targetLanguage: { name: "Spanish", direction: "ltr" },
          knownLanguage: { name: "English", direction: "ltr" },
          level: "A1",
        },
        paragraphs: [
          {
            id: "p1",
            sentences: [
              {
                id: "s1",
                text: "Lina entra.",
                clue: "A person goes in.",
                meaning: "Lina enters a place.",
                naturalTranslation: "Lina enters.",
                literalTranslation: "Lina enters.",
                grammarNotes: [
                  {
                    topic: "Verb",
                    explanation: "Entra is a present-tense verb.",
                  },
                ],
                wordByWord: [
                  { text: "Lina", meaning: "Lina" },
                  { text: "entra", meaning: "enters" },
                ],
                segments: [
                  { text: "Lina ", kind: "word", meaning: "Lina" },
                  {
                    text: "entra",
                    kind: "word",
                    lemma: "entrar",
                    partOfSpeech: "verb",
                    meaning: "enters",
                  },
                  { text: "." },
                ],
              },
            ],
          },
        ],
      }),
    );
    await page.getByRole("button", { name: "Read pasted response" }).click();

    await expect(page.getByRole("heading", { name: "El tren" })).toBeVisible();
    await expect(page.getByText("Sentence Help")).toHaveCount(0);

    await page.getByRole("button", { name: "Lina entra. sentence help" }).dblclick();
    await expect(page.getByText("A person goes in.")).toBeVisible();
    await expect(page.getByText("Lina enters a place.")).toBeVisible();
    await expect(page.getByText("Lina enters.", { exact: true })).toBeVisible();
    await expect(page.getByText("Why it works")).toBeVisible();
    await expect(page.getByText("Entra is a present-tense verb.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reveal next" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reset Reveals" })).toHaveCount(0);

    await page.getByRole("button", { name: "Close sentence help" }).click();
    await expect(page.getByText("Sentence Help")).toHaveCount(0);

    await page.getByRole("button", { name: "entra help" }).click();
    await expect(page.getByText("entrar")).toBeVisible();
    await expect(page.getByText("verb")).toBeVisible();
    await page.getByRole("button", { name: "Close word help" }).click();
    await expect(page.getByText("entrar")).toHaveCount(0);
  });

  test("shows paragraph checks in a popover", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    await page.getByRole("button", { name: "Show manual paste" }).click();
    await page.getByLabel("AI response").fill(
      JSON.stringify({
        schemaVersion: "1.0",
        story: {
          title: "El parque",
          targetLanguage: { name: "Spanish", direction: "ltr" },
          knownLanguage: { name: "English", direction: "ltr" },
          level: "A1",
        },
        paragraphs: [
          {
            id: "p1",
            summary: "Ana finds a quiet place in the park.",
            keyPoint: "Ana is in the park and sees a bench.",
            question: "Where is Ana?",
            answer: "Ana is in the park.",
            sentences: [
              {
                id: "s1",
                text: "Ana está en el parque.",
                naturalTranslation: "Ana is in the park.",
              },
            ],
          },
        ],
      }),
    );
    await page.getByRole("button", { name: "Read pasted response" }).click();

    await page.getByRole("button", { name: "Check paragraph" }).click();
    await expect(page.getByText("Where is Ana?")).toBeVisible();
    await expect(page.getByText("Ana is in the park and sees a bench.")).toBeVisible();
    await expect(page.getByText("Ana finds a quiet place in the park.")).toBeVisible();
    await expect(page.getByText("Ana is in the park.", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reveal next" })).toHaveCount(0);

    await page.getByRole("button", { name: "Close paragraph check" }).click();
    await expect(page.getByText("Where is Ana?")).toHaveCount(0);
  });

  test("auto-reads pasted manual responses and rejects pasted prompts", async ({ page }) => {
    await page.goto("/tools/bilingual-story-reader");

    const prompt = await page.getByLabel("Prompt preview").inputValue();
    await page.getByRole("button", { name: "Show manual paste" }).click();
    await page.getByLabel("AI response").focus();
    await dispatchPasteOnFocusedElement(page, prompt);

    await expect(page.getByText("That is the prompt")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Story title in the target language" })).toHaveCount(0);

    await page.getByLabel("AI response").focus();
    await dispatchPasteOnFocusedElement(
      page,
      JSON.stringify({
        schemaVersion: "1.0",
        story: {
          title: "El mercado",
          targetLanguage: { name: "Spanish", direction: "ltr" },
          knownLanguage: { name: "English", direction: "ltr" },
          level: "A1",
        },
        paragraphs: [
          {
            id: "p1",
            sentences: [
              {
                id: "s1",
                text: "Ana mira pan.",
                naturalTranslation: "Ana looks at bread.",
              },
            ],
          },
        ],
      }),
    );

    await expect(page.getByRole("heading", { name: "El mercado" })).toBeVisible();
  });
});
