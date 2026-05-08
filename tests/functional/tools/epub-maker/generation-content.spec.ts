import { expect, test } from "../../support/fixtures";
import {
  expectImageManifestMatchesFiles,
  expectPackagedImageReferencesResolve,
  expectWellFormedEpubPackage,
  imageFiles,
  loadEpubArchive,
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
});
