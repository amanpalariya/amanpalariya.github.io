import { expect, test } from "../../support/fixtures";

test.describe("EPUB Maker download", () => {
  test("generates an EPUB download from a text page", async ({ page, epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.titleInput.fill("Download Test Book");
    await epubMaker.addTextPage("Download chapter\n\nA small page for exercising EPUB generation.");
    await expect(epubMaker.saveButton).toBeEnabled();

    const downloadPromise = page.waitForEvent("download");
    await epubMaker.saveButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Download Test Book.epub");
  });
});
