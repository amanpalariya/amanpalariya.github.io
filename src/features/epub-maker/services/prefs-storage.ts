import {
  DEFAULT_BOOK_TITLE,
  EPUB_MAKER_STORAGE_FIELDS,
  EPUB_MAKER_TOOL_ID,
} from "../constants";
import type { EpubMakerPrefs, FileNameMode } from "../types";
import { buildToolStorageKey } from "@utils/storage";

const defaultPrefs: EpubMakerPrefs = {
  title: "",
  author: "",
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
    return {
      title: readToolString(EPUB_MAKER_STORAGE_FIELDS.title, defaultPrefs.title),
      author: readToolString(EPUB_MAKER_STORAGE_FIELDS.author, defaultPrefs.author),
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
