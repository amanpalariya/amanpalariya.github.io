import { expect, test } from "../../support/fixtures";
import {
  expectChapterContains,
  expectImageManifestMatchesFiles,
  expectWellFormedEpubPackage,
  imageFiles,
  loadEpubArchive,
} from "./epub-assertions";

test.describe("EPUB Maker download", () => {
  test("generates a valid EPUB download from multiple pages", async ({ epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.titleInput.fill("Download Test Book");
    await epubMaker.addTextPage("Download chapter\n\nA small page for exercising EPUB generation.");
    await epubMaker.addHtmlPage("<h1>Second chapter</h1><p>HTML page content.</p>");
    await expect(epubMaker.saveButton).toBeEnabled();

    const download = await epubMaker.generateDownload();
    const archive = await loadEpubArchive(download);

    expect(download.suggestedFilename()).toBe("Download Test Book.epub");
    await expectWellFormedEpubPackage(archive, {
      title: "Download Test Book",
      spineHrefs: ["chapters/chapter-1.xhtml", "chapters/chapter-2.xhtml"],
      navLabels: ["Download chapter A small page for exercising EPUB...", "Second chapter"],
      coverIncluded: true,
    });
    await expectImageManifestMatchesFiles(archive);
    expect(imageFiles(archive).length).toBeGreaterThanOrEqual(1);
    await expectChapterContains(archive, 1, "Download chapter");
    await expectChapterContains(archive, 2, "HTML page content.");
  });
});
