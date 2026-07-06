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
  createDefaultCoverSettings,
  createDefaultSanitizationPolicy,
  DEFAULT_BOOK_TITLE,
} from "../constants";
import type { AutoCoverRendererId } from "../domain/cover";
import {
  COVER_BACKGROUND_OPTIONS,
  COVER_SIZE_PRESET_OPTIONS,
  resolveCoverSizePreset,
} from "../domain/cover";
import type {
  BaseCoverBackgroundId,
  BuildEpubProgressUpdate,
  CoverSettingsState,
  CoverSizePresetId,
  CoverTextColorMode,
  CoverTextPosition,
  CoverBackgroundId,
  EpubMakerState,
  GenerationWarning,
  ManualImageEmbeddingItem,
  ManualImageReplacement,
  PendingEpubDownload,
  PageId,
  PageDraft,
  SanitizationPolicy,
} from "../types";
import { buildAutoEpubFileName, buildEpubFileName } from "../utils/file-name";
import { fileNameToTitle, isMarkdownFile } from "../utils/import-files";
import { createPageDraftFromInput } from "../domain/page-draft";
import {
  clipboardImageBlobToHtml,
  readClipboardImageBlob,
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
import { useCoverDraftState } from "./useCoverDraftState";
import {
  draftHistoryReducer,
  type DraftSnapshot,
} from "./draft-history";
import { useEpubNotifications } from "./useEpubNotifications";
import {
  type PageFlashEntry,
  useEpubTransientFeedback,
} from "./useEpubTransientFeedback";

const AUTO_COVER_RENDERER: AutoCoverRendererId = "raster-png";

function isBaseCoverBackgroundId(
  value: CoverBackgroundId,
): value is BaseCoverBackgroundId {
  return value !== "custom";
}

export type UseEpubMakerReturn = EpubMakerState & {
  coverCustomHtml: string | null;
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
  notifyUser: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    description?: ReactNode,
  ) => void;
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setCoverBackgroundId: (value: CoverBackgroundId) => void;
  setCoverSizePresetId: (value: CoverSizePresetId) => void;
  setCoverTextScalePercent: (value: number) => void;
  setCoverTextPosition: (value: CoverTextPosition) => void;
  setCoverTextColorMode: (value: CoverTextColorMode) => void;
  setHideCoverText: (value: boolean) => void;
  applyCoverSettings: (value: CoverSettingsState) => void;
  setManualFileName: (value: string) => void;
  toggleFileNameMode: () => void;
  setEmbedRemoteImages: (value: boolean) => void;
  setAllowExternalLinks: (value: boolean) => void;
  openManualImageEmbeddingDialog: () => void;
  closeManualImageEmbeddingDialog: () => void;
  replaceFailedImageFromFiles: (
    source: string,
    files: FileList | File[],
  ) => Promise<void>;
  replaceFailedImageFromClipboard: (source: string) => Promise<void>;
  resetFailedImageReplacement: (source: string) => void;
  downloadEpubWithExternalImages: () => void;
  regenerateEpubWithManualImages: () => Promise<void>;
  replaceCoverFromFiles: (files: FileList | File[]) => Promise<void>;
  replaceCoverFromClipboard: () => Promise<void>;
  resetCoverToAuto: () => void;
  toggleCoverEnabled: () => void;
};

export function useEpubMaker(): UseEpubMakerReturn {
  const [initialPrefs] = useState(() => readEpubMakerPrefs());
  const [draftHistory, dispatchDraftHistory] = useReducer(draftHistoryReducer, {
    past: [],
    present: {
      pages: [],
      customCoverHtml: null,
      coverEnabled: initialPrefs.cover.enabled,
      coverBaseBackgroundId: initialPrefs.cover.baseBackgroundId,
      coverSizePresetId: initialPrefs.cover.sizePresetId,
      coverTextScalePercent: initialPrefs.cover.textScalePercent,
      coverTextPosition: initialPrefs.cover.textPosition,
      coverTextColorMode: initialPrefs.cover.textColorMode,
      hideCoverText: initialPrefs.cover.hideText,
    },
    future: [],
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancellingGeneration, setIsCancellingGeneration] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<number | null>(
    null,
  );
  const [activeGenerationPageId, setActiveGenerationPageId] = useState<
    string | null
  >(null);
  const [generationChapterStatusByPageId, setGenerationChapterStatusByPageId] =
    useState<EpubMakerState["generationChapterStatusByPageId"]>({});
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [pastedInput, setPastedInput] = useState("");
  const [warnings, setWarnings] = useState<GenerationWarning[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [isManualImageEmbeddingOpen, setIsManualImageEmbeddingOpen] =
    useState(false);
  const [manualImageEmbeddingItems, setManualImageEmbeddingItems] = useState<
    ManualImageEmbeddingItem[]
  >([]);
  const [pendingManualImageDownload, setPendingManualImageDownload] =
    useState<PendingEpubDownload | null>(null);
  const [prefs, setPrefs] = useState<EpubMakerState["prefs"]>(initialPrefs);
  const [isPrefsLoaded, setIsPrefsLoaded] = useState(false);
  const isFileImportInProgressRef = useRef(false);
  const generationAbortControllerRef = useRef<AbortController | null>(null);
  const pages = draftHistory.present.pages;
  const customCoverHtml = draftHistory.present.customCoverHtml;
  const coverEnabled = draftHistory.present.coverEnabled;

  const canUndo = draftHistory.past.length > 0;
  const canRedo = draftHistory.future.length > 0;
  const { notifications, dismissNotification, notify } =
    useEpubNotifications();
  const clearGenerationStatusState = useCallback(() => {
    setGenerationChapterStatusByPageId({});
    setActiveGenerationPageId(null);
  }, []);
  const {
    pageFlashById,
    flashPages,
    showDownloadCompleteIcon,
    showDownloadCompleteIconTemporarily,
    hideDownloadCompleteIcon,
    isGenerationStatusFading,
    clearGenerationStatus,
    clearGenerationStatusTimers,
    scheduleGenerationStatusCleanup,
  } = useEpubTransientFeedback({
    onClearGenerationStatus: clearGenerationStatusState,
  });

  const commitDraftChange = useCallback(
    (updater: (previousDraft: DraftSnapshot) => DraftSnapshot) => {
      dispatchDraftHistory({ type: "commit", updater });
      clearGenerationStatus();
    },
    [clearGenerationStatus],
  );

  const commitPageChange = useCallback(
    (updater: (previousPages: PageDraft[]) => PageDraft[]) => {
      commitDraftChange((previousDraft) => {
        const nextPages = updater(previousDraft.pages);
        if (nextPages === previousDraft.pages) {
          return previousDraft;
        }
        return {
          ...previousDraft,
          pages: nextPages,
        };
      });
    },
    [commitDraftChange],
  );

  useEffect(() => {
    return () => {
      generationAbortControllerRef.current?.abort();
    };
  }, []);

  const undoPages = useCallback(() => {
    if (isGenerating) return;
    dispatchDraftHistory({ type: "undo" });
  }, [isGenerating]);

  const redoPages = useCallback(() => {
    if (isGenerating) return;
    dispatchDraftHistory({ type: "redo" });
  }, [isGenerating]);

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
  const coverBaseBackgroundId = draftHistory.present.coverBaseBackgroundId;
  const coverSizePresetId = draftHistory.present.coverSizePresetId;
  const coverTextScalePercent = draftHistory.present.coverTextScalePercent;
  const coverTextPosition = draftHistory.present.coverTextPosition;
  const coverTextColorMode = draftHistory.present.coverTextColorMode;
  const hideCoverText = draftHistory.present.hideCoverText;
  const effectiveCoverBackgroundId = coverBaseBackgroundId;
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
    policy.embedRemoteImages = prefs.generationOptions.embedRemoteImages;
    policy.allowExternalLinks = prefs.generationOptions.allowExternalLinks;
    return policy;
  }, [
    prefs.generationOptions.embedRemoteImages,
    prefs.generationOptions.allowExternalLinks,
  ]);

  const { coverMode, hasCustomCover, coverDraft, coverDraftRef, waitForCoverRenderIfPending } =
    useCoverDraftState({
      normalizedBookTitle,
      normalizedBookAuthor,
      backgroundId: effectiveCoverBackgroundId,
      sizePresetId: coverSizePresetId,
      textScalePercent: coverTextScalePercent,
      textPosition: coverTextPosition,
      textColorMode: coverTextColorMode,
      customCoverHtml,
      hideCoverText,
      sanitizePolicy,
      rendererId: AUTO_COVER_RENDERER,
    });
  useEffect(() => {
    setIsPrefsLoaded(true);
  }, []);

  useEffect(() => {
    setPrefs((prev) => {
      const nextBackgroundId: CoverBackgroundId =
        customCoverHtml !== null ? "custom" : coverBaseBackgroundId;
      if (
        prev.cover.enabled === coverEnabled &&
        prev.cover.backgroundId === nextBackgroundId &&
        prev.cover.baseBackgroundId === coverBaseBackgroundId &&
        prev.cover.sizePresetId === coverSizePresetId &&
        prev.cover.textScalePercent === coverTextScalePercent &&
        prev.cover.textPosition === coverTextPosition &&
        prev.cover.textColorMode === coverTextColorMode &&
        prev.cover.hideText === hideCoverText
      ) {
        return prev;
      }

      return {
        ...prev,
        cover: {
          enabled: coverEnabled,
          backgroundId: nextBackgroundId,
          baseBackgroundId: coverBaseBackgroundId,
          sizePresetId: coverSizePresetId,
          textScalePercent: coverTextScalePercent,
          textPosition: coverTextPosition,
          textColorMode: coverTextColorMode,
          hideText: hideCoverText,
        },
      };
    });
  }, [
    customCoverHtml,
    coverBaseBackgroundId,
    coverSizePresetId,
    coverTextScalePercent,
    coverTextPosition,
    coverTextColorMode,
    hideCoverText,
    coverEnabled,
  ]);

  useEffect(() => {
    if (!isPrefsLoaded) return;
    writeEpubMakerPrefs(prefs);
  }, [isPrefsLoaded, prefs]);

  function evaluatePageInput(
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
        const result = evaluatePageInput(nextPages, content, {
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
        notify("success", "Page added", "1 page was added from dropped files.");
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
      if (remaining.every((page, index) => page.id === prev[index]?.id)) {
        return prev;
      }
      return remaining;
    });
  }

  async function replaceCoverFromFiles(files: FileList | File[]) {
    if (isGenerating) return;

    const uploadedFiles = Array.from(files);
    if (uploadedFiles.length === 0) {
      notify(
        "warning",
        "No cover file selected",
        "Choose an image file to set as cover.",
      );
      return;
    }

    const imageFile = uploadedFiles.find((file) =>
      file.type.toLowerCase().startsWith("image/"),
    );

    if (!imageFile) {
      notify(
        "warning",
        "Unsupported cover format",
        "Only image files can be used as a custom cover.",
      );
      return;
    }

    setIsAdding(true);
    try {
      const coverHtml = await clipboardImageBlobToHtml(imageFile);
      commitDraftChange((previousDraft) => {
        if (previousDraft.customCoverHtml === coverHtml) {
          return previousDraft;
        }
        return {
          ...previousDraft,
          customCoverHtml: coverHtml,
        };
      });
      setSummary("");
      notify(
        "success",
        "Cover updated",
        `Custom cover set from “${imageFile.name}”.`,
      );
    } catch (error) {
      const message = `Could not set custom cover: ${String(error)}`;
      setErrors([message]);
      notify("error", "Couldn’t update cover", message);
    } finally {
      setIsAdding(false);
    }
  }

  async function replaceCoverFromClipboard() {
    if (isGenerating) return;

    setIsAdding(true);
    try {
      const imageBlob = await readClipboardImageBlob();
      const coverHtml = await clipboardImageBlobToHtml(imageBlob);
      commitDraftChange((previousDraft) => {
        if (previousDraft.customCoverHtml === coverHtml) {
          return previousDraft;
        }
        return {
          ...previousDraft,
          customCoverHtml: coverHtml,
        };
      });
      setSummary("");
      notify(
        "success",
        "Cover updated",
        "Custom cover set from clipboard image.",
      );
    } catch (error) {
      const rawMessage = String(error);
      const normalizedMessage = rawMessage.toLowerCase();
      if (
        normalizedMessage.includes("clipboard") ||
        normalizedMessage.includes("not supported")
      ) {
        notify(
          "warning",
          "No clipboard image found",
          "Copy an image first, then use Paste cover.",
        );
        return;
      }

      const message = `Could not paste cover image: ${rawMessage}`;
      setErrors([message]);
      notify("error", "Couldn’t update cover", message);
    } finally {
      setIsAdding(false);
    }
  }

  function applyCoverSettings(nextCoverSettings: CoverSettingsState) {
    if (isGenerating) return;

    commitDraftChange((previousDraft) => {
      const normalizedSizePresetId = resolveCoverSizePreset(
        nextCoverSettings.coverSizePresetId,
      ).id;
      const normalizedTextScale = Math.max(
        70,
        Math.min(180, Math.round(nextCoverSettings.coverTextScalePercent)),
      );
      if (
        previousDraft.coverEnabled === nextCoverSettings.coverEnabled &&
        previousDraft.customCoverHtml === nextCoverSettings.customCoverHtml &&
        previousDraft.coverBaseBackgroundId ===
          nextCoverSettings.coverBaseBackgroundId &&
        previousDraft.coverSizePresetId === normalizedSizePresetId &&
        previousDraft.coverTextScalePercent === normalizedTextScale &&
        previousDraft.coverTextPosition === nextCoverSettings.coverTextPosition &&
        previousDraft.coverTextColorMode ===
          nextCoverSettings.coverTextColorMode &&
        previousDraft.hideCoverText === nextCoverSettings.hideCoverText
      ) {
        return previousDraft;
      }

      return {
        ...previousDraft,
        coverEnabled: nextCoverSettings.coverEnabled,
        customCoverHtml: nextCoverSettings.customCoverHtml,
        coverBaseBackgroundId: nextCoverSettings.coverBaseBackgroundId,
        coverSizePresetId: normalizedSizePresetId,
        coverTextScalePercent: normalizedTextScale,
        coverTextPosition: nextCoverSettings.coverTextPosition,
        coverTextColorMode: nextCoverSettings.coverTextColorMode,
        hideCoverText: nextCoverSettings.hideCoverText,
      };
    });
    setSummary("");
  }

  function resetCoverToAuto() {
    if (isGenerating) return;

    applyCoverSettings(createDefaultCoverSettings());
  }

  function toggleCoverEnabled() {
    if (isGenerating) return;

    applyCoverSettings({
      coverEnabled: !coverEnabled,
      customCoverHtml,
      coverBaseBackgroundId,
      coverSizePresetId,
      coverTextScalePercent,
      coverTextPosition,
      coverTextColorMode,
      hideCoverText,
    });
  }

  function buildManualImageEmbeddingItems(
    nextWarnings: GenerationWarning[],
  ): ManualImageEmbeddingItem[] {
    const pageTitleById = new Map(pages.map((page) => [page.id, page.title]));
    const itemsBySource = new Map<string, ManualImageEmbeddingItem>();

    for (const warning of nextWarnings) {
      if (warning.code !== "FETCH_IMAGE_FAILED" || !warning.source) continue;
      const existing = itemsBySource.get(warning.source);
      if (existing) {
        if (!existing.pageId && warning.pageId) {
          existing.pageId = warning.pageId;
          existing.pageTitle = pageTitleById.get(warning.pageId);
        }
        continue;
      }

      itemsBySource.set(warning.source, {
        source: warning.source,
        pageId: warning.pageId,
        pageTitle: warning.pageId
          ? pageTitleById.get(warning.pageId)
          : undefined,
      });
    }

    return Array.from(itemsBySource.values());
  }

  function setManualImageReplacement(
    source: string,
    replacement: ManualImageReplacement,
  ) {
    setManualImageEmbeddingItems((prev) =>
      prev.map((item) =>
        item.source === source
          ? { ...item, replacement }
          : item,
      ),
    );
  }

  async function generateEpubWithOptions(
    manualImageReplacements?: Record<string, ManualImageReplacement>,
  ) {
    if (isGenerating) return;
    clearGenerationStatusTimers();

    setIsGenerating(true);
    setIsCancellingGeneration(false);
    setGenerationProgress(0);
    hideDownloadCompleteIcon();
    clearGenerationStatusState();
    setWarnings([]);
    setErrors([]);
    setSummary("");
    setPendingManualImageDownload(null);

    const abortController = new AbortController();
    generationAbortControllerRef.current = abortController;

    if (pages.length === 0) {
      const message = "Add at least one page before generating EPUB.";
      setErrors([message]);
      notify("warning", "No pages added", message);
      setIsGenerating(false);
      setIsCancellingGeneration(false);
      setGenerationProgress(null);
      clearGenerationStatus();
      generationAbortControllerRef.current = null;
      return;
    }

    try {
      await waitForCoverRenderIfPending();

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
        cover: coverEnabled ? (coverDraftRef.current ?? coverDraft) : undefined,
        sanitizePolicy,
        manualImageReplacements,
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

      setWarnings(result.warnings);

      if (result.warnings.length > 0) {
        // Keep warnings in the on-page warnings list only (no toast notification)
      }

      const failedImageItems = buildManualImageEmbeddingItems(result.warnings);
      setManualImageEmbeddingItems((prev) => {
        const previousBySource = new Map(
          prev.map((item) => [item.source, item] as const),
        );
        return failedImageItems.map((item) => ({
          ...item,
          replacement: previousBySource.get(item.source)?.replacement,
        }));
      });
      if (failedImageItems.length > 0) {
        setPendingManualImageDownload({
          blob: result.blob,
          fileName: effectiveFileName,
          summary: result.summary,
          warnings: result.warnings,
        });
        setSummary(
          `EPUB is ready to review with ${failedImageItems.length} external image source(s). Add replacements or download it with external image references.`,
        );
        setIsManualImageEmbeddingOpen(true);
        notify(
          "warning",
          "Review images before download",
          `${failedImageItems.length} image source${failedImageItems.length === 1 ? "" : "s"} could not be embedded.`,
        );
        return;
      }

      downloadBlob(result.blob, effectiveFileName);
      scheduleGenerationStatusCleanup();
      showDownloadCompleteIconTemporarily();
      setSummary(
        `Generated and downloaded “${effectiveFileName}” with ${result.summary.chapterCount} page(s)${result.summary.coverIncluded ? " and a cover" : ""}, ${result.summary.embeddedImageCount} embedded image(s), and ${result.summary.externalImageCount} external image reference(s).`,
      );
      notify(
        "success",
        "EPUB ready",
        `EPUB generated and downloaded as “${effectiveFileName}”.`,
      );

      if (manualImageReplacements) {
        setIsManualImageEmbeddingOpen(false);
      }

      if (prefs.fileNameMode === "manual" && !prefs.manualFileName.trim()) {
        setPrefs((prev) => ({ ...prev, manualFileName: autoEpubFileName }));
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setSummary("EPUB generation cancelled.");
        notify(
          "info",
          "Generation cancelled",
          "EPUB generation was cancelled.",
        );
        hideDownloadCompleteIcon();
        clearGenerationStatus();
        return;
      }
      const message = `Unexpected error while generating EPUB: ${String(error)}`;
      setErrors([message]);
      notify("error", "EPUB generation failed", message);
      hideDownloadCompleteIcon();
      clearGenerationStatus();
    } finally {
      setIsGenerating(false);
      setIsCancellingGeneration(false);
      setGenerationProgress(null);
      setActiveGenerationPageId(null);
      generationAbortControllerRef.current = null;
    }
  }

  async function generateEpub() {
    await generateEpubWithOptions();
  }

  function openManualImageEmbeddingDialog() {
    if (manualImageEmbeddingItems.length === 0) return;
    setIsManualImageEmbeddingOpen(true);
  }

  function closeManualImageEmbeddingDialog() {
    setIsManualImageEmbeddingOpen(false);
    if (pendingManualImageDownload) {
      clearGenerationStatus();
    }
  }

  async function replaceFailedImageFromFiles(
    source: string,
    files: FileList | File[],
  ) {
    const imageFile = Array.from(files).find((file) =>
      file.type.toLowerCase().startsWith("image/"),
    );
    if (!imageFile) {
      notify(
        "warning",
        "Choose an image file",
        "Only image files can replace failed EPUB images.",
      );
      return;
    }

    setManualImageReplacement(source, {
      blob: imageFile,
      label: imageFile.name || "Uploaded image",
    });
    notify(
      "success",
      "Replacement added",
      "The image will be embedded on regenerate.",
    );
  }

  async function replaceFailedImageFromClipboard(source: string) {
    try {
      const imageBlob = await readClipboardImageBlob();
      setManualImageReplacement(source, {
        blob: imageBlob,
        label: "Clipboard image",
      });
      notify(
        "success",
        "Replacement added",
        "The clipboard image will be embedded on regenerate.",
      );
    } catch {
      notify(
        "warning",
        "No clipboard image found",
        "Copy an image first, then paste it here.",
      );
    }
  }

  function resetFailedImageReplacement(source: string) {
    setManualImageEmbeddingItems((prev) =>
      prev.map((item) =>
        item.source === source ? { ...item, replacement: undefined } : item,
      ),
    );
  }

  function downloadEpubWithExternalImages() {
    if (!pendingManualImageDownload) return;
    downloadBlob(
      pendingManualImageDownload.blob,
      pendingManualImageDownload.fileName,
    );
    scheduleGenerationStatusCleanup();
    showDownloadCompleteIconTemporarily();
    setSummary(
      `Generated and downloaded “${pendingManualImageDownload.fileName}” with ${pendingManualImageDownload.summary.chapterCount} page(s)${pendingManualImageDownload.summary.coverIncluded ? " and a cover" : ""}, ${pendingManualImageDownload.summary.embeddedImageCount} embedded image(s), and ${pendingManualImageDownload.summary.externalImageCount} external image reference(s).`,
    );
    notify(
      "success",
      "EPUB ready",
      `EPUB generated and downloaded as “${pendingManualImageDownload.fileName}”.`,
    );
    setIsManualImageEmbeddingOpen(false);
    setPendingManualImageDownload(null);
  }

  async function regenerateEpubWithManualImages() {
    const replacements = manualImageEmbeddingItems.reduce<
      Record<string, ManualImageReplacement>
    >((acc, item) => {
      if (item.replacement) {
        acc[item.source] = item.replacement;
      }
      return acc;
    }, {});

    if (Object.keys(replacements).length === 0) {
      notify(
        "warning",
        "No replacements selected",
        "Add at least one image replacement before regenerating.",
      );
      return;
    }

    await generateEpubWithOptions(replacements);
  }

  function cancelGeneration() {
    if (!isGenerating) return;
    if (generationAbortControllerRef.current?.signal.aborted) return;
    setIsCancellingGeneration(true);
    generationAbortControllerRef.current?.abort();
  }

  return {
    pages,
    coverMode,
    coverBackgroundId: hasCustomCover ? "custom" : effectiveCoverBackgroundId,
    coverBackgroundOptions: COVER_BACKGROUND_OPTIONS,
    coverSizePresetId,
    coverSizePresetOptions: COVER_SIZE_PRESET_OPTIONS,
    coverTextScalePercent,
    coverTextPosition,
    coverTextColorMode,
    hideCoverText,
    isCoverEnabled: coverEnabled,
    coverPreviewHtml: coverDraft.previewHtml,
    coverCustomHtml: customCoverHtml,
    hasCustomCover,
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
    manualImageEmbedding: {
      isOpen: isManualImageEmbeddingOpen,
      items: manualImageEmbeddingItems,
      pendingDownload: pendingManualImageDownload,
    },
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
    notifyUser: notify,
    setTitle: (value: string) =>
      setPrefs((prev) => ({ ...prev, title: value })),
    setAuthor: (value: string) =>
      setPrefs((prev) => ({ ...prev, author: value })),
    setCoverBackgroundId: (value: CoverBackgroundId) => {
      if (!isBaseCoverBackgroundId(value)) return;
      applyCoverSettings({
        coverEnabled,
        customCoverHtml: null,
        coverBaseBackgroundId: value,
        coverSizePresetId,
        coverTextScalePercent,
        coverTextPosition,
        coverTextColorMode,
        hideCoverText,
      });
    },
    setCoverSizePresetId: (value: CoverSizePresetId) =>
      applyCoverSettings({
        coverEnabled,
        customCoverHtml,
        coverBaseBackgroundId,
        coverSizePresetId: value,
        coverTextScalePercent,
        coverTextPosition,
        coverTextColorMode,
        hideCoverText,
      }),
    setCoverTextScalePercent: (value: number) =>
      applyCoverSettings({
        coverEnabled,
        customCoverHtml,
        coverBaseBackgroundId,
        coverSizePresetId,
        coverTextScalePercent: value,
        coverTextPosition,
        coverTextColorMode,
        hideCoverText,
      }),
    setCoverTextPosition: (value: CoverTextPosition) =>
      applyCoverSettings({
        coverEnabled,
        customCoverHtml,
        coverBaseBackgroundId,
        coverSizePresetId,
        coverTextScalePercent,
        coverTextPosition: value,
        coverTextColorMode,
        hideCoverText,
      }),
    setCoverTextColorMode: (value: CoverTextColorMode) =>
      applyCoverSettings({
        coverEnabled,
        customCoverHtml,
        coverBaseBackgroundId,
        coverSizePresetId,
        coverTextScalePercent,
        coverTextPosition,
        coverTextColorMode: value,
        hideCoverText,
      }),
    setHideCoverText: (value: boolean) =>
      applyCoverSettings({
        coverEnabled,
        customCoverHtml,
        coverBaseBackgroundId,
        coverSizePresetId,
        coverTextScalePercent,
        coverTextPosition,
        coverTextColorMode,
        hideCoverText: value,
      }),
    applyCoverSettings,
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
        generationOptions: {
          ...prev.generationOptions,
          embedRemoteImages: value,
        },
      })),
    setAllowExternalLinks: (value: boolean) =>
      setPrefs((prev) => ({
        ...prev,
        generationOptions: {
          ...prev.generationOptions,
          allowExternalLinks: value,
        },
      })),
    openManualImageEmbeddingDialog,
    closeManualImageEmbeddingDialog,
    replaceFailedImageFromFiles,
    replaceFailedImageFromClipboard,
    resetFailedImageReplacement,
    downloadEpubWithExternalImages,
    regenerateEpubWithManualImages,
    replaceCoverFromFiles,
    replaceCoverFromClipboard,
    resetCoverToAuto,
    toggleCoverEnabled,
  };
}
