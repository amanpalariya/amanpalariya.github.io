import { expect, type Download } from "@playwright/test";
import fs from "node:fs/promises";
import JSZip from "jszip";

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

function attribute(value: string, name: string): string | null {
  const match = new RegExp(`${name}="([^"]*)"`).exec(value);
  return match?.[1] ?? null;
}

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

async function packageDocument(archive: EpubArchive): Promise<PackageDocument> {
  const opf = await archive.text("OEBPS/content.opf");
  const manifestItems = Array.from(opf.matchAll(/<item\s+([^>]+?)\/>/g)).map(
    (match) => {
      const attrs = match[1];
      const id = attribute(attrs, "id");
      const href = attribute(attrs, "href");
      const mediaType = attribute(attrs, "media-type");
      if (!id || !href || !mediaType) {
        throw new Error(`Malformed OPF manifest item: ${match[0]}`);
      }

      return {
        id,
        href,
        mediaType,
        properties: attribute(attrs, "properties") ?? "",
        fullPath: `OEBPS/${href}`,
      };
    },
  );

  return {
    manifestItems,
    spineIdrefs: Array.from(opf.matchAll(/<itemref\s+idref="([^"]+)"\s*\/>/g)).map(
      (match) => match[1],
    ),
    metadataTitle: opf.match(/<dc:title>([^<]*)<\/dc:title>/)?.[1] ?? "",
    metadataCreator: opf.match(/<dc:creator>([^<]*)<\/dc:creator>/)?.[1] ?? null,
    coverMetaId: opf.match(/<meta\s+name="cover"\s+content="([^"]+)"\s*\/>/)?.[1] ?? null,
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
  return Array.from(xhtml.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)).map((match) => match[1]);
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

  const nav = await archive.text("OEBPS/nav.xhtml");
  for (const [index, label] of navLabels.entries()) {
    expect(nav).toContain(`href="${spineHrefs[index]}"`);
    expect(nav).toContain(`>${label}</a>`);
  }

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
