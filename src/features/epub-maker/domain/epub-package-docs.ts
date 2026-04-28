import type { BuildEpubInput, EpubImage } from "../types";
import { escapeXml } from "../utils/xml";

type ChapterDoc = {
  id: string;
  href: string;
  title: string;
};

export function buildPackageDocuments({
  input,
  chapters,
  coverChapter,
  images,
  bookId,
  coverImageId,
}: {
  input: BuildEpubInput;
  chapters: ChapterDoc[];
  coverChapter: ChapterDoc | null;
  images: EpubImage[];
  bookId: string;
  coverImageId: string | null;
}) {
  const navItems = chapters
    .map(
      (chapter) =>
        `<li><a href="${escapeXml(chapter.href)}">${escapeXml(chapter.title)}</a></li>`,
    )
    .join("\n");

  const ncxItems = chapters
    .map(
      (chapter, index) => `
    <navPoint id="navPoint-${index + 1}" playOrder="${index + 1}">
      <navLabel><text>${escapeXml(chapter.title)}</text></navLabel>
      <content src="${escapeXml(chapter.href)}"/>
    </navPoint>`,
    )
    .join("\n");

  const manifestChapterItems = chapters
    .map(
      (chapter) =>
        `<item id="${chapter.id}" href="${chapter.href}" media-type="application/xhtml+xml"/>`,
    )
    .join("\n    ");
  const manifestCoverChapterItem = coverChapter
    ? `<item id="${coverChapter.id}" href="${coverChapter.href}" media-type="application/xhtml+xml"/>`
    : "";

  const manifestImageItems = images
    .map(
      (image) =>
        `<item id="${image.id}" href="${image.href}" media-type="${escapeXml(image.mediaType)}"${coverImageId === image.id ? ' properties="cover-image"' : ""}/>` ,
    )
    .join("\n    ");

  const spineItems = [
    ...(coverChapter ? [`<itemref idref="${coverChapter.id}"/>`] : []),
    ...chapters.map((chapter) => `<itemref idref="${chapter.id}"/>`),
  ].join("\n    ");

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:${escapeXml(bookId)}</dc:identifier>
    <dc:title>${escapeXml(input.bookTitle)}</dc:title>
    ${input.bookAuthor ? `<dc:creator>${escapeXml(input.bookAuthor)}</dc:creator>` : ""}
    <dc:language>en</dc:language>
    ${coverImageId ? `<meta name="cover" content="${escapeXml(coverImageId)}"/>` : ""}
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${manifestCoverChapterItem}
    ${manifestChapterItems}
    ${manifestImageItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`;

  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>${escapeXml(input.bookTitle)}</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
        ${navItems}
      </ol>
    </nav>
  </body>
</html>`;

  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${escapeXml(bookId)}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${escapeXml(input.bookTitle)}</text>
  </docTitle>
  <navMap>
    ${ncxItems}
  </navMap>
</ncx>`;

  return {
    contentOpf,
    navXhtml,
    tocNcx,
  };
}
