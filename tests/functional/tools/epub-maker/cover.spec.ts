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

async function expectCoverImageDimensions(
  archive: Awaited<ReturnType<typeof loadEpubArchive>>,
  expectedDimensions: { width: number; height: number },
) {
  const cover = await archive.text("OEBPS/cover.xhtml");
  const coverImageSrc = imageSrcsFromXhtml(cover)[0];
  expect(coverImageSrc).toBeTruthy();
  const { dimensions } = await expectPngImage(
    archive,
    resolveImageSrc("OEBPS/cover.xhtml", coverImageSrc),
    expectedDimensions,
  );
  expect(dimensions).not.toEqual({ width: 1600, height: 2560 });
}

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

  test("uses the selected non-default cover size in the generated EPUB image", async ({
    epubMaker,
  }) => {
    await epubMaker.goto();

    await epubMaker.selectCoverSizePreset("Square 1:1");
    await epubMaker.titleInput.fill("Square Cover Book");
    await epubMaker.authorInput.fill("Cover Author");
    await epubMaker.addTextPage("Square cover chapter\n\nThe cover should use a square preset.");

    const archive = await loadEpubArchive(await epubMaker.generateDownload());

    await expectWellFormedEpubPackage(archive, {
      title: "Square Cover Book",
      creator: "Cover Author",
      spineHrefs: ["chapters/chapter-1.xhtml"],
      navLabels: ["Square cover chapter The cover should use a..."],
      coverIncluded: true,
    });
    await expectImageManifestMatchesFiles(archive);
    await expectCoverImageDimensions(archive, { width: 1800, height: 1800 });
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

  test("omits cover XHTML and images when cover is disabled after changing cover settings", async ({
    epubMaker,
  }) => {
    await epubMaker.goto();

    await epubMaker.selectCoverSizePreset("Square 1:1");
    await epubMaker.disableCoverButton.click();
    await expect(epubMaker.enableCoverButton).toBeVisible();

    await epubMaker.addTextPage("Disabled square cover\n\nNo cover image should be packaged.");
    const archive = await loadEpubArchive(await epubMaker.generateDownload());

    await expectWellFormedEpubPackage(archive, {
      title: "EPUB Maker",
      spineHrefs: ["chapters/chapter-1.xhtml"],
      navLabels: ["Disabled square cover No cover image should be..."],
      coverIncluded: false,
    });
    await expectImageManifestMatchesFiles(archive);
    expect(archive.fileNames).not.toContain("OEBPS/cover.xhtml");
    expect(imageFiles(archive)).toEqual([]);
  });
});
