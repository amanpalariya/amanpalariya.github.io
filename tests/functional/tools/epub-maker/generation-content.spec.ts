import { expect, test } from "../../support/fixtures";
import fs from "node:fs/promises";
import {
  expectBytesEqual,
  expectImageManifestMatchesFiles,
  expectPackagedImageReferencesResolve,
  expectPngImage,
  expectWellFormedEpubPackage,
  imageFiles,
  imageSrcsFromXhtml,
  loadEpubArchive,
  resolveImageSrc,
} from "./epub-assertions";

test.describe("EPUB Maker generated content", () => {
  test("embeds localhost remote images when enabled", async ({ page, epubMaker }) => {
    await epubMaker.goto();
    await epubMaker.titleInput.fill("Embedded Image Book");

    const iconUrl = `${new URL(page.url()).origin}/icon.png`;
    await epubMaker.addHtmlPage(
      `<h1>Image chapter</h1><p>Image below.</p><img src="${iconUrl}" alt="local icon" />`,
    );
    await epubMaker.setEmbedRemoteImages(true);

    const archive = await loadEpubArchive(await epubMaker.generateDownload());
    const chapter = await archive.text("OEBPS/chapters/chapter-1.xhtml");
    const opf = await archive.text("OEBPS/content.opf");

    await expectWellFormedEpubPackage(archive, {
      title: "Embedded Image Book",
      spineHrefs: ["chapters/chapter-1.xhtml"],
      navLabels: ["Image chapter"],
      coverIncluded: true,
    });
    await expectImageManifestMatchesFiles(archive);
    await expectPackagedImageReferencesResolve(archive);
    expect(imageFiles(archive).length).toBeGreaterThanOrEqual(2);
    expect(chapter).toContain("../images/image-");
    expect(chapter).not.toContain(iconUrl);
    expect(opf).toContain('media-type="image/png"');

    const chapterImageSrc = imageSrcsFromXhtml(chapter).find((src) => src.startsWith("../images/"));
    expect(chapterImageSrc).toBeTruthy();
    const embeddedIconPath = resolveImageSrc("OEBPS/chapters/chapter-1.xhtml", chapterImageSrc!);
    const { bytes: embeddedIconBytes, dimensions } = await expectPngImage(
      archive,
      embeddedIconPath,
      {
        width: 32,
        height: 32,
      },
    );
    expect(dimensions).toEqual({ width: 32, height: 32 });
    expectBytesEqual(embeddedIconBytes, await fs.readFile("src/app/icon.png"));
  });

  test("keeps remote image references external when image embedding is disabled", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();
    await epubMaker.titleInput.fill("External Image Book");

    const iconUrl = `${new URL(page.url()).origin}/icon.png`;
    await epubMaker.addHtmlPage(
      `<h1>External image chapter</h1><p>Image below.</p><img src="${iconUrl}" alt="local icon" />`,
    );
    await epubMaker.setEmbedRemoteImages(false);

    const archive = await loadEpubArchive(await epubMaker.generateDownload());
    const chapter = await archive.text("OEBPS/chapters/chapter-1.xhtml");

    await expectWellFormedEpubPackage(archive, {
      title: "External Image Book",
      spineHrefs: ["chapters/chapter-1.xhtml"],
      navLabels: ["External image chapter"],
      coverIncluded: true,
    });
    await expectImageManifestMatchesFiles(archive);
    await expectPackagedImageReferencesResolve(archive);
    expect(chapter).toContain(iconUrl);
    expect(chapter).not.toContain("../images/image-2");
    expect(imageFiles(archive).length).toBe(1);
  });

  test("reviews failed remote images and embeds a manual replacement", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();
    await epubMaker.titleInput.fill("Manual Image Book");

    const failedImageUrl = "https://remote-images.test/blocked-cover.png";
    await page.route(failedImageUrl, (route) => route.abort("blockedbyclient"));

    await epubMaker.addHtmlPage(
      `<h1>Manual image chapter</h1><p>Image below.</p><img src="${failedImageUrl}" alt="blocked remote" />`,
    );
    await epubMaker.setEmbedRemoteImages(true);

    await epubMaker.saveButton.click();
    const reviewDialog = page.getByRole("dialog", {
      name: "Review external images",
    });
    await expect(reviewDialog).toBeVisible();
    await expect(reviewDialog.getByText("1 of 1 selected")).toHaveCount(0);

    const replacementBytes = await fs.readFile("src/app/icon.png");
    await reviewDialog.locator('input[type="file"]').setInputFiles({
      name: "replacement-icon.png",
      mimeType: "image/png",
      buffer: replacementBytes,
    });
    await expect(reviewDialog.getByText("1 of 1 selected")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await reviewDialog.getByRole("button", { name: "Generate EPUB" }).click();
    const archive = await loadEpubArchive(await downloadPromise);
    const chapter = await archive.text("OEBPS/chapters/chapter-1.xhtml");

    await expectWellFormedEpubPackage(archive, {
      title: "Manual Image Book",
      spineHrefs: ["chapters/chapter-1.xhtml"],
      navLabels: ["Manual image chapter"],
      coverIncluded: true,
    });
    await expectImageManifestMatchesFiles(archive);
    await expectPackagedImageReferencesResolve(archive);
    expect(chapter).toContain("../images/image-");
    expect(chapter).not.toContain(failedImageUrl);

    const chapterImageSrc = imageSrcsFromXhtml(chapter).find((src) =>
      src.startsWith("../images/"),
    );
    expect(chapterImageSrc).toBeTruthy();
    const embeddedReplacementPath = resolveImageSrc(
      "OEBPS/chapters/chapter-1.xhtml",
      chapterImageSrc!,
    );
    const { bytes: embeddedReplacementBytes } = await expectPngImage(
      archive,
      embeddedReplacementPath,
      {
        width: 32,
        height: 32,
      },
    );
    expectBytesEqual(embeddedReplacementBytes, replacementBytes);
  });

  test("applies external link sanitization option to generated chapters", async ({
    epubMaker,
  }) => {
    await epubMaker.goto();
    await epubMaker.addHtmlPage(
      '<h1>Links chapter</h1><p><a href="https://example.com/path">External link</a></p>',
    );
    await epubMaker.setKeepExternalLinks(false);

    const withoutLinks = await loadEpubArchive(await epubMaker.generateDownload());
    const withoutLinksChapter = await withoutLinks.text("OEBPS/chapters/chapter-1.xhtml");
    expect(withoutLinksChapter).toContain(">External link</a>");
    expect(withoutLinksChapter).not.toContain('href="https://example.com/path"');

    await epubMaker.setKeepExternalLinks(true);
    const withLinks = await loadEpubArchive(await epubMaker.generateDownload());
    const withLinksChapter = await withLinks.text("OEBPS/chapters/chapter-1.xhtml");
    expect(withLinksChapter).toContain('href="https://example.com/path"');
  });

  test("can cancel generation while remote image embedding is in progress", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();

    const iconUrl = `${new URL(page.url()).origin}/icon.png?slow-functional=true`;
    await page.route("**/icon.png?slow-functional=true", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        body: await fs.readFile("src/app/icon.png"),
      });
    });

    await epubMaker.addHtmlPage(
      `<h1>Cancelable image chapter</h1><img src="${iconUrl}" alt="slow icon" />`,
    );
    await epubMaker.setEmbedRemoteImages(true);

    await epubMaker.saveButton.click();
    await expect(page.getByRole("button", { name: /Cancel \(\d+%\)/ })).toBeVisible();
    await page.getByRole("button", { name: /Cancel \(\d+%\)/ }).click();

    await expect(page.getByText("Generation cancelled")).toBeVisible();
    await expect(epubMaker.saveButton).toBeEnabled();
  });
});
