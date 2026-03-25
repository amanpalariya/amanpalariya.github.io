import {
  type ClipboardEvent as ReactClipboardEvent,
  createElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { LuChevronDown, LuFilePlus } from "react-icons/lu";
import {
  createDefaultSanitizationPolicy,
  DEFAULT_BOOK_TITLE,
} from "../constants";
import type {
  BuildEpubProgressUpdate,
  EpubMakerState,
  GenerationWarning,
  PageId,
  PageDraft,
} from "../types";
import { buildAutoEpubFileName, buildEpubFileName } from "../utils/file-name";
import { createPageDraftFromInput } from "../domain/page-draft";
import {
  clipboardImageBlobToHtml,
  readClipboardPageInput,
} from "../services/clipboard";
import {
  getNormalizedBookTitle,
  readEpubMakerPrefs,
  writeEpubMakerPrefs,
} from "../services/prefs-storage";
import { buildEpub } from "../domain/epub-builder";
import { downloadBlob } from "../services/download";
import { renderMarkdownToHtml } from "@utils/markdown";

const PAGE_HISTORY_LIMIT = 100;
type PageFlashKind = "added" | "duplicate";
type PageFlashEntry = { kind: PageFlashKind; token: number };

interface PageHistoryState {
  past: PageDraft[][];
  present: PageDraft[];
  future: PageDraft[][];
}

type PageHistoryAction =
  | { type: "commit"; updater: (previousPages: PageDraft[]) => PageDraft[] }
  | { type: "undo" }
  | { type: "redo" };

function pageHistoryReducer(
  state: PageHistoryState,
  action: PageHistoryAction,
): PageHistoryState {
  if (action.type === "undo") {
    if (state.past.length === 0) {
      return state;
    }

    const previousPages = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previousPages,
      future: [...state.future.slice(-(PAGE_HISTORY_LIMIT - 1)), state.present],
    };
  }

  if (action.type === "redo") {
    if (state.future.length === 0) {
      return state;
    }

    const nextPages = state.future[state.future.length - 1];
    return {
      past: [...state.past.slice(-(PAGE_HISTORY_LIMIT - 1)), state.present],
      present: nextPages,
      future: state.future.slice(0, -1),
    };
  }

  const nextPages = action.updater(state.present);
  if (nextPages === state.present) {
    return state;
  }

  return {
    past: [...state.past.slice(-(PAGE_HISTORY_LIMIT - 1)), state.present],
    present: nextPages,
    future: [],
  };
}

function fileNameToTitle(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^./\\]+$/, "");
  const normalized = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized || "Untitled";
}

function isMarkdownFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  return (
    mimeType === "text/markdown" ||
    mimeType === "text/x-markdown" ||
    mimeType === "application/markdown" ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    fileName.endsWith(".mdown") ||
    fileName.endsWith(".mkd") ||
    fileName.endsWith(".mkdn")
  );
}

export type UseEpubMakerReturn = EpubMakerState & {
  normalizedBookTitle: string;
  normalizedBookAuthor: string;
  autoEpubFileName: string;
  effectiveFileName: string;
  addPageFromClipboard: () => Promise<void>;
  addPagesFromFiles: (files: FileList | File[]) => Promise<void>;
  onPasteInput: (event: ReactClipboardEvent<HTMLTextAreaElement>) => void;
  onGlobalPaste: (event: ClipboardEvent) => void;
  addFromFallbackText: () => void;
  removePage: (id: string) => void;
  renamePage: (id: string, title: string) => void;
  reorderPages: (draggedId: string, targetIndex: number) => void;
  undoPages: () => void;
  redoPages: () => void;
  canUndo: boolean;
  canRedo: boolean;
  generateEpub: () => Promise<void>;
  cancelGeneration: () => void;
  isCancellingGeneration: boolean;
  pageFlashById: Record<PageId, PageFlashEntry>;
  setShowPasteFallback: (value: boolean) => void;
  setPastedInput: (value: string) => void;
  setWarnings: (value: GenerationWarning[]) => void;
  dismissNotification: (id: string) => void;
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setManualFileName: (value: string) => void;
  toggleFileNameMode: () => void;
  setEmbedRemoteImages: (value: boolean) => void;
  setAllowExternalLinks: (value: boolean) => void;
};

export function useEpubMaker(): UseEpubMakerReturn {
  const [pageHistory, dispatchPageHistory] = useReducer(pageHistoryReducer, {
    past: [],
    present: [],
    future: [],
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancellingGeneration, setIsCancellingGeneration] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<number | null>(
    null,
  );
  const [showDownloadCompleteIcon, setShowDownloadCompleteIcon] = useState(false);
  const [activeGenerationPageId, setActiveGenerationPageId] = useState<
    string | null
  >(null);
  const [generationChapterStatusByPageId, setGenerationChapterStatusByPageId] =
    useState<EpubMakerState["generationChapterStatusByPageId"]>({});
  const [isGenerationStatusFading, setIsGenerationStatusFading] =
    useState(false);
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [pastedInput, setPastedInput] = useState("");
  const [warnings, setWarnings] = useState<GenerationWarning[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [notifications, setNotifications] = useState<
    EpubMakerState["notifications"]
  >([]);
  const [pageFlashById, setPageFlashById] = useState<
    Record<PageId, PageFlashEntry>
  >({});
  const [prefs, setPrefs] =
    useState<EpubMakerState["prefs"]>(readEpubMakerPrefs());
  const [isPrefsLoaded, setIsPrefsLoaded] = useState(false);
  const isFileImportInProgressRef = useRef(false);
  const generationStatusFadeTimerRef = useRef<number | null>(null);
  const generationStatusClearTimerRef = useRef<number | null>(null);
  const downloadCompleteIconTimerRef = useRef<number | null>(null);
  const pageFlashClearTimerRef = useRef<number | null>(null);
  const flashSequenceRef = useRef(0);
  const generationAbortControllerRef = useRef<AbortController | null>(null);
  const pages = pageHistory.present;

  const canUndo = pageHistory.past.length > 0;
  const canRedo = pageHistory.future.length > 0;

  const commitPageChange = useCallback(
    (updater: (previousPages: PageDraft[]) => PageDraft[]) => {
      dispatchPageHistory({ type: "commit", updater });
      setGenerationChapterStatusByPageId({});
      setActiveGenerationPageId(null);
      setIsGenerationStatusFading(false);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (generationStatusFadeTimerRef.current) {
        window.clearTimeout(generationStatusFadeTimerRef.current);
      }
      if (generationStatusClearTimerRef.current) {
        window.clearTimeout(generationStatusClearTimerRef.current);
      }
      if (downloadCompleteIconTimerRef.current) {
        window.clearTimeout(downloadCompleteIconTimerRef.current);
      }
      if (pageFlashClearTimerRef.current) {
        window.clearTimeout(pageFlashClearTimerRef.current);
      }
      generationAbortControllerRef.current?.abort();
    };
  }, []);

  function flashPages(ids: PageId[], kind: PageFlashKind, durationMs = 1200) {
    if (ids.length === 0) return;
    flashSequenceRef.current += 1;
    const token = flashSequenceRef.current;
    setPageFlashById((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        next[id] = { kind, token };
      }
      return next;
    });
    if (pageFlashClearTimerRef.current) {
      window.clearTimeout(pageFlashClearTimerRef.current);
    }
    pageFlashClearTimerRef.current = window.setTimeout(() => {
      setPageFlashById({});
      pageFlashClearTimerRef.current = null;
    }, durationMs);
  }

  function showDownloadCompleteIconTemporarily(durationMs = 1100) {
    if (downloadCompleteIconTimerRef.current) {
      window.clearTimeout(downloadCompleteIconTimerRef.current);
    }
    setShowDownloadCompleteIcon(true);
    downloadCompleteIconTimerRef.current = window.setTimeout(() => {
      setShowDownloadCompleteIcon(false);
      downloadCompleteIconTimerRef.current = null;
    }, durationMs);
  }

  function scheduleGenerationStatusCleanup() {
    if (generationStatusFadeTimerRef.current) {
      window.clearTimeout(generationStatusFadeTimerRef.current);
    }
    if (generationStatusClearTimerRef.current) {
      window.clearTimeout(generationStatusClearTimerRef.current);
    }

    setIsGenerationStatusFading(false);
    generationStatusFadeTimerRef.current = window.setTimeout(() => {
      setIsGenerationStatusFading(true);
    }, 700);
    generationStatusClearTimerRef.current = window.setTimeout(() => {
      setGenerationChapterStatusByPageId({});
      setActiveGenerationPageId(null);
      setIsGenerationStatusFading(false);
      generationStatusFadeTimerRef.current = null;
      generationStatusClearTimerRef.current = null;
    }, 1100);
  }

  const undoPages = useCallback(() => {
    if (isGenerating) return;
    dispatchPageHistory({ type: "undo" });
  }, [isGenerating]);

  const redoPages = useCallback(() => {
    if (isGenerating) return;
    dispatchPageHistory({ type: "redo" });
  }, [isGenerating]);

  function dismissNotification(id: string) {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }

  function notify(
    type: "success" | "error" | "warning" | "info",
    title: string,
    description?: ReactNode,
    durationMs = 4500,
  ) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((prev) => [...prev, { id, type, title, description }]);
    if (durationMs > 0) {
      window.setTimeout(() => {
        dismissNotification(id);
      }, durationMs);
    }
  }

  function addButtonHint(): ReactNode {
    return createElement(
      "span",
      {
        style: {
          display: "inline-flex",
          alignItems: "baseline",
          gap: "0.25rem",
          whiteSpace: "nowrap",
        },
      },
      createElement(
        "span",
        { style: { display: "inline-flex", lineHeight: 1 } },
        createElement(LuFilePlus, {
          style: { display: "inline-block", transform: "translateY(0.08em)" },
        }),
      ),
      createElement("span", null, "Add"),
    );
  }

  function addMenuHint(): ReactNode {
    return createElement(
      "span",
      {
        style: {
          display: "inline-flex",
          alignItems: "baseline",
          gap: "0.25rem",
          whiteSpace: "nowrap",
        },
      },
      createElement(
        "span",
        { style: { display: "inline-flex", lineHeight: 1 } },
        createElement(LuChevronDown, {
          style: { display: "inline-block", transform: "translateY(0.08em)" },
        }),
      ),
      createElement("span", null, "next to"),
      createElement(
        "span",
        { style: { display: "inline-flex", lineHeight: 1 } },
        createElement(LuFilePlus, {
          style: { display: "inline-block", transform: "translateY(0.08em)" },
        }),
      ),
      createElement("span", null, "Add"),
    );
  }

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
  }, [
    prefs.sanitizeOptions.embedRemoteImages,
    prefs.sanitizeOptions.allowExternalLinks,
  ]);

  useEffect(() => {
    setPrefs(readEpubMakerPrefs());
    setIsPrefsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isPrefsLoaded) return;
    writeEpubMakerPrefs(prefs);
  }, [isPrefsLoaded, prefs]);

  function evaluatePageInput(existingPages: PageDraft[], content: string) {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { status: "empty" as const };
    }

    const isDuplicate = existingPages.some(
      (page) => page.rawContent.trim() === trimmedContent,
    );
    if (isDuplicate) {
      const duplicatePageIds = existingPages
        .filter((page) => page.rawContent.trim() === trimmedContent)
        .map((page) => page.id);
      return { status: "duplicate" as const, duplicatePageIds };
    }

    const page = createPageDraftFromInput(
      content,
      existingPages.length + 1,
      sanitizePolicy,
    );
    if (!page) {
      return { status: "invalid" as const };
    }

    return { status: "ok" as const, page };
  }

  function evaluatePageInputWithOptions(
    existingPages: PageDraft[],
    content: string,
    options?: Parameters<typeof createPageDraftFromInput>[3],
  ) {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { status: "empty" as const };
    }

    const isDuplicate = existingPages.some(
      (page) => page.rawContent.trim() === trimmedContent,
    );
    if (isDuplicate) {
      const duplicatePageIds = existingPages
        .filter((page) => page.rawContent.trim() === trimmedContent)
        .map((page) => page.id);
      return { status: "duplicate" as const, duplicatePageIds };
    }

    const page = createPageDraftFromInput(
      content,
      existingPages.length + 1,
      sanitizePolicy,
      options,
    );
    if (!page) {
      return { status: "invalid" as const };
    }

    return { status: "ok" as const, page };
  }

  function addInputAsPage(content: string) {
    const result = evaluatePageInput(pages, content);

    if (result.status === "empty") {
      const message = "Copy or paste some content, then try again.";
      setErrors([message]);
      notify("warning", "Nothing to add", message);
      return false;
    }

    if (result.status === "duplicate") {
      const duplicateWarning = {
        code: "EMPTY_PAGE_SKIPPED" as const,
        message: "That page matches existing content, so it was skipped.",
      };
      setWarnings((prev) => [...prev, duplicateWarning]);
      notify("warning", "Page already added", duplicateWarning.message);
      flashPages(result.duplicatePageIds, "duplicate");
      return false;
    }

    if (result.status === "invalid") {
      const message =
        "Couldn’t create a page from that content. Check the input and try again.";
      setErrors([message]);
      notify("error", "Couldn’t add page", message);
      return false;
    }

    const page = result.page;
    commitPageChange((prev) => [...prev, page]);
    flashPages([page.id], "added");

    setSummary("");
    setErrors([]);
    setPastedInput("");
    notify(
      "success",
      "Page added",
      `“${page.title}” was added to draft pages.`,
    );
    return true;
  }

  async function addPagesFromFiles(files: FileList | File[]) {
    if (isGenerating) {
      return;
    }

    if (isFileImportInProgressRef.current) {
      return;
    }

    const droppedFiles = Array.from(files);
    if (droppedFiles.length === 0) {
      notify(
        "warning",
        "No files selected",
        "Drop one or more files to add pages.",
      );
      return;
    }

    isFileImportInProgressRef.current = true;
    setIsAdding(true);
    setErrors([]);

    let addedCount = 0;
    let unsupportedCount = 0;
    let duplicateCount = 0;
    const duplicatePageIds = new Set<PageId>();
    const addedPageIds: PageId[] = [];
    let invalidCount = 0;
    let emptyCount = 0;
    const duplicateWarnings: GenerationWarning[] = [];
    let nextPages = [...pages];

    try {
      for (const file of droppedFiles) {
        const fileName = file.name.toLowerCase();
        const mimeType = file.type.toLowerCase();

        let content = "";
        let shouldInferTitleFromHtml = false;

        if (mimeType.startsWith("image/")) {
          content = await clipboardImageBlobToHtml(file);
        } else if (isMarkdownFile(file)) {
          const markdown = await file.text();
          content = await renderMarkdownToHtml(markdown);
          shouldInferTitleFromHtml = true;
        } else if (
          mimeType === "text/html" ||
          fileName.endsWith(".html") ||
          fileName.endsWith(".htm") ||
          mimeType.startsWith("text/")
        ) {
          content = await file.text();
        } else {
          unsupportedCount += 1;
          continue;
        }

        const droppedFileTitle = fileNameToTitle(file.name);
        const result = evaluatePageInputWithOptions(nextPages, content, {
          defaultTitle: droppedFileTitle,
          textUseDefaultTitle: true,
          htmlUseHeadTitleOnly: !shouldInferTitleFromHtml,
        });
        if (result.status === "ok") {
          nextPages = [...nextPages, result.page];
          addedCount += 1;
          addedPageIds.push(result.page.id);
          continue;
        }

        if (result.status === "duplicate") {
          duplicateCount += 1;
          for (const pageId of result.duplicatePageIds) {
            duplicatePageIds.add(pageId);
          }
          duplicateWarnings.push({
            code: "EMPTY_PAGE_SKIPPED",
            message: "Duplicate page content detected and skipped.",
          });
          continue;
        }

        if (result.status === "invalid") {
          invalidCount += 1;
          continue;
        }

        emptyCount += 1;
      }

      if (addedCount > 0) {
        commitPageChange(() => nextPages);
        flashPages(addedPageIds, "added");
        setSummary("");
        setErrors([]);
        setPastedInput("");
      }

      if (addedCount > 1) {
        notify(
          "success",
          "Pages added",
          `${addedCount} pages were added from dropped files.`,
        );
      } else if (addedCount === 1) {
        notify(
          "success",
          "Page added",
          "1 page was added from dropped files.",
        );
      }

      if (unsupportedCount > 0) {
        notify(
          "info",
          "Some files were skipped",
          `${unsupportedCount} file(s) weren’t added because only HTML, Markdown, text, and image files are supported.`,
        );
      }

      if (duplicateWarnings.length > 0) {
        flashPages(Array.from(duplicatePageIds), "duplicate");
        setWarnings((prev) => [...prev, ...duplicateWarnings]);
        notify(
          "warning",
          "Duplicate pages skipped",
          `${duplicateCount} file(s) matched existing pages, so they were skipped.`,
        );
      }

      if (invalidCount > 0) {
        notify(
          "warning",
          "Some files couldn’t be added",
          `${invalidCount} file(s) couldn’t be converted into readable page content.`,
        );
      }

      if (emptyCount > 0) {
        notify(
          "warning",
          "Some files were empty",
          `${emptyCount} file(s) had no usable content to add as a page.`,
        );
      }

      if (addedCount === 0 && unsupportedCount > 0) {
        setErrors([
          "No supported files found. Drop HTML, Markdown, text, or image files to add pages.",
        ]);
      } else if (
        addedCount === 0 &&
        (duplicateCount > 0 || invalidCount > 0 || emptyCount > 0)
      ) {
        setErrors([
          "No pages were added from dropped files. Check file content and try again.",
        ]);
      }
    } catch (error) {
      const message = `Could not read dropped files: ${String(error)}`;
      setErrors([message]);
      notify("error", "Couldn’t import files", message);
    } finally {
      isFileImportInProgressRef.current = false;
      setIsAdding(false);
    }
  }

  async function addPageFromClipboard() {
    if (isGenerating) {
      return;
    }

    setIsAdding(true);
    setErrors([]);
    try {
      const content = await readClipboardPageInput();
      addInputAsPage(content);
    } catch (error) {
      const rawMessage = String(error);
      const normalizedMessage = rawMessage.toLowerCase();

      if (normalizedMessage.includes("empty")) {
        const message = "Copy HTML or text first, then click Add.";
        setErrors([message]);
        notify(
          "warning",
          "Clipboard is empty",
          createElement(
            "span",
            null,
            "Copy HTML or text first, then click ",
            addButtonHint(),
            ".",
          ),
        );
      } else {
        const message = `Could not read formatted clipboard content automatically: ${rawMessage}. Use the menu next to Add to paste manually.`;
        setErrors([message]);
        notify(
          "warning",
          "Can’t access clipboard automatically",
          createElement(
            "span",
            null,
            "Clipboard could not be read directly. Use ",
            addMenuHint(),
            " to paste manually.",
          ),
        );
      }
    } finally {
      setIsAdding(false);
    }
  }

  function handlePasteData(clipboardData: DataTransfer | null) {
    if (isGenerating) {
      return false;
    }

    if (!clipboardData) {
      return false;
    }

    if (clipboardData.files.length > 0) {
      void addPagesFromFiles(clipboardData.files);
      return true;
    }

    const html = clipboardData.getData("text/html");
    if (html?.trim()) {
      addInputAsPage(html);
      return true;
    }

    const text = clipboardData.getData("text/plain");
    if (text?.trim()) {
      addInputAsPage(text);
      return true;
    }

    const imageFile = Array.from(clipboardData.items).find((item) =>
      item.type.startsWith("image/"),
    );
    const imageBlob = imageFile?.getAsFile();
    if (imageBlob) {
      void clipboardImageBlobToHtml(imageBlob).then((imageHtml) => {
        addInputAsPage(imageHtml);
      });
      return true;
    }

    return false;
  }

  function onPasteInput(event: ReactClipboardEvent<HTMLTextAreaElement>) {
    if (!handlePasteData(event.clipboardData)) {
      return;
    }
    event.preventDefault();
  }

  function onGlobalPaste(event: ClipboardEvent) {
    if (!handlePasteData(event.clipboardData)) {
      return;
    }
    event.preventDefault();
  }

  function addFromFallbackText() {
    if (isGenerating) {
      return;
    }

    if (!pastedInput.trim()) {
      const message = "Paste HTML or text first, then add the page.";
      setErrors([message]);
      notify("warning", "Nothing to add", message);
      return;
    }
    addInputAsPage(pastedInput);
  }

  function removePage(id: string) {
    if (isGenerating) {
      return;
    }

    commitPageChange((prev) => {
      const nextPages = prev.filter((page) => page.id !== id);
      if (nextPages.length === prev.length) {
        return prev;
      }
      return nextPages;
    });
    setSummary("");
  }

  function renamePage(id: string, title: string) {
    if (isGenerating) {
      return;
    }

    commitPageChange((prev) => {
      let hasChanged = false;
      const nextPages = prev.map((page) => {
        if (page.id !== id) {
          return page;
        }

        const nextTitle = title.trim() || page.title;
        if (nextTitle === page.title) {
          return page;
        }

        hasChanged = true;
        return { ...page, title: nextTitle };
      });

      return hasChanged ? nextPages : prev;
    });
  }

  function reorderPages(draggedId: string, targetIndex: number) {
    if (isGenerating) return;
    if (!draggedId || Number.isNaN(targetIndex)) return;

    commitPageChange((prev) => {
      const draggedPage = prev.find((page) => page.id === draggedId);
      if (!draggedPage) return prev;

      const remaining = prev.filter((page) => page.id !== draggedId);
      const insertionIndex = Math.max(
        0,
        Math.min(targetIndex, remaining.length),
      );
      remaining.splice(insertionIndex, 0, draggedPage);
      if (
        remaining.every((page, index) => page.id === prev[index]?.id)
      ) {
        return prev;
      }
      return remaining;
    });
  }

  async function generateEpub() {
    if (isGenerating) return;
    if (generationStatusFadeTimerRef.current) {
      window.clearTimeout(generationStatusFadeTimerRef.current);
      generationStatusFadeTimerRef.current = null;
    }
    if (generationStatusClearTimerRef.current) {
      window.clearTimeout(generationStatusClearTimerRef.current);
      generationStatusClearTimerRef.current = null;
    }

    setIsGenerating(true);
    setIsCancellingGeneration(false);
    setGenerationProgress(0);
    setShowDownloadCompleteIcon(false);
    setActiveGenerationPageId(null);
    setIsGenerationStatusFading(false);
    setWarnings([]);
    setErrors([]);
    setSummary("");

    const abortController = new AbortController();
    generationAbortControllerRef.current = abortController;

    if (pages.length === 0) {
      const message =
        "Add at least one page from clipboard before generating EPUB.";
      setErrors([message]);
      notify("warning", "No pages added", message);
      setIsGenerating(false);
      setIsCancellingGeneration(false);
      setGenerationProgress(null);
      setGenerationChapterStatusByPageId({});
      setIsGenerationStatusFading(false);
      generationAbortControllerRef.current = null;
      return;
    }

    try {
      const pageIds = pages.map((page) => page.id);
      setGenerationChapterStatusByPageId(() =>
        pageIds.reduce<EpubMakerState["generationChapterStatusByPageId"]>(
          (acc, id) => {
            acc[id] = "pending";
            return acc;
          },
          {},
        ),
      );

      const result = await buildEpub({
        bookTitle: normalizedBookTitle || DEFAULT_BOOK_TITLE,
        bookAuthor: normalizedBookAuthor,
        downloadFileName: effectiveFileName,
        pages,
        sanitizePolicy,
        signal: abortController.signal,
        onProgress: (update: BuildEpubProgressUpdate) => {
          setGenerationProgress(update.value);
          setActiveGenerationPageId(update.currentPageId);

          const completed = new Set(update.completedPageIds);
          setGenerationChapterStatusByPageId(() =>
            pageIds.reduce<EpubMakerState["generationChapterStatusByPageId"]>(
              (acc, id) => {
                acc[id] = completed.has(id)
                  ? "completed"
                  : id === update.currentPageId
                    ? "processing"
                    : "pending";
                return acc;
              },
              {},
            ),
          );
        },
      });

      downloadBlob(result.blob, effectiveFileName);
      scheduleGenerationStatusCleanup();
      showDownloadCompleteIconTemporarily();
      setWarnings(result.warnings);
      setSummary(
        `Generated and downloaded “${effectiveFileName}” with ${result.summary.chapterCount} page(s), ${result.summary.embeddedImageCount} embedded image(s), and ${result.summary.externalImageCount} external image reference(s).`,
      );
      notify(
        "success",
        "EPUB ready",
        `EPUB generated and downloaded as “${effectiveFileName}”.`,
      );

      if (result.warnings.length > 0) {
        // Keep warnings in the on-page warnings list only (no toast notification)
      }

      if (prefs.fileNameMode === "manual" && !prefs.manualFileName.trim()) {
        setPrefs((prev) => ({ ...prev, manualFileName: autoEpubFileName }));
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setSummary("EPUB generation cancelled.");
        notify("info", "Generation cancelled", "EPUB generation was cancelled.");
        setShowDownloadCompleteIcon(false);
        setGenerationChapterStatusByPageId({});
        setIsGenerationStatusFading(false);
        return;
      }
      const message = `Unexpected error while generating EPUB: ${String(error)}`;
      setErrors([message]);
      notify("error", "EPUB generation failed", message);
      setShowDownloadCompleteIcon(false);
      setGenerationChapterStatusByPageId({});
      setIsGenerationStatusFading(false);
    } finally {
      setIsGenerating(false);
      setIsCancellingGeneration(false);
      setGenerationProgress(null);
      setActiveGenerationPageId(null);
      generationAbortControllerRef.current = null;
    }
  }

  function cancelGeneration() {
    if (!isGenerating) return;
    if (generationAbortControllerRef.current?.signal.aborted) return;
    setIsCancellingGeneration(true);
    generationAbortControllerRef.current?.abort();
  }

  return {
    pages,
    isAdding,
    isGenerating,
    isCancellingGeneration,
    generationProgress,
    showDownloadCompleteIcon,
    activeGenerationPageId,
    generationChapterStatusByPageId,
    isGenerationStatusFading,
    showPasteFallback,
    pastedInput,
    warnings,
    errors,
    summary,
    notifications,
    pageFlashById,
    prefs,
    normalizedBookTitle,
    normalizedBookAuthor,
    autoEpubFileName,
    effectiveFileName,
    addPageFromClipboard,
    addPagesFromFiles,
    onPasteInput,
    onGlobalPaste,
    addFromFallbackText,
    removePage,
    renamePage,
    reorderPages,
    undoPages,
    redoPages,
    canUndo,
    canRedo,
    generateEpub,
    cancelGeneration,
    setShowPasteFallback,
    setPastedInput,
    setWarnings,
    dismissNotification,
    setTitle: (value: string) =>
      setPrefs((prev) => ({ ...prev, title: value })),
    setAuthor: (value: string) =>
      setPrefs((prev) => ({ ...prev, author: value })),
    setManualFileName: (value: string) =>
      setPrefs((prev) => ({
        ...prev,
        fileNameMode:
          prev.fileNameMode === "auto" ? "manual" : prev.fileNameMode,
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
