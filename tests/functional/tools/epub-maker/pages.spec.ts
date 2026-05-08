import { expect, test } from "../../support/fixtures";

test.describe("EPUB Maker page drafts", () => {
  test("adds, renames, removes, undoes, and redoes a text page", async ({ page, epubMaker }) => {
    await epubMaker.goto();

    await expect(epubMaker.saveButton).toBeDisabled();
    await expect(epubMaker.undoButton).toBeDisabled();
    await expect(epubMaker.redoButton).toBeDisabled();

    await epubMaker.addTextPage(
      "Functional test chapter\n\nThis page was created by a Playwright smoke test.",
    );

    const chapterTitle = epubMaker.pageTitleInput(1);
    await expect(chapterTitle).toHaveValue("Functional test chapter This page was created by...");
    await expect(epubMaker.saveButton).toBeEnabled();
    await expect(epubMaker.undoButton).toBeEnabled();

    await chapterTitle.fill("Renamed chapter");
    await chapterTitle.press("Enter");
    await expect(chapterTitle).toHaveValue("Renamed chapter");

    await page.getByRole("button", { name: "Remove page" }).click();
    await expect(chapterTitle).toHaveCount(0);
    await expect(epubMaker.saveButton).toBeDisabled();

    await epubMaker.undoButton.click();
    await expect(epubMaker.pageTitleInput(1)).toHaveValue("Renamed chapter");

    await page.keyboard.press("Control+Z");
    await expect(epubMaker.pageTitleInput(1)).toHaveValue(
      "Functional test chapter This page was created by...",
    );

    await page.keyboard.press("Control+Y");
    await expect(epubMaker.pageTitleInput(1)).toHaveValue("Renamed chapter");
  });

  test("skips duplicate pasted content and keeps one draft page", async ({ page, epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.addTextPage("Duplicate chapter\n\nOnly one copy should be kept.");
    await epubMaker.addTextPage("Duplicate chapter\n\nOnly one copy should be kept.");

    await expect(epubMaker.pageTitleInput(1)).toBeVisible();
    await expect(epubMaker.pageTitleInput(2)).toHaveCount(0);
    await expect(page.getByText("Page already added")).toBeVisible();
  });
});
