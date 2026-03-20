"use client";

import {
  Alert,
  Box,
  Button,
  Code,
  DownloadTrigger,
  Heading,
  HStack,
  Icon,
  List,
  Textarea,
  Text,
  VStack,
} from "@chakra-ui/react";
import JSZip from "jszip";
import { ClipboardEvent, useState } from "react";
import { Tooltip } from "@components/ui/tooltip";
import {
  LuBookDown,
  LuClipboardPaste,
  LuDownload,
  LuEye,
  LuEyeOff,
  LuFilePlus,
  LuTrash2,
} from "react-icons/lu";

type PageDraft = {
  id: string;
  title: string;
  rawHtml: string;
  baseUrl: string | null;
  previewHtml: string;
};

type EpubImage = {
  id: string;
  href: string;
  mediaType: string;
  bytes: Uint8Array;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; mediaType: string } | null {
  const match = dataUrl.match(/^data:([^;,]+)?(?:;base64)?,(.*)$/s);
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

function getPageFromClipboardHtml(html: string, id: string): PageDraft {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");

  const title =
    parsed.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
    parsed.title ||
    `Page ${id}`;
  const baseUrl =
    parsed.querySelector("base")?.getAttribute("href") ||
    parsed.querySelector('meta[property="og:url"]')?.getAttribute("content") ||
    parsed.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
    null;
  const sourceRoot = parsed.querySelector("article, main") || parsed.body;

  const dropTags = new Set([
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

  const allowedTags = new Set([
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

  const out = document.implementation.createHTMLDocument("preview");
  const container = out.createElement("div");

  const appendSanitizedNode = (sourceNode: ChildNode, targetParent: Element) => {
    if (sourceNode.nodeType === Node.TEXT_NODE) {
      const text = sourceNode.textContent;
      if (text) {
        targetParent.appendChild(out.createTextNode(text));
      }
      return;
    }

    if (sourceNode.nodeType !== Node.ELEMENT_NODE) return;

    const sourceEl = sourceNode as HTMLElement;
    const tag = sourceEl.tagName.toLowerCase();

    if (dropTags.has(tag)) return;

    if (!allowedTags.has(tag)) {
      for (const child of Array.from(sourceEl.childNodes)) {
        appendSanitizedNode(child, targetParent);
      }
      return;
    }

    const target = out.createElement(tag);

    if (tag === "a") {
      const href = sourceEl.getAttribute("href");
      if (href) {
        const absoluteHref = toAbsoluteUrl(href, baseUrl);
        if (absoluteHref) {
          target.setAttribute("href", absoluteHref);
        }
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
      appendSanitizedNode(child, target);
    }
    targetParent.appendChild(target);
  };

  for (const child of Array.from(sourceRoot.childNodes)) {
    appendSanitizedNode(child, container);
  }

  const previewContainer = out.createElement("div");
  const children = Array.from(container.childNodes).slice(0, 10);
  for (const node of children) {
    previewContainer.appendChild(node.cloneNode(true));
  }

  const previewHtml = `<!doctype html><html><head><meta charset="utf-8" /><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;line-height:1.35;padding:10px;color:#111}img{max-width:100%;height:auto}h1,h2,h3,h4,h5,h6{margin:8px 0 4px}p,li,blockquote,pre{margin:4px 0}a{color:#2563eb;text-decoration:none}</style></head><body>${previewContainer.innerHTML}</body></html>`;

  return {
    id,
    title,
    rawHtml: html,
    baseUrl,
    previewHtml,
  };
}

export default function UrlToEpubPage() {
  const [pages, setPages] = useState<PageDraft[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [pastedHtmlInput, setPastedHtmlInput] = useState("");
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState("");

  function addHtmlAsPage(html: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const page = getPageFromClipboardHtml(html, `${pages.length + 1}`);
    page.id = id;

    setPages((prev) => [...prev, page]);
    setEpubBlob(null);
    setSummary("");
    setWarnings([]);
    setPastedHtmlInput("");
  }

  async function addPageFromClipboard() {
    setIsAdding(true);
    setErrors([]);

    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText || !clipboardText.trim()) {
        setErrors(["Clipboard is empty."]);
        return;
      }

      const looksLikeHtml = /<\s*[a-zA-Z!]/.test(clipboardText);
      if (!looksLikeHtml) {
        setErrors([
          "Clipboard does not look like HTML. Copy page HTML first (for example from DevTools).",
        ]);
        return;
      }

      addHtmlAsPage(clipboardText);
    } catch (error) {
      setErrors([
        `Could not read clipboard automatically: ${String(error)}. Use the paste fallback below.`,
      ]);
      setShowPasteFallback(true);
    } finally {
      setIsAdding(false);
    }
  }

  function onPasteHtml(event: ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData("text/html");
    if (html && /<\s*[a-zA-Z!]/.test(html)) {
      event.preventDefault();
      addHtmlAsPage(html);
      return;
    }

    const text = event.clipboardData.getData("text/plain");
    if (text && /<\s*[a-zA-Z!]/.test(text)) {
      event.preventDefault();
      addHtmlAsPage(text);
    }
  }

  function addFromFallbackText() {
    if (!pastedHtmlInput.trim()) {
      setErrors(["Paste HTML first, then add page."]);
      return;
    }
    if (!/<\s*[a-zA-Z!]/.test(pastedHtmlInput)) {
      setErrors(["Fallback input does not look like HTML."]);
      return;
    }
    addHtmlAsPage(pastedHtmlInput);
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((page) => page.id !== id));
    setEpubBlob(null);
    setSummary("");
  }

  async function generateEpub() {
    setIsGenerating(true);
    setWarnings([]);
    setErrors([]);
    setSummary("");
    setEpubBlob(null);

    if (pages.length === 0) {
      setErrors(["Add at least one page from clipboard before generating EPUB."]);
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

      const chapters: Array<{ id: string; href: string; title: string; content: string }> = [];

      for (let i = 0; i < pages.length; i += 1) {
        const page = pages[i];
        const parser = new DOMParser();
        const parsed = parser.parseFromString(page.rawHtml, "text/html");
        const sourceRoot = parsed.querySelector("article, main") || parsed.body;

        const out = document.implementation.createHTMLDocument("chapter");
        const container = out.createElement("div");

        const dropTags = new Set([
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

        const allowedTags = new Set([
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

        const appendNode = async (sourceNode: ChildNode, targetParent: Element) => {
          if (sourceNode.nodeType === Node.TEXT_NODE) {
            const text = sourceNode.textContent;
            if (text) targetParent.appendChild(out.createTextNode(text));
            return;
          }

          if (sourceNode.nodeType !== Node.ELEMENT_NODE) return;

          const sourceEl = sourceNode as HTMLElement;
          const tag = sourceEl.tagName.toLowerCase();

          if (dropTags.has(tag)) return;

          if (!allowedTags.has(tag)) {
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
            const { localHref, absoluteSrc } = await registerImage(src, page.baseUrl);
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

        const title = page.title || `Page ${i + 1}`;
        const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${escapeXml(title)}</title>
  </head>
  <body>
    <h1>${escapeXml(title)}</h1>
    ${container.innerHTML}
  </body>
</html>`;

        chapters.push({
          id: `chapter-${i + 1}`,
          href: `chapters/chapter-${i + 1}.xhtml`,
          title,
          content: xhtml,
        });
      }

      const bookTitle = "Clipboard Pages";
      const bookId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `book-${Date.now()}`;

      const navItems = chapters
        .map((chapter) => `<li><a href="${escapeXml(chapter.href)}">${escapeXml(chapter.title)}</a></li>`)
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

      setEpubBlob(finalBlob);
      setWarnings(localWarnings);
      setSummary(
        `Generated EPUB with ${chapters.length} page(s) and ${images.length} embedded image(s).`,
      );
    } catch (error) {
      setErrors([`Unexpected error while generating EPUB: ${String(error)}`]);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Box maxW={"6xl"} mx={"auto"} p={{ base: 4, md: 8 }}>
      <VStack align={"stretch"} gap={4}>
        <Heading size={"2xl"}>Clipboard HTML to EPUB</Heading>
        <Text color={"fg.muted"}>
          Paste page HTML, preview as cards, then generate and download EPUB.
        </Text>

        <Alert.Root status={"info"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Quick steps</Alert.Title>
            <Alert.Description>
              1) Copy HTML, 2) Add page(s), 3) Generate EPUB.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        {showPasteFallback ? (
          <Alert.Root status={"warning"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Clipboard fallback enabled</Alert.Title>
              <Alert.Description>
                If automatic clipboard read is blocked, click in the box below and press
                <Code> Cmd/Ctrl + V </Code> to paste HTML directly.
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
          <Button onClick={generateEpub} loading={isGenerating} disabled={pages.length === 0}>
            <Icon>
              <LuBookDown />
            </Icon>
            Generate EPUB
          </Button>
          {!showPasteFallback ? (
            <Button size={"sm"} variant={"outline"} onClick={() => setShowPasteFallback(true)}>
              <Icon>
                <LuEye />
              </Icon>
              Show fallback
            </Button>
          ) : null}
          {epubBlob ? (
            <DownloadTrigger
              data={epubBlob}
              fileName={"clipboard-pages.epub"}
              mimeType={"application/epub+zip"}
              asChild
            >
              <Button variant={"solid"}>
                <Icon>
                  <LuDownload />
                </Icon>
                Download EPUB
              </Button>
            </DownloadTrigger>
          ) : null}
        </HStack>

        {showPasteFallback ? (
          <Box>
            <Textarea
              value={pastedHtmlInput}
              onChange={(event) => setPastedHtmlInput(event.target.value)}
              onPaste={onPasteHtml}
              minH={"140px"}
              placeholder={"Click here and press Cmd/Ctrl+V to paste HTML (auto-add on paste when possible)."}
            />
            <HStack mt={2}>
              <Button size={"sm"} variant={"subtle"} onClick={addFromFallbackText}>
                <Icon>
                  <LuClipboardPaste />
                </Icon>
                Add pasted HTML as page
              </Button>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => {
                  setShowPasteFallback(false);
                  setPastedHtmlInput("");
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
              <Alert.Title>Warnings</Alert.Title>
              <List.Root>
                {warnings.map((warning, index) => (
                  <List.Item key={`${warning}-${index}`}>
                    <Code whiteSpace={"pre-wrap"}>{warning}</Code>
                  </List.Item>
                ))}
              </List.Root>
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
              <Box p={3} borderBottomWidth={"1px"} borderColor={"border.subtle"}>
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
                  style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
                />
              </Box>
            </Box>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
}