import { expect, test } from "../../support/fixtures";
import {
  expectImageManifestMatchesFiles,
  expectPngImage,
  expectWellFormedEpubPackage,
  imageFiles,
  imageSrcsFromXhtml,
  loadEpubArchive,
  resolveImageSrc,
} from "./epub-assertions";

test.describe("EPUB Maker cover", () => {
  test("includes generated cover XHTML and cover image in the EPUB", async ({ epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.titleInput.fill("Generated Cover Book");
    await epubMaker.authorInput.fill("Cover Author");
    await epubMaker.addTextPage("Covered chapter\n\nThe generated cover should be packaged.");

    const archive = await loadEpubArchive(await epubMaker.generateDownload());
    const cover = await archive.text("OEBPS/cover.xhtml");

    await expectWellFormedEpubPackage(archive, {
      title: "Generated Cover Book",
      creator: "Cover Author",
      spineHrefs: ["chapters/chapter-1.xhtml"],
      navLabels: ["Covered chapter The generated cover should be packaged...."],
      coverIncluded: true,
    });
    await expectImageManifestMatchesFiles(archive);
    expect(imageFiles(archive).length).toBeGreaterThanOrEqual(1);
    expect(cover).toContain("images/image-");
    expect(cover).toContain('class="cover-page"');

    const coverImageSrc = imageSrcsFromXhtml(cover)[0];
    expect(coverImageSrc).toBeTruthy();
    await expectPngImage(archive, resolveImageSrc("OEBPS/cover.xhtml", coverImageSrc), {
      width: 1600,
      height: 2560,
    });
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

    await expectWellFormedEpubPackage(archive, {
      title: "EPUB Maker",
      spineHrefs: ["chapters/chapter-1.xhtml"],
      navLabels: ["No cover chapter Cover is disabled for this..."],
      coverIncluded: false,
    });
    await expectImageManifestMatchesFiles(archive);
    expect(imageFiles(archive)).toEqual([]);
  });
});
