import JSZip from "jszip";
import type { EpubImage } from "../types";

type ChapterContent = {
  href: string;
  content: string;
};

export async function buildEpubZipBlob({
  contentOpf,
  navXhtml,
  tocNcx,
  chapters,
  coverChapter,
  images,
}: {
  contentOpf: string;
  navXhtml: string;
  tocNcx: string;
  chapters: ChapterContent[];
  coverChapter: ChapterContent | null;
  images: EpubImage[];
}) {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  );

  const oebps = zip.folder("OEBPS");
  if (!oebps) {
    throw new Error("Failed to create EPUB structure.");
  }

  oebps.file("content.opf", contentOpf);
  oebps.file("nav.xhtml", navXhtml);
  oebps.file("toc.ncx", tocNcx);

  if (coverChapter) {
    oebps.file(coverChapter.href, coverChapter.content);
  }

  for (const chapter of chapters) {
    oebps.file(chapter.href, chapter.content);
  }

  for (const image of images) {
    oebps.file(image.href, image.bytes, { binary: true });
  }

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
  });
}
