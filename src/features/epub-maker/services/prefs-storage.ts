import {
  DEFAULT_BOOK_TITLE,
  EPUB_MAKER_STORAGE_FIELDS,
  EPUB_MAKER_TOOL_ID,
} from "../constants";
import type {
  BaseCoverBackgroundId,
  CoverTextColorMode,
  CoverSizePresetId,
  CoverBackgroundId,
  EpubMakerPrefs,
  FileNameMode,
} from "../types";
import { buildToolStorageKey } from "@utils/storage";

const defaultPrefs: EpubMakerPrefs = {
  title: "",
  author: "",
  coverBackgroundId: "monochrome",
  coverBaseBackgroundId: "monochrome",
  coverSizePresetId: "ratio_1_1_6",
  coverTextScalePercent: 100,
  coverTextPosition: "style_1",
  coverTextColorMode: "adaptive",
  hideCoverText: false,
  manualFileName: "",
  fileNameMode: "auto",
  sanitizeOptions: {
    embedRemoteImages: true,
    allowExternalLinks: true,
  },
};

function isFileNameMode(value: unknown): value is FileNameMode {
  return value === "auto" || value === "manual";
}

function isBaseCoverBackgroundId(value: unknown): value is BaseCoverBackgroundId {
  return (
    value === "monochrome" ||
    value === "aurora" ||
    value === "ember" ||
    value === "noir" ||
    value === "geometric" ||
    value === "floral"
  );
}

function isCoverBackgroundId(value: unknown): value is CoverBackgroundId {
  return value === "custom" || isBaseCoverBackgroundId(value);
}

function isCoverSizePresetId(value: unknown): value is CoverSizePresetId {
  return typeof value === "string" && value.trim().length > 0;
}

function clampCoverTextScalePercent(value: number): number {
  if (!Number.isFinite(value)) return defaultPrefs.coverTextScalePercent;
  return Math.max(70, Math.min(180, Math.round(value)));
}

function isCoverTextPosition(value: unknown): value is EpubMakerPrefs["coverTextPosition"] {
  return (
    value === "style_1" ||
    value === "style_2" ||
    value === "style_3" ||
    value === "style_4" ||
    value === "style_5" ||
    value === "style_6"
  );
}

function isCoverTextColorMode(value: unknown): value is CoverTextColorMode {
  return value === "light" || value === "dark" || value === "adaptive";
}

function readToolString(field: string, fallback: string): string {
  const value = window.localStorage.getItem(buildToolStorageKey(EPUB_MAKER_TOOL_ID, field));
  return typeof value === "string" ? value : fallback;
}

function readToolBoolean(field: string, fallback: boolean): boolean {
  const value = window.localStorage.getItem(buildToolStorageKey(EPUB_MAKER_TOOL_ID, field));
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function readEpubMakerPrefs(): EpubMakerPrefs {
  if (typeof window === "undefined") return defaultPrefs;

  try {
    const fileNameModeValue = readToolString(
      EPUB_MAKER_STORAGE_FIELDS.fileNameMode,
      defaultPrefs.fileNameMode,
    );
    const coverBackgroundIdValue = readToolString(
      EPUB_MAKER_STORAGE_FIELDS.coverBackgroundId,
      defaultPrefs.coverBackgroundId,
    );
    const coverBaseBackgroundIdValue = readToolString(
      EPUB_MAKER_STORAGE_FIELDS.coverBaseBackgroundId,
      defaultPrefs.coverBaseBackgroundId,
    );
    const coverSizePresetIdValue = readToolString(
      EPUB_MAKER_STORAGE_FIELDS.coverSizePresetId,
      defaultPrefs.coverSizePresetId,
    );
    const coverTextScalePercentValue = Number(
      readToolString(
        EPUB_MAKER_STORAGE_FIELDS.coverTextScalePercent,
        String(defaultPrefs.coverTextScalePercent),
      ),
    );
    const coverTextPositionValue = readToolString(
      EPUB_MAKER_STORAGE_FIELDS.coverTextPosition,
      defaultPrefs.coverTextPosition,
    );
    const coverTextColorModeValue = readToolString(
      EPUB_MAKER_STORAGE_FIELDS.coverTextColorMode,
      defaultPrefs.coverTextColorMode,
    );
    return {
      title: readToolString(EPUB_MAKER_STORAGE_FIELDS.title, defaultPrefs.title),
      author: readToolString(EPUB_MAKER_STORAGE_FIELDS.author, defaultPrefs.author),
      coverBackgroundId: isCoverBackgroundId(coverBackgroundIdValue)
        ? coverBackgroundIdValue
        : defaultPrefs.coverBackgroundId,
      coverBaseBackgroundId: isBaseCoverBackgroundId(coverBaseBackgroundIdValue)
        ? coverBaseBackgroundIdValue
        : isBaseCoverBackgroundId(coverBackgroundIdValue)
          ? coverBackgroundIdValue
          : defaultPrefs.coverBaseBackgroundId,
      coverSizePresetId: isCoverSizePresetId(coverSizePresetIdValue)
        ? coverSizePresetIdValue
        : defaultPrefs.coverSizePresetId,
      coverTextScalePercent: clampCoverTextScalePercent(coverTextScalePercentValue),
      coverTextPosition: isCoverTextPosition(coverTextPositionValue)
        ? coverTextPositionValue
        : defaultPrefs.coverTextPosition,
      coverTextColorMode: isCoverTextColorMode(coverTextColorModeValue)
        ? coverTextColorModeValue
        : defaultPrefs.coverTextColorMode,
      hideCoverText: readToolBoolean(
        EPUB_MAKER_STORAGE_FIELDS.hideCoverText,
        defaultPrefs.hideCoverText,
      ),
      manualFileName: readToolString(
        EPUB_MAKER_STORAGE_FIELDS.manualFileName,
        defaultPrefs.manualFileName,
      ),
      fileNameMode: isFileNameMode(fileNameModeValue)
        ? fileNameModeValue
        : defaultPrefs.fileNameMode,
      sanitizeOptions: {
        embedRemoteImages: readToolBoolean(
          EPUB_MAKER_STORAGE_FIELDS.sanitizeEmbedRemoteImages,
          defaultPrefs.sanitizeOptions.embedRemoteImages,
        ),
        allowExternalLinks: readToolBoolean(
          EPUB_MAKER_STORAGE_FIELDS.sanitizeAllowExternalLinks,
          defaultPrefs.sanitizeOptions.allowExternalLinks,
        ),
      },
    };
  } catch {
    return defaultPrefs;
  }
}

export function writeEpubMakerPrefs(prefs: EpubMakerPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      buildToolStorageKey(EPUB_MAKER_TOOL_ID, EPUB_MAKER_STORAGE_FIELDS.title),
      prefs.title,
    );
    window.localStorage.setItem(
      buildToolStorageKey(EPUB_MAKER_TOOL_ID, EPUB_MAKER_STORAGE_FIELDS.author),
      prefs.author,
    );
    window.localStorage.setItem(
      buildToolStorageKey(EPUB_MAKER_TOOL_ID, EPUB_MAKER_STORAGE_FIELDS.coverBackgroundId),
      prefs.coverBackgroundId,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.coverBaseBackgroundId,
      ),
      prefs.coverBaseBackgroundId,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.coverSizePresetId,
      ),
      prefs.coverSizePresetId,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.coverTextScalePercent,
      ),
      String(clampCoverTextScalePercent(prefs.coverTextScalePercent)),
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.coverTextPosition,
      ),
      prefs.coverTextPosition,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.coverTextColorMode,
      ),
      prefs.coverTextColorMode,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.hideCoverText,
      ),
      prefs.hideCoverText ? "true" : "false",
    );
    window.localStorage.setItem(
      buildToolStorageKey(EPUB_MAKER_TOOL_ID, EPUB_MAKER_STORAGE_FIELDS.manualFileName),
      prefs.manualFileName,
    );
    window.localStorage.setItem(
      buildToolStorageKey(EPUB_MAKER_TOOL_ID, EPUB_MAKER_STORAGE_FIELDS.fileNameMode),
      prefs.fileNameMode,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.sanitizeEmbedRemoteImages,
      ),
      prefs.sanitizeOptions.embedRemoteImages ? "true" : "false",
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.sanitizeAllowExternalLinks,
      ),
      prefs.sanitizeOptions.allowExternalLinks ? "true" : "false",
    );
  } catch {
    // ignore localStorage write failures
  }
}

export function getNormalizedBookTitle(title: string): string {
  return title.trim() || DEFAULT_BOOK_TITLE;
}
