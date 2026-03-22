import { inferTitleFromText } from "./plain-text";
import type { SanitizationPolicy, SanitizedHtmlResult } from "../types";
import { resolveAbsoluteUrl } from "../utils/url";

export function inferTitleFromHtml(value: string, fallback: string): string {
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

function createPreviewDocument(body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="color-scheme" content="light" /><style>:root{color-scheme:light}html,body{margin:0;padding:0;overflow:hidden;background:#fff;color:#111}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;line-height:1.35;padding:10px}img{max-width:100%;height:auto}h1,h2,h3,h4,h5,h6{margin:8px 0 4px}p,li,blockquote,pre{margin:4px 0}a{color:#2563eb;text-decoration:none}*{scrollbar-width:none}*::-webkit-scrollbar{width:0;height:0}</style></head><body>${body}</body></html>`;
}

function appendSanitizedNode(
  sourceNode: ChildNode,
  targetParent: Element,
  out: Document,
  baseUrl: string | null,
  policy: SanitizationPolicy,
  stats: SanitizedHtmlResult["stats"],
) {
  if (sourceNode.nodeType === Node.TEXT_NODE) {
    const text = sourceNode.textContent;
    if (text) targetParent.appendChild(out.createTextNode(text));
    return;
  }

  if (sourceNode.nodeType !== Node.ELEMENT_NODE) return;

  const sourceEl = sourceNode as HTMLElement;
  const tag = sourceEl.tagName.toLowerCase();

  if (policy.dropTags.has(tag)) {
    stats.droppedNodes += 1;
    return;
  }

  if (!policy.allowTags.has(tag)) {
    stats.droppedNodes += 1;
    for (const child of Array.from(sourceEl.childNodes)) {
      appendSanitizedNode(child, targetParent, out, baseUrl, policy, stats);
    }
    return;
  }

  const target = out.createElement(tag);

  if (tag === "a") {
    const href = sourceEl.getAttribute("href");
    if (href) {
      const absoluteHref = resolveAbsoluteUrl(href, baseUrl);
      if (absoluteHref && policy.allowExternalLinks) {
        target.setAttribute("href", absoluteHref);
        stats.rewrittenLinks += 1;
      }
    }
  }

  if (tag === "img") {
    const src = sourceEl.getAttribute("src");
    if (!src) {
      stats.droppedNodes += 1;
      return;
    }
    const absoluteSrc = resolveAbsoluteUrl(src, baseUrl);
    if (!absoluteSrc) {
      stats.droppedNodes += 1;
      return;
    }
    target.setAttribute("src", absoluteSrc);
    const alt = sourceEl.getAttribute("alt");
    if (alt) target.setAttribute("alt", alt);
    stats.rewrittenImages += 1;
    targetParent.appendChild(target);
    return;
  }

  for (const child of Array.from(sourceEl.childNodes)) {
    appendSanitizedNode(child, target, out, baseUrl, policy, stats);
  }

  targetParent.appendChild(target);
}

export function sanitizeHtmlContent(
  html: string,
  fallbackPageTitle: string,
  policy: SanitizationPolicy,
): SanitizedHtmlResult {
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
  const stats: SanitizedHtmlResult["stats"] = {
    droppedNodes: 0,
    rewrittenImages: 0,
    rewrittenLinks: 0,
  };

  for (const child of Array.from(sourceRoot.childNodes)) {
    appendSanitizedNode(child, container, out, baseUrl, policy, stats);
  }

  const previewContainer = out.createElement("div");
  const previewNodes = Array.from(container.childNodes).slice(
    0,
    policy.maxPreviewNodes,
  );
  for (const node of previewNodes) {
    previewContainer.appendChild(node.cloneNode(true));
  }

  return {
    title,
    baseUrl,
    chapterBodyHtml: container.innerHTML,
    previewHtml: createPreviewDocument(previewContainer.innerHTML),
    stats,
  };
}
