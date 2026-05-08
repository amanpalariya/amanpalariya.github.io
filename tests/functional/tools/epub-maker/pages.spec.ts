import { expect, test } from "../../support/fixtures";

test.describe("EPUB Maker page drafts", () => {
  test("adds multiple pages, renames, removes the middle page, undoes, and redoes", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();

    await expect(epubMaker.saveButton).toBeDisabled();
    await expect(epubMaker.undoButton).toBeDisabled();
    await expect(epubMaker.redoButton).toBeDisabled();

    await epubMaker.addTextPage(
      "Functional test chapter\n\nThis page was created by a Playwright smoke test.",
    );
    await epubMaker.addHtmlPage("<h1>HTML chapter</h1><p>This came from pasted HTML.</p>");
    await epubMaker.addHtmlPage("<h1>Final chapter</h1><p>The third page should be renumbered.</p>");

    const chapterTitle = epubMaker.pageTitleInput(1);
    await expect(chapterTitle).toHaveValue("Functional test chapter This page was created by...");
    await expect(epubMaker.pageTitleInput(2)).toHaveValue("HTML chapter");
    await expect(epubMaker.pageTitleInput(3)).toHaveValue("Final chapter");
    await expect(epubMaker.saveButton).toBeEnabled();
    await expect(epubMaker.undoButton).toBeEnabled();

    await chapterTitle.fill("Renamed chapter");
    await chapterTitle.press("Enter");
    await expect(chapterTitle).toHaveValue("Renamed chapter");

    await page.getByRole("button", { name: "Remove page" }).nth(1).click();
    await expect(epubMaker.pageTitleInput(1)).toHaveValue("Renamed chapter");
    await expect(epubMaker.pageTitleInput(2)).toHaveValue("Final chapter");
    await expect(epubMaker.pageTitleInput(3)).toHaveCount(0);

    await epubMaker.undoButton.click();
    await expect(epubMaker.pageTitleInput(1)).toHaveValue("Renamed chapter");
    await expect(epubMaker.pageTitleInput(2)).toHaveValue("HTML chapter");
    await expect(epubMaker.pageTitleInput(3)).toHaveValue("Final chapter");

    await epubMaker.redoButton.click();
    await expect(epubMaker.pageTitleInput(1)).toHaveValue("Renamed chapter");
    await expect(epubMaker.pageTitleInput(2)).toHaveValue("Final chapter");

    await page.keyboard.press("Control+Z");
    await expect(epubMaker.pageTitleInput(2)).toHaveValue("HTML chapter");

    await page.keyboard.press("Control+Z");
    await expect(epubMaker.pageTitleInput(1)).toHaveValue(
      "Functional test chapter This page was created by...",
    );

    await page.keyboard.press("Control+Y");
    await expect(epubMaker.pageTitleInput(1)).toHaveValue("Renamed chapter");
  });

  test("keeps the previous title when a rename is blank", async ({ epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.addTextPage("Stable title\n\nBlank rename should not erase this title.");
    const chapterTitle = epubMaker.pageTitleInput(1);
    await expect(chapterTitle).toHaveValue("Stable title Blank rename should not erase this...");

    await chapterTitle.fill("   ");
    await chapterTitle.press("Enter");

    await expect(chapterTitle).toHaveValue("Stable title Blank rename should not erase this...");
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
