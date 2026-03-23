import {
  ClipboardEvent,
  createElement,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LuChevronDown, LuFilePlus } from "react-icons/lu";
import {
  createDefaultSanitizationPolicy,
  DEFAULT_BOOK_TITLE,
} from "../constants";
import type { EpubMakerState, GenerationWarning, PageDraft } from "../types";
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
  onPasteInput: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  addFromFallbackText: () => void;
  removePage: (id: string) => void;
  renamePage: (id: string, title: string) => void;
  reorderPages: (draggedId: string, targetIndex: number) => void;
  generateEpub: () => Promise<void>;
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
  const [pages, setPages] = useState<PageDraft[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<number | null>(
    null,
  );
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [pastedInput, setPastedInput] = useState("");
  const [warnings, setWarnings] = useState<GenerationWarning[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [notifications, setNotifications] = useState<
    EpubMakerState["notifications"]
  >([]);
  const [prefs, setPrefs] =
    useState<EpubMakerState["prefs"]>(readEpubMakerPrefs());
  const [isPrefsLoaded, setIsPrefsLoaded] = useState(false);

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
      return { status: "duplicate" as const };
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
      return { status: "duplicate" as const };
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
    setPages((prev) => [...prev, page]);

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
    const droppedFiles = Array.from(files);
    if (droppedFiles.length === 0) {
      notify(
        "warning",
        "No files selected",
        "Drop one or more files to add pages.",
      );
      return;
    }

    setIsAdding(true);
    setErrors([]);

    let addedCount = 0;
    let unsupportedCount = 0;
    let duplicateCount = 0;
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
          continue;
        }

        if (result.status === "duplicate") {
          duplicateCount += 1;
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
        setPages(nextPages);
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
      setIsAdding(false);
    }
  }

  async function addPageFromClipboard() {
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

  function onPasteInput(event: ClipboardEvent<HTMLTextAreaElement>) {
    if (event.clipboardData.files.length > 0) {
      event.preventDefault();
      void addPagesFromFiles(event.clipboardData.files);
      return;
    }

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
      return;
    }

    const imageFile = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith("image/"),
    );
    const imageBlob = imageFile?.getAsFile();
    if (imageBlob) {
      event.preventDefault();
      void clipboardImageBlobToHtml(imageBlob).then((imageHtml) => {
        addInputAsPage(imageHtml);
      });
    }
  }

  function addFromFallbackText() {
    if (!pastedInput.trim()) {
      const message = "Paste HTML or text first, then add the page.";
      setErrors([message]);
      notify("warning", "Nothing to add", message);
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

  function reorderPages(draggedId: string, targetIndex: number) {
    if (!draggedId || Number.isNaN(targetIndex)) return;

    setPages((prev) => {
      const draggedPage = prev.find((page) => page.id === draggedId);
      if (!draggedPage) return prev;

      const remaining = prev.filter((page) => page.id !== draggedId);
      const insertionIndex = Math.max(
        0,
        Math.min(targetIndex, remaining.length),
      );
      remaining.splice(insertionIndex, 0, draggedPage);
      return remaining;
    });
  }

  async function generateEpub() {
    setIsGenerating(true);
    setGenerationProgress(0);
    setWarnings([]);
    setErrors([]);
    setSummary("");

    if (pages.length === 0) {
      const message =
        "Add at least one page from clipboard before generating EPUB.";
      setErrors([message]);
      notify("warning", "No pages added", message);
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
      const message = `Unexpected error while generating EPUB: ${String(error)}`;
      setErrors([message]);
      notify("error", "EPUB generation failed", message);
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
    notifications,
    prefs,
    normalizedBookTitle,
    normalizedBookAuthor,
    autoEpubFileName,
    effectiveFileName,
    addPageFromClipboard,
    addPagesFromFiles,
    onPasteInput,
    addFromFallbackText,
    removePage,
    renamePage,
    reorderPages,
    generateEpub,
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
