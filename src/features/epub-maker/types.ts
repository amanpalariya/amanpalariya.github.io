import type { ReactNode } from "react";

export type PageInputKind = "html" | "text";
export type FileNameMode = "auto" | "manual";
export type PageId = string;
export type ChapterGenerationStatus = "pending" | "processing" | "completed";
export type CoverMode = "auto" | "custom";
export type CoverTextPosition =
  | "style_1"
  | "style_2"
  | "style_3"
  | "style_4"
  | "style_5"
  | "style_6";
export type CoverTextColorMode = "light" | "dark" | "adaptive";
export type BaseCoverTemplateId =
  | "classic"
  | "aurora"
  | "ember"
  | "midnight"
  | "sage"
  | "sunset";
export type CoverTemplateId = BaseCoverTemplateId | "custom";

export type CoverSizePresetId = string;

export interface CoverTemplateOption {
  id: CoverTemplateId;
  label: string;
  description: string;
}

export interface CoverSizePresetOption {
  id: CoverSizePresetId;
  label: string;
  description: string;
  width: number;
  height: number;
}

export interface PageDraft {
  id: PageId;
  title: string;
  inputKind: PageInputKind;
  rawContent: string;
  baseUrl: string | null;
  previewHtml: string;
  createdAt: number;
}

export interface EpubImage {
  id: string;
  href: string;
  mediaType: string;
  bytes: Uint8Array;
  sourceUrl: string;
}

export interface SanitizedHtmlResult {
  title: string;
  baseUrl: string | null;
  chapterBodyHtml: string;
  previewHtml: string;
  stats: {
    droppedNodes: number;
    rewrittenLinks: number;
    rewrittenImages: number;
  };
}

export interface GenerationWarning {
  code:
    | "UNRESOLVED_IMAGE"
    | "FETCH_IMAGE_FAILED"
    | "MALFORMED_DATA_URL"
    | "EMPTY_PAGE_SKIPPED"
    | "UNSUPPORTED_TAG_REMOVED";
  message: string;
  pageId?: PageId;
  source?: string;
}

export interface GenerationSummary {
  fileName: string;
  chapterCount: number;
  coverIncluded: boolean;
  embeddedImageCount: number;
  externalImageCount: number;
  durationMs: number;
}

export interface UiNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: ReactNode;
}

export interface SanitizationPolicy {
  dropTags: Set<string>;
  allowTags: Set<string>;
  allowExternalLinks: boolean;
  embedRemoteImages: boolean;
  maxPreviewNodes: number;
}

export interface CoverDraft {
  mode: CoverMode;
  title: string;
  rawHtml: string;
  previewHtml: string;
}

export interface BuildEpubInput {
  bookTitle: string;
  bookAuthor?: string;
  downloadFileName?: string;
  pages: PageDraft[];
  cover?: CoverDraft;
  sanitizePolicy: SanitizationPolicy;
  signal?: AbortSignal;
  onProgress?: (update: BuildEpubProgressUpdate) => void;
}

export interface BuildEpubProgressUpdate {
  value: number;
  phase: "preparing" | "processing_chapter" | "finalizing" | "done";
  chapterIndex: number | null;
  currentPageId: PageId | null;
  completedPageIds: PageId[];
}

export interface BuildEpubResult {
  blob: Blob;
  warnings: GenerationWarning[];
  summary: GenerationSummary;
}

export interface EpubMakerPrefs {
  title: string;
  author: string;
  coverTemplateId: CoverTemplateId;
  coverBaseTemplateId: BaseCoverTemplateId;
  coverSizePresetId: CoverSizePresetId;
  coverTextScalePercent: number;
  coverTextPosition: CoverTextPosition;
  coverTextColorMode: CoverTextColorMode;
  hideCoverText: boolean;
  manualFileName: string;
  fileNameMode: FileNameMode;
  sanitizeOptions: {
    embedRemoteImages: boolean;
    allowExternalLinks: boolean;
  };
}

export interface EpubMakerState {
  pages: PageDraft[];
  coverMode: CoverMode;
  coverTemplateId: CoverTemplateId;
  coverTemplateOptions: CoverTemplateOption[];
  coverSizePresetId: CoverSizePresetId;
  coverSizePresetOptions: CoverSizePresetOption[];
  coverTextScalePercent: number;
  coverTextPosition: CoverTextPosition;
  coverTextColorMode: CoverTextColorMode;
  hideCoverText: boolean;
  isCoverEnabled: boolean;
  coverPreviewHtml: string;
  hasCustomCover: boolean;
  isAdding: boolean;
  isGenerating: boolean;
  generationProgress: number | null;
  showDownloadCompleteIcon: boolean;
  activeGenerationPageId: PageId | null;
  generationChapterStatusByPageId: Record<PageId, ChapterGenerationStatus>;
  isGenerationStatusFading: boolean;
  showPasteFallback: boolean;
  pastedInput: string;
  warnings: GenerationWarning[];
  errors: string[];
  summary: string;
  notifications: UiNotification[];
  prefs: EpubMakerPrefs;
}
