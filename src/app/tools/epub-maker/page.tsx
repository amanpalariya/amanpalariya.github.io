"use client";

import {
  Alert,
  Box,
  Button,
  Code,
  Heading,
  Group,
  HStack,
  Icon,
  Input,
  List,
  Textarea,
  Text,
  VStack,
} from "@chakra-ui/react";
import JSZip from "jszip";
import { ClipboardEvent, useEffect, useState } from "react";
import { Tooltip } from "@components/ui/tooltip";
import {
  LuBookDown,
  LuClipboardPaste,
  LuEye,
  LuEyeOff,
  LuFilePlus,
  LuTrash2,
} from "react-icons/lu";

type PageInputKind = "html" | "text";
type FileNameMode = "auto" | "manual";

type PageDraft = {
  id: string;
  title: string;
  inputKind: PageInputKind;
  rawContent: string;
  baseUrl: string | null;
  previewHtml: string;
};

type EpubImage = {
  id: string;
  href: string;
  mediaType: string;
  bytes: Uint8Array;
};

const EPUB_MAKER_PREFS_KEY = "epub-maker-prefs-v1";

const DROP_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "canvas",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "head",
  "header",
  "footer",
  "nav",
  "aside",
  "form",
  "button",
  "input",
  "textarea",
  "select",
  "option",
  "label",
]);

const ALLOWED_TAGS = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "strong",
  "em",
  "a",
  "br",
  "hr",
  "figure",
  "figcaption",
  "div",
  "span",
  "img",
]);

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function plainTextToHtml(value: string): string {
  return escapeXml(value).replaceAll("\n", "<br />");
}

function inferTitleFromText(
  value: string,
  fallback: string,
  maxWords = 8,
): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;

  const words = cleaned.split(" ").filter(Boolean);
  const previewWords = words.slice(0, maxWords);
  if (previewWords.length === 0) return fallback;
  return `${previewWords.join(" ")}...`;
}

function inferTitleFromHtml(value: string, fallback: string): string {
  try {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(value, "text/html");
    const contentRoot = parsed.querySelector("article, main") || parsed.body;
    const text = contentRoot?.textContent || "";
    return inferTitleFromText(text, fallback);
  } catch {
    return fallback;
  }
}

function sanitizeDownloadFileName(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/g, "");
}

function ensureEpubExtension(value: string): string {
  return value.toLowerCase().endsWith(".epub") ? value : `${value}.epub`;
}

function buildEpubFileName(
  manualFileName: string,
  title: string,
  author: string,
): string {
  const composedBase = [title.trim(), author.trim()]
    .filter(Boolean)
    .join(" - ");
  const base = manualFileName.trim() || composedBase || "epub-maker-pages";
  const sanitized = sanitizeDownloadFileName(base) || "epub-maker-pages";
  return ensureEpubExtension(sanitized);
}

function buildAutoEpubFileName(title: string, author: string): string {
  return buildEpubFileName("", title, author);
}

function toAbsoluteUrl(url: string, baseUrl: string | null): string | null {
  if (url.startsWith("data:")) return url;
  if (url.startsWith("//")) {
    const baseProtocol = baseUrl ? new URL(baseUrl).protocol : "https:";
    return `${baseProtocol}${url}`;
  }
  try {
    return new URL(url).toString();
  } catch {
    if (!baseUrl) return null;
    try {
      return new URL(url, baseUrl).toString();
    } catch {
      return null;
    }
  }
}

function mediaTypeToExtension(mediaType: string): string {
  const normalized = mediaType.toLowerCase();
  if (normalized.includes("image/jpeg")) return "jpg";
  if (normalized.includes("image/png")) return "png";
  if (normalized.includes("image/webp")) return "webp";
  if (normalized.includes("image/gif")) return "gif";
  if (normalized.includes("image/svg+xml")) return "svg";
  if (normalized.includes("image/avif")) return "avif";
  return "bin";
}

function dataUrlToBytes(
  dataUrl: string,
): { bytes: Uint8Array; mediaType: string } | null {
  const match = dataUrl.match(/^data:([^;,]+)?(?:;base64)?,([\s\S]*)$/);
  if (!match) return null;
  const mediaType = match[1] || "application/octet-stream";
  const payload = match[2] || "";
  const isBase64 = dataUrl.includes(";base64,");

  try {
    if (isBase64) {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return { bytes, mediaType };
    }

    const decoded = decodeURIComponent(payload);
    const encoder = new TextEncoder();
    return { bytes: encoder.encode(decoded), mediaType };
  } catch {
    return null;
  }
}

function appendSanitizedNode(
  sourceNode: ChildNode,
  targetParent: Element,
  out: Document,
  baseUrl: string | null,
) {
  if (sourceNode.nodeType === Node.TEXT_NODE) {
    const text = sourceNode.textContent;
    if (text) targetParent.appendChild(out.createTextNode(text));
    return;
  }

  if (sourceNode.nodeType !== Node.ELEMENT_NODE) return;

  const sourceEl = sourceNode as HTMLElement;
  const tag = sourceEl.tagName.toLowerCase();

  if (DROP_TAGS.has(tag)) return;

  if (!ALLOWED_TAGS.has(tag)) {
    for (const child of Array.from(sourceEl.childNodes)) {
      appendSanitizedNode(child, targetParent, out, baseUrl);
    }
    return;
  }

  const target = out.createElement(tag);

  if (tag === "a") {
    const href = sourceEl.getAttribute("href");
    if (href) {
      const absoluteHref = toAbsoluteUrl(href, baseUrl);
      if (absoluteHref) target.setAttribute("href", absoluteHref);
    }
  }

  if (tag === "img") {
    const src = sourceEl.getAttribute("src");
    if (!src) return;
    const absoluteSrc = toAbsoluteUrl(src, baseUrl);
    if (!absoluteSrc) return;
    target.setAttribute("src", absoluteSrc);
    const alt = sourceEl.getAttribute("alt");
    if (alt) target.setAttribute("alt", alt);
    targetParent.appendChild(target);
    return;
  }

  for (const child of Array.from(sourceEl.childNodes)) {
    appendSanitizedNode(child, target, out, baseUrl);
  }

  targetParent.appendChild(target);
}

function sanitizeHtmlContent(html: string, fallbackPageTitle: string) {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");

  const title =
    parsed
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content") ||
    parsed.title ||
    fallbackPageTitle;
  const baseUrl =
    parsed.querySelector("base")?.getAttribute("href") ||
    parsed.querySelector('meta[property="og:url"]')?.getAttribute("content") ||
    parsed.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
    null;

  const sourceRoot = parsed.querySelector("article, main") || parsed.body;
  const out = document.implementation.createHTMLDocument("sanitized");
  const container = out.createElement("div");

  for (const child of Array.from(sourceRoot.childNodes)) {
    appendSanitizedNode(child, container, out, baseUrl);
  }

  const previewContainer = out.createElement("div");
  const previewNodes = Array.from(container.childNodes).slice(0, 10);
  for (const node of previewNodes) {
    previewContainer.appendChild(node.cloneNode(true));
  }

  const previewHtml = `<!doctype html><html><head><meta charset="utf-8" /><meta name="color-scheme" content="light" /><style>:root{color-scheme:light}html,body{margin:0;padding:0;overflow:hidden;background:#fff;color:#111}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;line-height:1.35;padding:10px}img{max-width:100%;height:auto}h1,h2,h3,h4,h5,h6{margin:8px 0 4px}p,li,blockquote,pre{margin:4px 0}a{color:#2563eb;text-decoration:none}*{scrollbar-width:none}*::-webkit-scrollbar{width:0;height:0}</style></head><body>${previewContainer.innerHTML}</body></html>`;

  return {
    title,
    baseUrl,
    chapterBodyHtml: container.innerHTML,
    previewHtml,
  };
}

function getPageFromInput(content: string, id: string): PageDraft {
  const defaultPageTitle = `Page ${id}`;
  const looksLikeHtml = /<\s*[a-zA-Z!/]/.test(content);

  if (looksLikeHtml) {
    const inferredTitle = inferTitleFromHtml(content, defaultPageTitle);
    const sanitized = sanitizeHtmlContent(content, inferredTitle);
    return {
      id,
      title: sanitized.title,
      inputKind: "html",
      rawContent: content,
      baseUrl: sanitized.baseUrl,
      previewHtml: sanitized.previewHtml,
    };
  }

  const fallbackPageTitle = inferTitleFromText(content, defaultPageTitle);
  const textPreview = `<!doctype html><html><head><meta charset="utf-8" /><meta name="color-scheme" content="light" /><style>:root{color-scheme:light}html,body{margin:0;padding:0;overflow:hidden;background:#fff;color:#111}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;line-height:1.35;padding:10px}.plain-text{white-space:pre-wrap;word-break:break-word;margin:0}*{scrollbar-width:none}*::-webkit-scrollbar{width:0;height:0}</style></head><body><div class="plain-text">${plainTextToHtml(content)}</div></body></html>`;

  return {
    id,
    title: fallbackPageTitle,
    inputKind: "text",
    rawContent: content,
    baseUrl: null,
    previewHtml: textPreview,
  };
}

export default function EpubMakerPage() {
  const [pages, setPages] = useState<PageDraft[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [pastedInput, setPastedInput] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [epubTitle, setEpubTitle] = useState("");
  const [epubAuthor, setEpubAuthor] = useState("");
  const [fileNameMode, setFileNameMode] = useState<FileNameMode>("auto");
  const [manualEpubFileName, setManualEpubFileName] = useState("");
  const [isPrefsLoaded, setIsPrefsLoaded] = useState(false);

  const normalizedBookTitle = epubTitle.trim() || "EPUB Maker Pages";
  const normalizedBookAuthor = epubAuthor.trim();
  const autoEpubFileName = buildAutoEpubFileName(
    normalizedBookTitle,
    normalizedBookAuthor,
  );
  const effectiveFileName =
    fileNameMode === "manual"
      ? buildEpubFileName(
          manualEpubFileName,
          normalizedBookTitle,
          normalizedBookAuthor,
        )
      : autoEpubFileName;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EPUB_MAKER_PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          title?: string;
          author?: string;
          manualFileName?: string;
          fileNameMode?: FileNameMode;
        };

        if (typeof parsed.title === "string") setEpubTitle(parsed.title);
        if (typeof parsed.author === "string") setEpubAuthor(parsed.author);
        if (typeof parsed.manualFileName === "string") {
          setManualEpubFileName(parsed.manualFileName);
        }
        if (
          parsed.fileNameMode === "auto" ||
          parsed.fileNameMode === "manual"
        ) {
          setFileNameMode(parsed.fileNameMode);
        }
      }
    } catch {
      // ignore localStorage parse/access errors
    } finally {
      setIsPrefsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isPrefsLoaded) return;

    try {
      window.localStorage.setItem(
        EPUB_MAKER_PREFS_KEY,
        JSON.stringify({
          title: epubTitle,
          author: epubAuthor,
          manualFileName: manualEpubFileName,
          fileNameMode,
        }),
      );
    } catch {
      // ignore localStorage write errors
    }
  }, [isPrefsLoaded, epubTitle, epubAuthor, manualEpubFileName, fileNameMode]);

  function downloadBlob(blob: Blob, fileName: string) {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  function addInputAsPage(content: string) {
    if (!content.trim()) {
      setErrors(["Clipboard/fallback input is empty."]);
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const page = getPageFromInput(content, `${pages.length + 1}`);
    page.id = id;

    setPages((prev) => [...prev, page]);
    setSummary("");
    setWarnings([]);
    setErrors([]);
    setPastedInput("");
  }

  async function addPageFromClipboard() {
    setIsAdding(true);
    setErrors([]);

    try {
      if ("read" in navigator.clipboard) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes("text/html")) {
            const htmlBlob = await item.getType("text/html");
            const html = await htmlBlob.text();
            if (html.trim()) {
              addInputAsPage(html);
              return;
            }
          }
        }

        for (const item of items) {
          if (item.types.includes("text/plain")) {
            const textBlob = await item.getType("text/plain");
            const text = await textBlob.text();
            if (text.trim()) {
              addInputAsPage(text);
              return;
            }
          }
        }
      }

      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText || !clipboardText.trim()) {
        setErrors(["Clipboard is empty."]);
        return;
      }

      addInputAsPage(clipboardText);
    } catch (error) {
      setErrors([
        `Could not read formatted clipboard content automatically: ${String(error)}. Use the paste fallback below.`,
      ]);
      setShowPasteFallback(true);
    } finally {
      setIsAdding(false);
    }
  }

  function onPasteInput(event: ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData("text/html");
    if (html?.trim()) {
      event.preventDefault();
      addInputAsPage(html);
      return;
    }

    const text = event.clipboardData.getData("text/plain");
    if (text?.trim()) {
      event.preventDefault();
      addInputAsPage(text);
    }
  }

  function addFromFallbackText() {
    if (!pastedInput.trim()) {
      setErrors(["Paste HTML or text first, then add page."]);
      return;
    }
    addInputAsPage(pastedInput);
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((page) => page.id !== id));
    setSummary("");
  }

  async function generateEpub() {
    setIsGenerating(true);
    setWarnings([]);
    setErrors([]);
    setSummary("");

    if (pages.length === 0) {
      setErrors([
        "Add at least one page from clipboard before generating EPUB.",
      ]);
      setIsGenerating(false);
      return;
    }

    const localWarnings: string[] = [];

    try {
      const imagesByKey = new Map<string, EpubImage>();
      let imageCount = 0;

      const registerImage = async (
        src: string,
        baseUrl: string | null,
      ): Promise<{ localHref: string | null; absoluteSrc: string | null }> => {
        const absoluteSrc = toAbsoluteUrl(src, baseUrl);
        if (!absoluteSrc) {
          localWarnings.push(`Skipped image with unresolved src: ${src}`);
          return { localHref: null, absoluteSrc: null };
        }

        const existing = imagesByKey.get(absoluteSrc);
        if (existing) return { localHref: existing.href, absoluteSrc };

        if (absoluteSrc.startsWith("data:")) {
          const parsed = dataUrlToBytes(absoluteSrc);
          if (!parsed) {
            localWarnings.push("Skipped malformed data URL image.");
            return { localHref: null, absoluteSrc };
          }
          imageCount += 1;
          const ext = mediaTypeToExtension(parsed.mediaType);
          const image: EpubImage = {
            id: `img-${imageCount}`,
            href: `images/image-${imageCount}.${ext}`,
            mediaType: parsed.mediaType,
            bytes: parsed.bytes,
          };
          imagesByKey.set(absoluteSrc, image);
          return { localHref: image.href, absoluteSrc };
        }

        try {
          const response = await fetch(absoluteSrc);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          const mediaType = blob.type || "application/octet-stream";
          const bytes = new Uint8Array(await blob.arrayBuffer());

          imageCount += 1;
          const ext = mediaTypeToExtension(mediaType);
          const image: EpubImage = {
            id: `img-${imageCount}`,
            href: `images/image-${imageCount}.${ext}`,
            mediaType,
            bytes,
          };
          imagesByKey.set(absoluteSrc, image);
          return { localHref: image.href, absoluteSrc };
        } catch {
          localWarnings.push(
            `Could not fetch image (network/CORS). Keeping external image URL instead: ${absoluteSrc}`,
          );
          return { localHref: null, absoluteSrc };
        }
      };

      const chapters: Array<{
        id: string;
        href: string;
        title: string;
        content: string;
      }> = [];

      for (let i = 0; i < pages.length; i += 1) {
        const page = pages[i];
        const title = page.title || `Page ${i + 1}`;
        let chapterBody = "";

        if (page.inputKind === "text") {
          chapterBody = `<div class="plain-text">${plainTextToHtml(page.rawContent)}</div>`;
        } else {
          const sanitized = sanitizeHtmlContent(page.rawContent, title);
          const parser = new DOMParser();
          const parsed = parser.parseFromString(
            sanitized.chapterBodyHtml,
            "text/html",
          );
          const sourceRoot = parsed.body;

          const out = document.implementation.createHTMLDocument("chapter");
          const container = out.createElement("div");

          const appendNode = async (
            sourceNode: ChildNode,
            targetParent: Element,
          ) => {
            if (sourceNode.nodeType === Node.TEXT_NODE) {
              const text = sourceNode.textContent;
              if (text) targetParent.appendChild(out.createTextNode(text));
              return;
            }

            if (sourceNode.nodeType !== Node.ELEMENT_NODE) return;

            const sourceEl = sourceNode as HTMLElement;
            const tag = sourceEl.tagName.toLowerCase();

            if (!ALLOWED_TAGS.has(tag)) {
              for (const child of Array.from(sourceEl.childNodes)) {
                await appendNode(child, targetParent);
              }
              return;
            }

            const target = out.createElement(tag);

            if (tag === "a") {
              const href = sourceEl.getAttribute("href");
              if (href) {
                const absoluteHref = toAbsoluteUrl(href, page.baseUrl);
                if (absoluteHref) target.setAttribute("href", absoluteHref);
              }
            }

            if (tag === "img") {
              const src = sourceEl.getAttribute("src");
              if (!src) return;
              const { localHref, absoluteSrc } = await registerImage(
                src,
                page.baseUrl,
              );
              if (!localHref && !absoluteSrc) return;
              target.setAttribute("src", localHref || absoluteSrc || src);
              const alt = sourceEl.getAttribute("alt");
              if (alt) target.setAttribute("alt", alt);
              targetParent.appendChild(target);
              return;
            }

            for (const child of Array.from(sourceEl.childNodes)) {
              await appendNode(child, target);
            }

            targetParent.appendChild(target);
          };

          for (const child of Array.from(sourceRoot.childNodes)) {
            await appendNode(child, container);
          }

          chapterBody = container.innerHTML;
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
      }

      const bookTitle = normalizedBookTitle;
      const bookAuthorName = normalizedBookAuthor;
      if (fileNameMode === "manual" && !manualEpubFileName.trim()) {
        setManualEpubFileName(autoEpubFileName);
      }
      const downloadFileName = effectiveFileName;
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
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    ${bookAuthorName ? `<dc:creator>${escapeXml(bookAuthorName)}</dc:creator>` : ""}
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
    <title>${escapeXml(bookTitle)}</title>
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
    <text>${escapeXml(bookTitle)}</text>
  </docTitle>
  <navMap>
    ${ncxItems}
  </navMap>
</ncx>`;

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
        setErrors(["Failed to create EPUB structure."]);
        setIsGenerating(false);
        return;
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

      const finalBlob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/epub+zip",
      });

      downloadBlob(finalBlob, downloadFileName);
      setWarnings(localWarnings);
      setSummary(
        `Generated and downloaded ${downloadFileName} with ${chapters.length} page(s) and ${images.length} embedded image(s).`,
      );
    } catch (error) {
      setErrors([`Unexpected error while generating EPUB: ${String(error)}`]);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Box w={"full"} px={[4, 6]} py={4}>
      <VStack align={"stretch"} gap={4}>
        <Heading size={"2xl"}>EPUB Maker</Heading>
        <Text color={"fg.muted"}>
          Paste full HTML or plain text pages, preview as cards, then generate
          and download EPUB.
        </Text>

        <Alert.Root status={"info"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Quick steps</Alert.Title>
            <Alert.Description>
              1) Copy HTML/text, 2) Add page(s), 3) Generate EPUB.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        {showPasteFallback ? (
          <Alert.Root status={"warning"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Clipboard fallback enabled</Alert.Title>
              <Alert.Description>
                If automatic clipboard read is blocked, click in the box below
                and press
                <Code> Cmd/Ctrl + V </Code> to paste HTML/text directly.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        <HStack gap={3} wrap={"wrap"}>
          <Button onClick={addPageFromClipboard} loading={isAdding}>
            <Icon>
              <LuFilePlus />
            </Icon>
            Add page from clipboard
          </Button>
          <Button
            onClick={generateEpub}
            loading={isGenerating}
            disabled={pages.length === 0}
          >
            <Icon>
              <LuBookDown />
            </Icon>
            Save EPUB
          </Button>
          {!showPasteFallback ? (
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => setShowPasteFallback(true)}
            >
              <Icon>
                <LuEye />
              </Icon>
              Show fallback
            </Button>
          ) : null}
        </HStack>

        <HStack gap={3} wrap={"wrap"} align={"stretch"}>
          <Box minW={["full", "320px"]} flex={1}>
            <Text fontSize={"sm"} color={"fg.muted"} mb={1}>
              Title
            </Text>
            <Input
              placeholder={"EPUB Maker Pages"}
              value={epubTitle}
              onChange={(event) => setEpubTitle(event.target.value)}
            />
          </Box>
          <Box minW={["full", "260px"]} flex={1}>
            <Text fontSize={"sm"} color={"fg.muted"} mb={1}>
              Author (optional)
            </Text>
            <Input
              placeholder={"Your name"}
              value={epubAuthor}
              onChange={(event) => setEpubAuthor(event.target.value)}
            />
          </Box>
          <Box minW={["full", "320px"]} flex={1}>
            <Text fontSize={"sm"} color={"fg.muted"} mb={1}>
              File name
            </Text>
            <Group attached w={"full"}>
              <Input
                flex={1}
                size={"md"}
                placeholder={"my-book.epub"}
                value={
                  fileNameMode === "auto"
                    ? autoEpubFileName
                    : manualEpubFileName
                }
                onChange={(event) => {
                  if (fileNameMode === "auto") {
                    setFileNameMode("manual");
                  }
                  setManualEpubFileName(event.target.value);
                }}
                onBlur={() => {
                  if (
                    fileNameMode === "manual" &&
                    !manualEpubFileName.trim()
                  ) {
                    setManualEpubFileName(autoEpubFileName);
                  }
                }}
              />
              <Button
                size={"md"}
                variant={"outline"}
                onClick={() => {
                  setFileNameMode((prev) => {
                    const nextMode = prev === "auto" ? "manual" : "auto";
                    if (nextMode === "manual" && !manualEpubFileName.trim()) {
                      setManualEpubFileName(autoEpubFileName);
                    }
                    return nextMode;
                  });
                }}
              >
                {fileNameMode === "auto" ? "Auto" : "Manual"}
              </Button>
            </Group>
          </Box>
        </HStack>

        {showPasteFallback ? (
          <Box>
            <Textarea
              value={pastedInput}
              onChange={(event) => setPastedInput(event.target.value)}
              onPaste={onPasteInput}
              minH={"140px"}
              placeholder={
                "Click here and press Cmd/Ctrl+V to paste HTML or plain text (auto-add on paste when possible)."
              }
            />
            <HStack mt={2}>
              <Button
                size={"sm"}
                variant={"subtle"}
                onClick={addFromFallbackText}
              >
                <Icon>
                  <LuClipboardPaste />
                </Icon>
                Add pasted content as page
              </Button>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => {
                  setShowPasteFallback(false);
                  setPastedInput("");
                }}
              >
                <Icon>
                  <LuEyeOff />
                </Icon>
                Hide fallback
              </Button>
            </HStack>
          </Box>
        ) : null}

        {summary ? (
          <Alert.Root status={"success"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{summary}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        {errors.length > 0 ? (
          <Alert.Root status={"error"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Errors</Alert.Title>
              <List.Root>
                {errors.map((error) => (
                  <List.Item key={error}>
                    <Code whiteSpace={"pre-wrap"}>{error}</Code>
                  </List.Item>
                ))}
              </List.Root>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        {warnings.length > 0 ? (
          <Alert.Root status={"warning"}>
            <Alert.Indicator />
            <Alert.Content>
              <HStack justify={"space-between"} align={"start"} mb={2}>
                <Alert.Title>Warnings</Alert.Title>
                <Button
                  size={"xs"}
                  variant={"ghost"}
                  onClick={() => setWarnings([])}
                >
                  Dismiss
                </Button>
              </HStack>
              <Box maxH={"150px"} overflowY={"auto"} pr={1}>
                <List.Root>
                  {warnings.map((warning, index) => (
                    <List.Item key={`${warning}-${index}`}>
                      <Code whiteSpace={"pre-wrap"}>{warning}</Code>
                    </List.Item>
                  ))}
                </List.Root>
              </Box>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        <HStack align={"start"} gap={4} wrap={"wrap"}>
          {pages.map((page, index) => (
            <Box
              key={page.id}
              w={"220px"}
              borderWidth={"1px"}
              borderColor={"border.emphasized"}
              rounded={"md"}
              overflow={"hidden"}
              bg={"bg.panel"}
            >
              <Box
                px={3}
                py={2}
                borderBottomWidth={"1px"}
                borderColor={"border.subtle"}
              >
                <HStack justify={"space-between"} align={"center"} gap={2}>
                  {`${index + 1}. ${page.title}`.length > 36 ? (
                    <Tooltip content={`${index + 1}. ${page.title}`}>
                      <Text
                        fontSize={"sm"}
                        fontWeight={"semibold"}
                        flex={1}
                        minW={0}
                        whiteSpace={"nowrap"}
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                      >
                        {index + 1}. {page.title}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text
                      fontSize={"sm"}
                      fontWeight={"semibold"}
                      flex={1}
                      minW={0}
                      whiteSpace={"nowrap"}
                      overflow={"hidden"}
                      textOverflow={"ellipsis"}
                    >
                      {index + 1}. {page.title}
                    </Text>
                  )}

                  <Tooltip content={"Remove"}>
                    <Button
                      size={"xs"}
                      variant={"ghost"}
                      onClick={() => removePage(page.id)}
                      aria-label={"Remove page"}
                      px={1.5}
                      minW={"auto"}
                    >
                      <Icon>
                        <LuTrash2 />
                      </Icon>
                    </Button>
                  </Tooltip>
                </HStack>
              </Box>
              <Box h={"300px"} bg={"bg"}>
                <iframe
                  title={`preview-${page.id}`}
                  srcDoc={page.previewHtml}
                  sandbox=""
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    pointerEvents: "none",
                  }}
                />
              </Box>
            </Box>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
}
