import { expect, type Download } from "@playwright/test";
import fs from "node:fs/promises";
import JSZip from "jszip";
import { JSDOM } from "jsdom";

export type EpubArchive = {
  zip: JSZip;
  fileNames: string[];
  bytes: (path: string) => Promise<Uint8Array>;
  text: (path: string) => Promise<string>;
};

type ManifestItem = {
  id: string;
  href: string;
  mediaType: string;
  properties: string;
  fullPath: string;
};

type PackageDocument = {
  manifestItems: ManifestItem[];
  spineIdrefs: string[];
  metadataTitle: string;
  metadataCreator: string | null;
  coverMetaId: string | null;
};

function normalizeRelativePath(baseFile: string, relativePath: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(relativePath)) return relativePath;

  const parts = baseFile.split("/");
  parts.pop();

  for (const segment of relativePath.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      parts.pop();
      continue;
    }
    parts.push(segment);
  }

  return parts.join("/");
}

function bytesToArray(value: Uint8Array | Buffer): number[] {
  return Array.from(value);
}

export function pngDimensions(bytes: Uint8Array): { width: number; height: number } {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  expect(bytesToArray(bytes.slice(0, pngSignature.length))).toEqual(pngSignature);
  expect(new TextDecoder().decode(bytes.slice(12, 16))).toBe("IHDR");

  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: dataView.getUint32(16),
    height: dataView.getUint32(20),
  };
}

export function expectBytesEqual(actual: Uint8Array, expected: Uint8Array | Buffer) {
  expect(Buffer.compare(Buffer.from(actual), Buffer.from(expected))).toBe(0);
}

function parseXml(xml: string, label: string): Document {
  const document = new JSDOM(xml, { contentType: "text/xml" }).window.document;
  const parserError = document.querySelector("parsererror");
  if (parserError) {
    throw new Error(`Malformed XML in ${label}: ${parserError.textContent ?? ""}`);
  }
  return document;
}

function textContent(document: Document, tagName: string): string {
  return document.getElementsByTagName(tagName).item(0)?.textContent ?? "";
}

async function packageDocument(archive: EpubArchive): Promise<PackageDocument> {
  const opf = await archive.text("OEBPS/content.opf");
  const document = parseXml(opf, "OEBPS/content.opf");
  const manifestItems = Array.from(document.getElementsByTagName("item")).map(
    (item) => {
      const id = item.getAttribute("id");
      const href = item.getAttribute("href");
      const mediaType = item.getAttribute("media-type");
      if (!id || !href || !mediaType) {
        throw new Error(`Malformed OPF manifest item: ${item.outerHTML}`);
      }

      return {
        id,
        href,
        mediaType,
        properties: item.getAttribute("properties") ?? "",
        fullPath: `OEBPS/${href}`,
      };
    },
  );

  return {
    manifestItems,
    spineIdrefs: Array.from(document.getElementsByTagName("itemref"))
      .map((itemref) => itemref.getAttribute("idref"))
      .filter((idref): idref is string => Boolean(idref)),
    metadataTitle: textContent(document, "dc:title"),
    metadataCreator: textContent(document, "dc:creator") || null,
    coverMetaId:
      Array.from(document.getElementsByTagName("meta"))
        .find((meta) => meta.getAttribute("name") === "cover")
        ?.getAttribute("content") ?? null,
  };
}

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
    bytes: async (path: string) => {
      const file = zip.file(path);
      if (!file) {
        throw new Error(`EPUB file not found: ${path}`);
      }
      return file.async("uint8array");
    },
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

export function resolveImageSrc(xhtmlPath: string, src: string) {
  return normalizeRelativePath(xhtmlPath, src);
}

export function imageSrcsFromXhtml(xhtml: string) {
  const document = parseXml(xhtml, "XHTML content");
  return Array.from(document.getElementsByTagName("img"))
    .map((image) => image.getAttribute("src"))
    .filter((src): src is string => Boolean(src));
}

export async function expectPngImage(
  archive: EpubArchive,
  path: string,
  expectedDimensions?: { width: number; height: number },
) {
  const bytes = await archive.bytes(path);
  const dimensions = pngDimensions(bytes);
  if (expectedDimensions) {
    expect(dimensions).toEqual(expectedDimensions);
  }
  return { bytes, dimensions };
}

export async function expectWellFormedEpubPackage(
  archive: EpubArchive,
  {
    title,
    creator = null,
    spineHrefs,
    navLabels,
    coverIncluded,
  }: {
    title: string;
    creator?: string | null;
    spineHrefs: string[];
    navLabels: string[];
    coverIncluded: boolean;
  },
) {
  expectEpubCoreFiles(archive);
  await expect(await archive.text("mimetype")).toBe("application/epub+zip");
  await expect(await archive.text("META-INF/container.xml")).toContain(
    'full-path="OEBPS/content.opf"',
  );

  const pkg = await packageDocument(archive);
  expect(pkg.metadataTitle).toBe(title);
  expect(pkg.metadataCreator).toBe(creator);

  const manifestIds = new Set(pkg.manifestItems.map((item) => item.id));
  const manifestHrefs = pkg.manifestItems.map((item) => item.href);

  for (const item of pkg.manifestItems) {
    expect(archive.fileNames, `manifest href should exist: ${item.href}`).toContain(item.fullPath);
  }

  for (const idref of pkg.spineIdrefs) {
    expect(manifestIds, `spine idref should exist in manifest: ${idref}`).toContain(idref);
  }

  expect(
    pkg.spineIdrefs.map((idref) => pkg.manifestItems.find((item) => item.id === idref)?.href),
  ).toEqual(coverIncluded ? ["cover.xhtml", ...spineHrefs] : spineHrefs);

  if (coverIncluded) {
    expect(manifestHrefs).toContain("cover.xhtml");
    expect(pkg.coverMetaId).toBeTruthy();
    const coverImage = pkg.manifestItems.find((item) => item.id === pkg.coverMetaId);
    expect(coverImage?.properties).toContain("cover-image");
    expect(coverImage?.mediaType.startsWith("image/")).toBe(true);
    expect(coverImage?.fullPath).toBeTruthy();
    expect(archive.fileNames).toContain(coverImage?.fullPath);
  } else {
    expect(manifestHrefs).not.toContain("cover.xhtml");
    expect(pkg.coverMetaId).toBeNull();
  }

  const nav = parseXml(await archive.text("OEBPS/nav.xhtml"), "OEBPS/nav.xhtml");
  const navLinks = Array.from(nav.getElementsByTagName("a")).map((anchor) => ({
    href: anchor.getAttribute("href"),
    label: anchor.textContent ?? "",
  }));
  expect(navLinks).toEqual(
    expect.arrayContaining(
      navLabels.map((label, index) => ({
        href: spineHrefs[index],
        label,
      })),
    ),
  );

  await expectPackagedImageReferencesResolve(archive);
}

export async function expectImageManifestMatchesFiles(archive: EpubArchive) {
  const pkg = await packageDocument(archive);
  const imageManifestItems = pkg.manifestItems.filter((item) =>
    item.mediaType.startsWith("image/"),
  );

  expect(imageManifestItems.map((item) => item.fullPath).sort()).toEqual(imageFiles(archive).sort());
}

export async function expectPackagedImageReferencesResolve(archive: EpubArchive) {
  const xhtmlFiles = archive.fileNames.filter((fileName) =>
    /^OEBPS\/(?:cover\.xhtml|chapters\/chapter-\d+\.xhtml)$/.test(fileName),
  );

  for (const xhtmlFile of xhtmlFiles) {
    const xhtml = await archive.text(xhtmlFile);
    const imageSrcs = imageSrcsFromXhtml(xhtml);

    for (const src of imageSrcs) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(src)) continue;
      const resolvedPath = resolveImageSrc(xhtmlFile, src);
      expect(archive.fileNames, `${xhtmlFile} image src should resolve: ${src}`).toContain(
        resolvedPath,
      );
    }
  }
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
