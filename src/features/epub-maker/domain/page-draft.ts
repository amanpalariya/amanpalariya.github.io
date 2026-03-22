import { createPageId } from "../utils/id";
import type { PageDraft, SanitizationPolicy } from "../types";
import {
  getTextPreviewHtml,
  inferTitleFromText,
  plainTextToHtml,
} from "./plain-text";
import { inferTitleFromHtml, sanitizeHtmlContent } from "./html-sanitizer";

export function createPageDraftFromInput(
  content: string,
  index: number,
  policy: SanitizationPolicy,
): PageDraft | null {
  if (!content.trim()) return null;

  const defaultPageTitle = `Page ${index}`;
  const looksLikeHtml = /<\s*[a-zA-Z!/]/.test(content);

  if (looksLikeHtml) {
    const inferredTitle = inferTitleFromHtml(content, defaultPageTitle);
    const sanitized = sanitizeHtmlContent(content, inferredTitle, policy);
    return {
      id: createPageId(),
      title: sanitized.title || defaultPageTitle,
      inputKind: "html",
      rawContent: content,
      baseUrl: sanitized.baseUrl,
      previewHtml: sanitized.previewHtml,
      createdAt: Date.now(),
    };
  }

  const fallbackPageTitle = inferTitleFromText(content, defaultPageTitle);
  return {
    id: createPageId(),
    title: fallbackPageTitle,
    inputKind: "text",
    rawContent: content,
    baseUrl: null,
    previewHtml: getTextPreviewHtml(content),
    createdAt: Date.now(),
  };
}

export function chapterBodyFromPageDraft(page: PageDraft): string {
  if (page.inputKind === "text") {
    return `<div class="plain-text">${plainTextToHtml(page.rawContent)}</div>`;
  }
  return "";
}
