import type {
  BaseCoverBackgroundId,
  CoverSettingsState,
  CoverTextColorMode,
  CoverTextPosition,
  CoverSizePresetId,
  EpubMakerPrefs,
  SanitizationPolicy,
} from "./types";

export const EPUB_MAKER_TOOL_ID = "epub-maker";
export const EPUB_MAKER_STORAGE_FIELDS = {
  title: "title",
  author: "author",
  cover: "cover",
  manualFileName: "manual-file-name",
  fileNameMode: "file-name-mode",
  generationOptions: "generation-options",
} as const;
export const DEFAULT_BOOK_TITLE = "EPUB Maker";
export const DEFAULT_COVER_BASE_BACKGROUND_ID: BaseCoverBackgroundId =
  "monochrome";
export const DEFAULT_COVER_SIZE_PRESET_ID: CoverSizePresetId = "ratio_1_1_6";
export const DEFAULT_COVER_TEXT_SCALE_PERCENT = 100;
export const DEFAULT_COVER_TEXT_POSITION: CoverTextPosition = "style_1";
export const DEFAULT_COVER_TEXT_COLOR_MODE: CoverTextColorMode = "adaptive";
export const DEFAULT_COVER_HIDE_TEXT = false;

export function createDefaultCoverPrefs(): EpubMakerPrefs["cover"] {
  return {
    backgroundId: DEFAULT_COVER_BASE_BACKGROUND_ID,
    baseBackgroundId: DEFAULT_COVER_BASE_BACKGROUND_ID,
    sizePresetId: DEFAULT_COVER_SIZE_PRESET_ID,
    textScalePercent: DEFAULT_COVER_TEXT_SCALE_PERCENT,
    textPosition: DEFAULT_COVER_TEXT_POSITION,
    textColorMode: DEFAULT_COVER_TEXT_COLOR_MODE,
    hideText: DEFAULT_COVER_HIDE_TEXT,
  };
}

export function createDefaultCoverSettings(): CoverSettingsState {
  return {
    coverEnabled: true,
    customCoverHtml: null,
    coverBaseBackgroundId: DEFAULT_COVER_BASE_BACKGROUND_ID,
    coverSizePresetId: DEFAULT_COVER_SIZE_PRESET_ID,
    coverTextPosition: DEFAULT_COVER_TEXT_POSITION,
    coverTextScalePercent: DEFAULT_COVER_TEXT_SCALE_PERCENT,
    coverTextColorMode: DEFAULT_COVER_TEXT_COLOR_MODE,
    hideCoverText: DEFAULT_COVER_HIDE_TEXT,
  };
}

const DROP_TAGS = [
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
];

const ALLOW_TAGS = [
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
];

export function createDefaultSanitizationPolicy(): SanitizationPolicy {
  return {
    dropTags: new Set(DROP_TAGS),
    allowTags: new Set(ALLOW_TAGS),
    allowExternalLinks: true,
    embedRemoteImages: true,
    maxPreviewNodes: 10,
  };
}
