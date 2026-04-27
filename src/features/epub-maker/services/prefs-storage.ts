import {
  DEFAULT_BOOK_TITLE,
  EPUB_MAKER_STORAGE_FIELDS,
  EPUB_MAKER_TOOL_ID,
} from "../constants";
import type {
  CoverSizePresetId,
  CoverTemplateId,
  EpubMakerPrefs,
  FileNameMode,
} from "../types";
import { buildToolStorageKey } from "@utils/storage";

const defaultPrefs: EpubMakerPrefs = {
  title: "",
  author: "",
  coverTemplateId: "classic",
  coverSizePresetId: "kindle_portrait",
  coverTextScalePercent: 100,
  includeTextOnCustomCover: true,
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

function isCoverTemplateId(value: unknown): value is CoverTemplateId {
  return (
    value === "classic" ||
    value === "aurora" ||
    value === "ember" ||
    value === "midnight" ||
    value === "sage" ||
    value === "sunset"
  );
}

function isCoverSizePresetId(value: unknown): value is CoverSizePresetId {
  return (
    value === "kindle_portrait" ||
    value === "trade_portrait" ||
    value === "square" ||
    value === "paperback_6x9"
  );
}

function clampCoverTextScalePercent(value: number): number {
  if (!Number.isFinite(value)) return defaultPrefs.coverTextScalePercent;
  return Math.max(70, Math.min(180, Math.round(value)));
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
    const coverTemplateIdValue = readToolString(
      EPUB_MAKER_STORAGE_FIELDS.coverTemplateId,
      defaultPrefs.coverTemplateId,
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
    return {
      title: readToolString(EPUB_MAKER_STORAGE_FIELDS.title, defaultPrefs.title),
      author: readToolString(EPUB_MAKER_STORAGE_FIELDS.author, defaultPrefs.author),
      coverTemplateId: isCoverTemplateId(coverTemplateIdValue)
        ? coverTemplateIdValue
        : defaultPrefs.coverTemplateId,
      coverSizePresetId: isCoverSizePresetId(coverSizePresetIdValue)
        ? coverSizePresetIdValue
        : defaultPrefs.coverSizePresetId,
      coverTextScalePercent: clampCoverTextScalePercent(coverTextScalePercentValue),
      includeTextOnCustomCover: readToolBoolean(
        EPUB_MAKER_STORAGE_FIELDS.includeTextOnCustomCover,
        defaultPrefs.includeTextOnCustomCover,
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
      buildToolStorageKey(EPUB_MAKER_TOOL_ID, EPUB_MAKER_STORAGE_FIELDS.coverTemplateId),
      prefs.coverTemplateId,
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
        EPUB_MAKER_STORAGE_FIELDS.includeTextOnCustomCover,
      ),
      prefs.includeTextOnCustomCover ? "true" : "false",
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
