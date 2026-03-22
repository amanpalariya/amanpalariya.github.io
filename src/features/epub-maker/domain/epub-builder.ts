import JSZip from "jszip";
import { sanitizeHtmlContent } from "./html-sanitizer";
import { chapterBodyFromPageDraft } from "./page-draft";
import { registerImageAsset } from "./images";
import type { BuildEpubInput, BuildEpubResult, EpubImage } from "../types";
import { escapeXml } from "../utils/xml";

type Chapter = {
  id: string;
  href: string;
  title: string;
  content: string;
};

const XHTML_VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function serializeNodeToXhtml(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeXml(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  const attrs = Array.from(element.attributes)
    .map((attribute) => ` ${attribute.name}="${escapeXml(attribute.value)}"`)
    .join("");

  const children = Array.from(element.childNodes)
    .map((child) => serializeNodeToXhtml(child))
    .join("");

  if (XHTML_VOID_TAGS.has(tag) && children.length === 0) {
    return `<${tag}${attrs} />`;
  }

  return `<${tag}${attrs}>${children}</${tag}>`;
}

function serializeBodyToXhtml(body: HTMLElement): string {
  return Array.from(body.childNodes)
    .map((node) => serializeNodeToXhtml(node))
    .join("");
}

export async function buildEpub(input: BuildEpubInput): Promise<BuildEpubResult> {
  const startedAt = Date.now();
  const warnings = [] as BuildEpubResult["warnings"];
  const imagesByKey = new Map<string, EpubImage>();
  let imageCount = 0;

  const nextImageNumber = () => {
    imageCount += 1;
    return imageCount;
  };

  const chapters: Chapter[] = [];
  const pageCount = input.pages.length || 1;
  const progressStep = 80 / pageCount;

  input.onProgress?.(5);

  for (let i = 0; i < input.pages.length; i += 1) {
    const page = input.pages[i];
    const title = page.title || `Page ${i + 1}`;
    let chapterBody = chapterBodyFromPageDraft(page);

    if (page.inputKind === "html") {
      const sanitized = sanitizeHtmlContent(page.rawContent, title, input.sanitizePolicy);
      const parsed = new DOMParser().parseFromString(
        sanitized.chapterBodyHtml,
        "text/html",
      );

      const imageNodes = Array.from(parsed.body.querySelectorAll("img"));
      for (const node of imageNodes) {
        const src = node.getAttribute("src") || "";
        if (!src) continue;
        const result = await registerImageAsset({
          src,
          baseUrl: page.baseUrl,
          pageId: page.id,
          embedRemoteImages: input.sanitizePolicy.embedRemoteImages,
          imagesByKey,
          nextImageNumber,
        });
        if (result.warning) warnings.push(result.warning);
        if (!result.localHref && !result.absoluteSrc) {
          node.remove();
          continue;
        }
        node.setAttribute(
          "src",
          result.localHref ? `../${result.localHref}` : (result.absoluteSrc || src),
        );
      }

      chapterBody = serializeBodyToXhtml(parsed.body);
    }

    const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${escapeXml(title)}</title>
    <style>.plain-text{white-space:pre-wrap;word-break:break-word;margin:0}</style>
  </head>
  <body>
    ${chapterBody}
  </body>
</html>`;

    chapters.push({
      id: `chapter-${i + 1}`,
      href: `chapters/chapter-${i + 1}.xhtml`,
      title,
      content: xhtml,
    });

    input.onProgress?.(Math.min(85, Math.round(5 + progressStep * (i + 1))));
  }

  const bookId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `book-${Date.now()}`;

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

  const images = Array.from(imagesByKey.values());
  const manifestImageItems = images
    .map(
      (image) =>
        `<item id="${image.id}" href="${image.href}" media-type="${escapeXml(image.mediaType)}"/>`,
    )
    .join("\n    ");

  const spineItems = chapters
    .map((chapter) => `<itemref idref="${chapter.id}"/>`)
    .join("\n    ");

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:${escapeXml(bookId)}</dc:identifier>
    <dc:title>${escapeXml(input.bookTitle)}</dc:title>
    ${input.bookAuthor ? `<dc:creator>${escapeXml(input.bookAuthor)}</dc:creator>` : ""}
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
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

  input.onProgress?.(90);

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

  for (const chapter of chapters) {
    oebps.file(chapter.href, chapter.content);
  }

  for (const image of images) {
    oebps.file(image.href, image.bytes, { binary: true });
  }

  input.onProgress?.(95);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
  });

  input.onProgress?.(100);

  return {
    blob,
    warnings,
    summary: {
      fileName: input.downloadFileName || "book.epub",
      chapterCount: chapters.length,
      embeddedImageCount: images.length,
      externalImageCount: warnings.filter((warning) => warning.code === "FETCH_IMAGE_FAILED").length,
      durationMs: Date.now() - startedAt,
    },
  };
}
