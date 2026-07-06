import { sanitizeHtmlContent } from "./html-sanitizer";
import { chapterBodyFromPageDraft } from "./page-draft";
import { registerImageAsset } from "./images";
import type { BuildEpubInput, BuildEpubResult, EpubImage } from "../types";
import { escapeXml } from "../utils/xml";
import { serializeBodyToXhtml } from "./epub-xhtml-serializer";
import { buildPackageDocuments } from "./epub-package-docs";
import { buildEpubZipBlob } from "./epub-zip";

type Chapter = {
  id: string;
  href: string;
  title: string;
  content: string;
};

export async function buildEpub(input: BuildEpubInput): Promise<BuildEpubResult> {
  const startedAt = Date.now();
  const warnings = [] as BuildEpubResult["warnings"];
  const imagesByKey = new Map<string, EpubImage>();
  const completedPageIds: string[] = [];
  let imageCount = 0;

  const nextImageNumber = () => {
    imageCount += 1;
    return imageCount;
  };

  const chapters: Chapter[] = [];
  let coverChapter: Chapter | null = null;
  let coverImageId: string | null = null;
  const pageCount = input.pages.length || 1;
  const progressStep = 80 / pageCount;
  const emitProgress = (
    value: number,
    phase: "preparing" | "processing_chapter" | "finalizing" | "done",
    chapterIndex: number | null = null,
    currentPageId: string | null = null,
  ) => {
    input.onProgress?.({
      value,
      phase,
      chapterIndex,
      currentPageId,
      completedPageIds: [...completedPageIds],
    });
  };
  const throwIfAborted = () => {
    if (!input.signal?.aborted) return;
    throw new DOMException("EPUB generation was cancelled.", "AbortError");
  };

  throwIfAborted();
  emitProgress(5, "preparing");

  for (let i = 0; i < input.pages.length; i += 1) {
    throwIfAborted();
    const page = input.pages[i];
    emitProgress(Math.min(85, Math.round(5 + progressStep * i)), "processing_chapter", i, page.id);
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
        throwIfAborted();
        const src = node.getAttribute("src") || "";
        if (!src) continue;
        const result = await registerImageAsset({
          src,
          baseUrl: page.baseUrl,
          pageId: page.id,
          embedRemoteImages: input.sanitizePolicy.embedRemoteImages,
          manualImageReplacements: input.manualImageReplacements,
          signal: input.signal,
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

    completedPageIds.push(page.id);
    emitProgress(Math.min(85, Math.round(5 + progressStep * (i + 1))), "processing_chapter", i, page.id);
  }

  if (input.cover) {
    throwIfAborted();
    const coverTitle = input.cover.title || "Cover";
    const sanitizedCover = sanitizeHtmlContent(
      input.cover.rawHtml,
      coverTitle,
      input.sanitizePolicy,
    );
    const parsedCover = new DOMParser().parseFromString(
      sanitizedCover.chapterBodyHtml,
      "text/html",
    );

    const coverImageNodes = Array.from(parsedCover.body.querySelectorAll("img"));
    for (const node of coverImageNodes) {
      throwIfAborted();
      const src = node.getAttribute("src") || "";
      if (!src) continue;
      const result = await registerImageAsset({
        src,
        baseUrl: null,
        embedRemoteImages: input.sanitizePolicy.embedRemoteImages,
        manualImageReplacements: input.manualImageReplacements,
        signal: input.signal,
        imagesByKey,
        nextImageNumber,
      });
      if (result.warning) warnings.push(result.warning);
      if (!result.localHref && !result.absoluteSrc) {
        node.remove();
        continue;
      }

      if (result.localHref) {
        const matchedImage = Array.from(imagesByKey.values()).find(
          (image) => image.href === result.localHref,
        );
        if (matchedImage && !coverImageId) {
          coverImageId = matchedImage.id;
        }
      }

      node.setAttribute(
        "src",
        result.localHref ? result.localHref : (result.absoluteSrc || src),
      );
    }

    const coverBody = serializeBodyToXhtml(parsedCover.body);
    const coverXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${escapeXml(coverTitle)}</title>
    <style>html,body{margin:0;padding:0}.cover-page{margin:0;padding:0}img{max-width:100%;height:auto;display:block}</style>
  </head>
  <body>
    <div class="cover-page">${coverBody}</div>
  </body>
</html>`;

    coverChapter = {
      id: "cover",
      href: "cover.xhtml",
      title: coverTitle,
      content: coverXhtml,
    };
  }

  const bookId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `book-${Date.now()}`;

  const images = Array.from(imagesByKey.values());
  const { contentOpf, navXhtml, tocNcx } = buildPackageDocuments({
    input,
    chapters,
    coverChapter,
    images,
    bookId,
    coverImageId,
  });

  emitProgress(90, "finalizing");

  emitProgress(95, "finalizing");
  throwIfAborted();
  const blob = await buildEpubZipBlob({
    contentOpf,
    navXhtml,
    tocNcx,
    chapters,
    coverChapter,
    images,
  });

  throwIfAborted();
  emitProgress(100, "done");

  return {
    blob,
    warnings,
    summary: {
      fileName: input.downloadFileName || "book.epub",
      chapterCount: chapters.length,
      coverIncluded: Boolean(coverChapter),
      embeddedImageCount: images.length,
      externalImageCount: warnings.filter((warning) => warning.code === "FETCH_IMAGE_FAILED").length,
      durationMs: Date.now() - startedAt,
    },
  };
}
