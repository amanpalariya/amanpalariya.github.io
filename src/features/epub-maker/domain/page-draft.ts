import { createPageId } from "../utils/id";
import type { PageDraft, SanitizationPolicy } from "../types";
import {
  getTextPreviewHtml,
  inferTitleFromText,
  plainTextToHtml,
} from "./plain-text";
import { inferTitleFromHtml, sanitizeHtmlContent } from "./html-sanitizer";

export interface CreatePageDraftOptions {
  defaultTitle?: string;
  textUseDefaultTitle?: boolean;
  htmlUseHeadTitleOnly?: boolean;
}

export function createPageDraftFromInput(
  content: string,
  index: number,
  policy: SanitizationPolicy,
  options?: CreatePageDraftOptions,
): PageDraft | null {
  if (!content.trim()) return null;

  const providedDefaultTitle = options?.defaultTitle?.trim() || "";
  const generatedDefaultTitle = `Page ${index}`;
  const defaultPageTitle = providedDefaultTitle || generatedDefaultTitle;
  const looksLikeHtml = /<\s*[a-zA-Z!/]/.test(content);

  if (looksLikeHtml) {
    const inferredTitleFromContent = inferTitleFromHtml(content, "").trim();
    const sanitized = sanitizeHtmlContent(content, "", policy);
    const htmlDeclaredTitle = sanitized.title?.trim() || "";
    const htmlFallbackTitle =
      htmlDeclaredTitle ||
      providedDefaultTitle ||
      inferredTitleFromContent ||
      generatedDefaultTitle;

    return {
      id: createPageId(),
      title: htmlFallbackTitle,
      inputKind: "html",
      rawContent: content,
      baseUrl: sanitized.baseUrl,
      previewHtml: sanitized.previewHtml,
      createdAt: Date.now(),
    };
  }

  if (options?.textUseDefaultTitle) {
    return {
      id: createPageId(),
      title: defaultPageTitle,
      inputKind: "text",
      rawContent: content,
      baseUrl: null,
      previewHtml: getTextPreviewHtml(content),
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
