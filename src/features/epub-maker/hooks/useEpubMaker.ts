import { ClipboardEvent, useEffect, useMemo, useState } from "react";
import { createDefaultSanitizationPolicy, DEFAULT_BOOK_TITLE } from "../constants";
import type { EpubMakerState, GenerationWarning, PageDraft } from "../types";
import { buildAutoEpubFileName, buildEpubFileName } from "../utils/file-name";
import { createPageDraftFromInput } from "../domain/page-draft";
import { readClipboardPageInput } from "../services/clipboard";
import {
  getNormalizedBookTitle,
  readEpubMakerPrefs,
  writeEpubMakerPrefs,
} from "../services/prefs-storage";
import { buildEpub } from "../domain/epub-builder";
import { downloadBlob } from "../services/download";

export type UseEpubMakerReturn = EpubMakerState & {
  normalizedBookTitle: string;
  normalizedBookAuthor: string;
  autoEpubFileName: string;
  effectiveFileName: string;
  addPageFromClipboard: () => Promise<void>;
  onPasteInput: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  addFromFallbackText: () => void;
  removePage: (id: string) => void;
  renamePage: (id: string, title: string) => void;
  movePageUp: (id: string) => void;
  movePageDown: (id: string) => void;
  generateEpub: () => Promise<void>;
  setShowPasteFallback: (value: boolean) => void;
  setPastedInput: (value: string) => void;
  setWarnings: (value: GenerationWarning[]) => void;
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setManualFileName: (value: string) => void;
  toggleFileNameMode: () => void;
  setEmbedRemoteImages: (value: boolean) => void;
  setAllowExternalLinks: (value: boolean) => void;
};

export function useEpubMaker(): UseEpubMakerReturn {
  const [pages, setPages] = useState<PageDraft[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<number | null>(null);
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [pastedInput, setPastedInput] = useState("");
  const [warnings, setWarnings] = useState<GenerationWarning[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [prefs, setPrefs] = useState<EpubMakerState["prefs"]>(readEpubMakerPrefs());
  const [isPrefsLoaded, setIsPrefsLoaded] = useState(false);

  const normalizedBookTitle = getNormalizedBookTitle(prefs.title);
  const normalizedBookAuthor = prefs.author.trim();
  const autoEpubFileName = buildAutoEpubFileName(
    normalizedBookTitle,
    normalizedBookAuthor,
  );
  const effectiveFileName =
    prefs.fileNameMode === "manual"
      ? buildEpubFileName(
          prefs.manualFileName,
          normalizedBookTitle,
          normalizedBookAuthor,
        )
      : autoEpubFileName;

  const sanitizePolicy = useMemo(() => {
    const policy = createDefaultSanitizationPolicy();
    policy.embedRemoteImages = prefs.sanitizeOptions.embedRemoteImages;
    policy.allowExternalLinks = prefs.sanitizeOptions.allowExternalLinks;
    return policy;
  }, [prefs.sanitizeOptions.embedRemoteImages, prefs.sanitizeOptions.allowExternalLinks]);

  useEffect(() => {
    setPrefs(readEpubMakerPrefs());
    setIsPrefsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isPrefsLoaded) return;
    writeEpubMakerPrefs(prefs);
  }, [isPrefsLoaded, prefs]);

  function addInputAsPage(content: string) {
    if (!content.trim()) {
      setErrors(["Clipboard/fallback input is empty."]);
      return;
    }

    const isDuplicate = pages.some(
      (page) => page.rawContent.trim() === content.trim(),
    );
    if (isDuplicate) {
      setWarnings((prev) => [
        ...prev,
        {
          code: "EMPTY_PAGE_SKIPPED",
          message: "Duplicate page content detected and skipped.",
        },
      ]);
      return;
    }

    const page = createPageDraftFromInput(content, pages.length + 1, sanitizePolicy);
    if (!page) {
      setErrors(["Could not build page from pasted input."]);
      return;
    }

    setPages((prev) => [...prev, page]);
    setSummary("");
    setErrors([]);
    setPastedInput("");
  }

  async function addPageFromClipboard() {
    setIsAdding(true);
    setErrors([]);
    try {
      const content = await readClipboardPageInput();
      addInputAsPage(content);
    } catch (error) {
      setErrors([
        `Could not read formatted clipboard content automatically: ${String(error)}. Use the paste fallback below.`,
      ]);
      setShowPasteFallback(true);
    } finally {
      setIsAdding(false);
    }
  }

  function onPasteInput(event: ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData("text/html");
    if (html?.trim()) {
      event.preventDefault();
      addInputAsPage(html);
      return;
    }

    const text = event.clipboardData.getData("text/plain");
    if (text?.trim()) {
      event.preventDefault();
      addInputAsPage(text);
    }
  }

  function addFromFallbackText() {
    if (!pastedInput.trim()) {
      setErrors(["Paste HTML or text first, then add page."]);
      return;
    }
    addInputAsPage(pastedInput);
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((page) => page.id !== id));
    setSummary("");
  }

  function renamePage(id: string, title: string) {
    setPages((prev) =>
      prev.map((page) =>
        page.id === id ? { ...page, title: title.trim() || page.title } : page,
      ),
    );
  }

  function movePageUp(id: string) {
    setPages((prev) => {
      const index = prev.findIndex((page) => page.id === id);
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function movePageDown(id: string) {
    setPages((prev) => {
      const index = prev.findIndex((page) => page.id === id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }

  async function generateEpub() {
    setIsGenerating(true);
    setGenerationProgress(0);
    setWarnings([]);
    setErrors([]);
    setSummary("");

    if (pages.length === 0) {
      setErrors(["Add at least one page from clipboard before generating EPUB."]);
      setIsGenerating(false);
      setGenerationProgress(null);
      return;
    }

    try {
      const result = await buildEpub({
        bookTitle: normalizedBookTitle || DEFAULT_BOOK_TITLE,
        bookAuthor: normalizedBookAuthor,
        downloadFileName: effectiveFileName,
        pages,
        sanitizePolicy,
        onProgress: setGenerationProgress,
      });

      downloadBlob(result.blob, effectiveFileName);
      setWarnings(result.warnings);
      setSummary(
        `Generated and downloaded ${effectiveFileName} with ${result.summary.chapterCount} page(s), ${result.summary.embeddedImageCount} embedded image(s), and ${result.summary.externalImageCount} external image reference(s).`,
      );

      if (prefs.fileNameMode === "manual" && !prefs.manualFileName.trim()) {
        setPrefs((prev) => ({ ...prev, manualFileName: autoEpubFileName }));
      }
    } catch (error) {
      setErrors([`Unexpected error while generating EPUB: ${String(error)}`]);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  }

  return {
    pages,
    isAdding,
    isGenerating,
    generationProgress,
    showPasteFallback,
    pastedInput,
    warnings,
    errors,
    summary,
    prefs,
    normalizedBookTitle,
    normalizedBookAuthor,
    autoEpubFileName,
    effectiveFileName,
    addPageFromClipboard,
    onPasteInput,
    addFromFallbackText,
    removePage,
    renamePage,
    movePageUp,
    movePageDown,
    generateEpub,
    setShowPasteFallback,
    setPastedInput,
    setWarnings,
    setTitle: (value: string) => setPrefs((prev) => ({ ...prev, title: value })),
    setAuthor: (value: string) => setPrefs((prev) => ({ ...prev, author: value })),
    setManualFileName: (value: string) =>
      setPrefs((prev) => ({
        ...prev,
        fileNameMode: prev.fileNameMode === "auto" ? "manual" : prev.fileNameMode,
        manualFileName: value,
      })),
    toggleFileNameMode: () =>
      setPrefs((prev) => {
        const nextMode = prev.fileNameMode === "auto" ? "manual" : "auto";
        return {
          ...prev,
          fileNameMode: nextMode,
          manualFileName:
            nextMode === "manual" && !prev.manualFileName.trim()
              ? autoEpubFileName
              : prev.manualFileName,
        };
      }),
    setEmbedRemoteImages: (value: boolean) =>
      setPrefs((prev) => ({
        ...prev,
        sanitizeOptions: { ...prev.sanitizeOptions, embedRemoteImages: value },
      })),
    setAllowExternalLinks: (value: boolean) =>
      setPrefs((prev) => ({
        ...prev,
        sanitizeOptions: { ...prev.sanitizeOptions, allowExternalLinks: value },
      })),
  };
}
