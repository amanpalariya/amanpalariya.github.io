import { expect, test } from "../../support/fixtures";
import { imageFiles, loadEpubArchive } from "./epub-assertions";

test.describe("EPUB Maker cover", () => {
  test("includes generated cover XHTML and cover image in the EPUB", async ({ epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.titleInput.fill("Generated Cover Book");
    await epubMaker.authorInput.fill("Cover Author");
    await epubMaker.addTextPage("Covered chapter\n\nThe generated cover should be packaged.");

    const archive = await loadEpubArchive(await epubMaker.generateDownload());
    const opf = await archive.text("OEBPS/content.opf");
    const cover = await archive.text("OEBPS/cover.xhtml");

    expect(archive.fileNames).toContain("OEBPS/cover.xhtml");
    expect(imageFiles(archive).length).toBeGreaterThanOrEqual(1);
    expect(opf).toContain('id="cover" href="cover.xhtml"');
    expect(opf).toContain('properties="cover-image"');
    expect(cover).toContain("images/image-");
  });

  test("persists cover disabled state and omits the cover from generated EPUB", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();

    await epubMaker.disableCoverButton.click();
    await expect(epubMaker.enableCoverButton).toBeVisible();
    await page.reload();
    await expect(epubMaker.enableCoverButton).toBeVisible();

    await epubMaker.addTextPage("No cover chapter\n\nCover is disabled for this EPUB.");
    const archive = await loadEpubArchive(await epubMaker.generateDownload());
    const opf = await archive.text("OEBPS/content.opf");

    expect(archive.fileNames).not.toContain("OEBPS/cover.xhtml");
    expect(imageFiles(archive)).toEqual([]);
    expect(opf).not.toContain('id="cover" href="cover.xhtml"');
    expect(opf).not.toContain('properties="cover-image"');
  });
});
