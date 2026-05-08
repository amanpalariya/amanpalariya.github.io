import { expect, test } from "../../support/fixtures";

test.describe("EPUB Maker metadata and options", () => {
  test("updates auto filename from title and author but preserves manual filename", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();

    await epubMaker.titleInput.fill("Auto Named Book");
    await epubMaker.authorInput.fill("Auto Author");
    await expect(epubMaker.fileNameInput).toHaveValue("Auto Named Book - Auto Author.epub");

    await page.getByRole("button", { name: "Auto", exact: true }).click();
    await epubMaker.fileNameInput.fill("manual-name");
    await expect(page.getByRole("button", { name: "Manual", exact: true })).toBeVisible();

    await epubMaker.titleInput.fill("Changed Title");
    await epubMaker.authorInput.fill("Changed Author");
    await expect(epubMaker.fileNameInput).toHaveValue("manual-name");
  });

  test("sanitizes manual filename for generated downloads", async ({ page, epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.addTextPage("Filename chapter\n\nManual names should be filesystem safe.");
    await page.getByRole("button", { name: "Auto", exact: true }).click();
    await epubMaker.fileNameInput.fill('bad/name:*?"<>|');

    const download = await epubMaker.generateDownload();

    expect(download.suggestedFilename()).toBe("badname.epub");
  });

  test("persists metadata, manual file name mode, and generation options across refreshes", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();

    await epubMaker.titleInput.fill("Functional Book");
    await epubMaker.authorInput.fill("Test Author");
    await expect(epubMaker.fileNameInput).toHaveValue("Functional Book - Test Author.epub");

    await page.getByRole("button", { name: "Auto", exact: true }).click();
    await epubMaker.fileNameInput.fill("manual-functional-book");
    await expect(page.getByRole("button", { name: "Manual", exact: true })).toBeVisible();
    await expect(epubMaker.fileNameInput).toHaveValue("manual-functional-book");

    await page.getByRole("checkbox", { name: "Embed remote images" }).setChecked(false, {
      force: true,
    });
    await page.getByRole("checkbox", { name: "Keep external links" }).setChecked(false, {
      force: true,
    });
    await expect(page.getByRole("checkbox", { name: "Embed remote images" })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Keep external links" })).not.toBeChecked();

    await page.reload();

    await expect(epubMaker.titleInput).toHaveValue("Functional Book");
    await expect(epubMaker.authorInput).toHaveValue("Test Author");
    await expect(page.getByRole("button", { name: "Manual", exact: true })).toBeVisible();
    await expect(epubMaker.fileNameInput).toHaveValue("manual-functional-book");
    await expect(page.getByRole("checkbox", { name: "Embed remote images" })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Keep external links" })).not.toBeChecked();
  });
});
