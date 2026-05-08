import { expect, test } from "../../support/fixtures";

async function dispatchGlobalPaste(page: import("@playwright/test").Page, text: string) {
  await page.evaluate((pastedText) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", pastedText);
    document.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData,
      }),
    );
  }, text);
}

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

test.describe("EPUB Maker keyboard and paste behavior", () => {
  test("global paste adds a page when focus is outside editable fields", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();

    await dispatchGlobalPaste(page, "Global pasted chapter\n\nAdded from the window paste handler.");

    await expect(epubMaker.pageTitleInput(1)).toHaveValue(
      "Global pasted chapter Added from the window paste...",
    );
  });

  test("paste and undo shortcuts do not affect pages while focus is in editable fields", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();
    await epubMaker.addTextPage("Editable guard chapter\n\nThe page should stay in place.");

    await epubMaker.titleInput.focus();
    await dispatchPasteOnFocusedElement(page, "Should not become a page");
    await expect(epubMaker.pageTitleInput(2)).toHaveCount(0);

    await epubMaker.pageTitleInput(1).fill("Focused page title");
    await page.keyboard.press("Control+Z");
    await expect(epubMaker.pageTitleInput(1)).toBeVisible();
    await expect(epubMaker.pageTitleInput(2)).toHaveCount(0);
  });
});
