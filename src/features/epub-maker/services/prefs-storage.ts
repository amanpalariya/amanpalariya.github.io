import { DEFAULT_BOOK_TITLE, EPUB_MAKER_PREFS_KEY } from "../constants";
import type { EpubMakerPrefs, FileNameMode } from "../types";

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

export function readEpubMakerPrefs(): EpubMakerPrefs {
  if (typeof window === "undefined") return defaultPrefs;

  try {
    const raw = window.localStorage.getItem(EPUB_MAKER_PREFS_KEY);
    if (!raw) return defaultPrefs;

    const parsed = JSON.parse(raw) as Partial<EpubMakerPrefs>;
    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      author: typeof parsed.author === "string" ? parsed.author : "",
      manualFileName:
        typeof parsed.manualFileName === "string" ? parsed.manualFileName : "",
      fileNameMode: isFileNameMode(parsed.fileNameMode)
        ? parsed.fileNameMode
        : "auto",
      sanitizeOptions: {
        embedRemoteImages:
          parsed.sanitizeOptions?.embedRemoteImages ??
          defaultPrefs.sanitizeOptions.embedRemoteImages,
        allowExternalLinks:
          parsed.sanitizeOptions?.allowExternalLinks ??
          defaultPrefs.sanitizeOptions.allowExternalLinks,
      },
    };
  } catch {
    return defaultPrefs;
  }
}

export function writeEpubMakerPrefs(prefs: EpubMakerPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EPUB_MAKER_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore localStorage write failures
  }
}

export function getNormalizedBookTitle(title: string): string {
  return title.trim() || DEFAULT_BOOK_TITLE;
}
