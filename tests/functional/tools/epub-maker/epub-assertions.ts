import { expect, type Download } from "@playwright/test";
import fs from "node:fs/promises";
import JSZip from "jszip";

export type EpubArchive = {
  zip: JSZip;
  fileNames: string[];
  text: (path: string) => Promise<string>;
};

export async function loadEpubArchive(download: Download): Promise<EpubArchive> {
  const downloadPath = await download.path();
  if (!downloadPath) {
    throw new Error("Playwright did not provide a path for the EPUB download.");
  }

  const bytes = await fs.readFile(downloadPath);
  const zip = await JSZip.loadAsync(bytes);
  const fileNames = Object.keys(zip.files).filter((fileName) => !zip.files[fileName].dir);

  return {
    zip,
    fileNames,
    text: async (path: string) => {
      const file = zip.file(path);
      if (!file) {
        throw new Error(`EPUB file not found: ${path}`);
      }
      return file.async("string");
    },
  };
}

export function expectEpubCoreFiles(archive: EpubArchive) {
  expect(archive.fileNames).toEqual(
    expect.arrayContaining([
      "mimetype",
      "META-INF/container.xml",
      "OEBPS/content.opf",
      "OEBPS/nav.xhtml",
      "OEBPS/toc.ncx",
    ]),
  );
}

export function imageFiles(archive: EpubArchive) {
  return archive.fileNames.filter((fileName) => /^OEBPS\/images\/image-\d+\./.test(fileName));
}

export async function expectChapterContains(
  archive: EpubArchive,
  chapterNumber: number,
  expectedText: string,
) {
  await expect(await archive.text(`OEBPS/chapters/chapter-${chapterNumber}.xhtml`)).toContain(
    expectedText,
  );
}
