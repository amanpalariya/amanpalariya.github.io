export type PageInputKind = "html" | "text";
export type FileNameMode = "auto" | "manual";
export type PageId = string;

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
  embeddedImageCount: number;
  externalImageCount: number;
  durationMs: number;
}

export interface UiNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
}

export interface SanitizationPolicy {
  dropTags: Set<string>;
  allowTags: Set<string>;
  allowExternalLinks: boolean;
  embedRemoteImages: boolean;
  maxPreviewNodes: number;
}

export interface BuildEpubInput {
  bookTitle: string;
  bookAuthor?: string;
  downloadFileName?: string;
  pages: PageDraft[];
  sanitizePolicy: SanitizationPolicy;
  onProgress?: (value: number) => void;
}

export interface BuildEpubResult {
  blob: Blob;
  warnings: GenerationWarning[];
  summary: GenerationSummary;
}

export interface EpubMakerPrefs {
  title: string;
  author: string;
  manualFileName: string;
  fileNameMode: FileNameMode;
  sanitizeOptions: {
    embedRemoteImages: boolean;
    allowExternalLinks: boolean;
  };
}

export interface EpubMakerState {
  pages: PageDraft[];
  isAdding: boolean;
  isGenerating: boolean;
  generationProgress: number | null;
  showPasteFallback: boolean;
  pastedInput: string;
  warnings: GenerationWarning[];
  errors: string[];
  summary: string;
  notifications: UiNotification[];
  prefs: EpubMakerPrefs;
}
