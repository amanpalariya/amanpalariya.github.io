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
  cover: {
    backgroundId: "monochrome",
    baseBackgroundId: "monochrome",
    sizePresetId: "ratio_1_1_6",
    textScalePercent: 100,
    textPosition: "style_1",
    textColorMode: "adaptive",
    hideText: false,
  },
  manualFileName: "",
  fileNameMode: "auto",
  generationOptions: {
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
  if (!Number.isFinite(value)) return defaultPrefs.cover.textScalePercent;
  return Math.max(70, Math.min(180, Math.round(value)));
}

function isCoverTextPosition(
  value: unknown,
): value is EpubMakerPrefs["cover"]["textPosition"] {
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

function readToolJson<T>(field: string, fallback: T): T {
  const value = window.localStorage.getItem(
    buildToolStorageKey(EPUB_MAKER_TOOL_ID, field),
  );
  if (typeof value !== "string") return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function readEpubMakerPrefs(): EpubMakerPrefs {
  if (typeof window === "undefined") return defaultPrefs;

  try {
    const fileNameModeValue = readToolString(
      EPUB_MAKER_STORAGE_FIELDS.fileNameMode,
      defaultPrefs.fileNameMode,
    );
    const coverValue = readToolJson<Partial<EpubMakerPrefs["cover"]>>(
      EPUB_MAKER_STORAGE_FIELDS.cover,
      defaultPrefs.cover,
    );
    const generationOptionsValue = readToolJson<
      Partial<EpubMakerPrefs["generationOptions"]>
    >(
      EPUB_MAKER_STORAGE_FIELDS.generationOptions,
      defaultPrefs.generationOptions,
    );
    const coverBackgroundIdValue = coverValue.backgroundId;
    const coverBaseBackgroundIdValue = coverValue.baseBackgroundId;
    const coverSizePresetIdValue = coverValue.sizePresetId;
    const coverTextScalePercentValue = Number(coverValue.textScalePercent);
    const coverTextPositionValue = coverValue.textPosition;
    const coverTextColorModeValue = coverValue.textColorMode;
    const hideCoverTextValue = coverValue.hideText;

    const normalizedCoverBackgroundId = isCoverBackgroundId(coverBackgroundIdValue)
      ? coverBackgroundIdValue
      : defaultPrefs.cover.backgroundId;
    const normalizedCoverBaseBackgroundId = isBaseCoverBackgroundId(
      coverBaseBackgroundIdValue,
    )
      ? coverBaseBackgroundIdValue
      : isBaseCoverBackgroundId(normalizedCoverBackgroundId)
        ? normalizedCoverBackgroundId
        : defaultPrefs.cover.baseBackgroundId;

    return {
      title: readToolString(EPUB_MAKER_STORAGE_FIELDS.title, defaultPrefs.title),
      author: readToolString(EPUB_MAKER_STORAGE_FIELDS.author, defaultPrefs.author),
      cover: {
        backgroundId: normalizedCoverBackgroundId,
        baseBackgroundId: normalizedCoverBaseBackgroundId,
        sizePresetId: isCoverSizePresetId(coverSizePresetIdValue)
          ? coverSizePresetIdValue
          : defaultPrefs.cover.sizePresetId,
        textScalePercent: clampCoverTextScalePercent(coverTextScalePercentValue),
        textPosition: isCoverTextPosition(coverTextPositionValue)
          ? coverTextPositionValue
          : defaultPrefs.cover.textPosition,
        textColorMode: isCoverTextColorMode(coverTextColorModeValue)
          ? coverTextColorModeValue
          : defaultPrefs.cover.textColorMode,
        hideText:
          typeof hideCoverTextValue === "boolean"
            ? hideCoverTextValue
            : defaultPrefs.cover.hideText,
      },
      manualFileName: readToolString(
        EPUB_MAKER_STORAGE_FIELDS.manualFileName,
        defaultPrefs.manualFileName,
      ),
      fileNameMode: isFileNameMode(fileNameModeValue)
        ? fileNameModeValue
        : defaultPrefs.fileNameMode,
      generationOptions: {
        embedRemoteImages:
          typeof generationOptionsValue.embedRemoteImages === "boolean"
            ? generationOptionsValue.embedRemoteImages
            : defaultPrefs.generationOptions.embedRemoteImages,
        allowExternalLinks:
          typeof generationOptionsValue.allowExternalLinks === "boolean"
            ? generationOptionsValue.allowExternalLinks
            : defaultPrefs.generationOptions.allowExternalLinks,
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
      buildToolStorageKey(EPUB_MAKER_TOOL_ID, EPUB_MAKER_STORAGE_FIELDS.cover),
      JSON.stringify({
        backgroundId: isCoverBackgroundId(prefs.cover.backgroundId)
          ? prefs.cover.backgroundId
          : defaultPrefs.cover.backgroundId,
        baseBackgroundId: isBaseCoverBackgroundId(prefs.cover.baseBackgroundId)
          ? prefs.cover.baseBackgroundId
          : defaultPrefs.cover.baseBackgroundId,
        sizePresetId: isCoverSizePresetId(prefs.cover.sizePresetId)
          ? prefs.cover.sizePresetId
          : defaultPrefs.cover.sizePresetId,
        textScalePercent: clampCoverTextScalePercent(prefs.cover.textScalePercent),
        textPosition: isCoverTextPosition(prefs.cover.textPosition)
          ? prefs.cover.textPosition
          : defaultPrefs.cover.textPosition,
        textColorMode: isCoverTextColorMode(prefs.cover.textColorMode)
          ? prefs.cover.textColorMode
          : defaultPrefs.cover.textColorMode,
        hideText: Boolean(prefs.cover.hideText),
      } satisfies EpubMakerPrefs["cover"]),
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.manualFileName,
      ),
      prefs.manualFileName,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.fileNameMode,
      ),
      prefs.fileNameMode,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        EPUB_MAKER_TOOL_ID,
        EPUB_MAKER_STORAGE_FIELDS.generationOptions,
      ),
      JSON.stringify({
        embedRemoteImages: Boolean(prefs.generationOptions.embedRemoteImages),
        allowExternalLinks: Boolean(prefs.generationOptions.allowExternalLinks),
      } satisfies EpubMakerPrefs["generationOptions"]),
    );
  } catch {
    // ignore localStorage write failures
  }
}

export function getNormalizedBookTitle(title: string): string {
  return title.trim() || DEFAULT_BOOK_TITLE;
}
