import { useCallback, useEffect, useRef, useState } from "react";
import type { PageId } from "../types";

export type PageFlashKind = "added" | "duplicate";
export type PageFlashEntry = { kind: PageFlashKind; token: number };

export function useEpubTransientFeedback({
  onClearGenerationStatus,
}: {
  onClearGenerationStatus: () => void;
}) {
  const [showDownloadCompleteIcon, setShowDownloadCompleteIcon] =
    useState(false);
  const [isGenerationStatusFading, setIsGenerationStatusFading] =
    useState(false);
  const [pageFlashById, setPageFlashById] = useState<
    Record<PageId, PageFlashEntry>
  >({});
  const generationStatusFadeTimerRef = useRef<number | null>(null);
  const generationStatusClearTimerRef = useRef<number | null>(null);
  const downloadCompleteIconTimerRef = useRef<number | null>(null);
  const pageFlashClearTimerRef = useRef<number | null>(null);
  const flashSequenceRef = useRef(0);

  const clearGenerationStatusTimerRefs = useCallback(() => {
    if (generationStatusFadeTimerRef.current) {
      window.clearTimeout(generationStatusFadeTimerRef.current);
      generationStatusFadeTimerRef.current = null;
    }
    if (generationStatusClearTimerRef.current) {
      window.clearTimeout(generationStatusClearTimerRef.current);
      generationStatusClearTimerRef.current = null;
    }
  }, []);

  const clearGenerationStatusTimers = useCallback(() => {
    clearGenerationStatusTimerRefs();
    setIsGenerationStatusFading(false);
  }, [clearGenerationStatusTimerRefs]);

  const clearGenerationStatus = useCallback(() => {
    clearGenerationStatusTimers();
    onClearGenerationStatus();
  }, [clearGenerationStatusTimers, onClearGenerationStatus]);

  const flashPages = useCallback(
    (ids: PageId[], kind: PageFlashKind, durationMs = 1200) => {
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
    },
    [],
  );

  const clearDownloadCompleteIconTimer = useCallback(() => {
    if (downloadCompleteIconTimerRef.current) {
      window.clearTimeout(downloadCompleteIconTimerRef.current);
      downloadCompleteIconTimerRef.current = null;
    }
  }, []);

  const hideDownloadCompleteIcon = useCallback(() => {
    clearDownloadCompleteIconTimer();
    setShowDownloadCompleteIcon(false);
  }, [clearDownloadCompleteIconTimer]);

  const showDownloadCompleteIconTemporarily = useCallback(
    (durationMs = 1100) => {
      hideDownloadCompleteIcon();
      setShowDownloadCompleteIcon(true);
      downloadCompleteIconTimerRef.current = window.setTimeout(() => {
        setShowDownloadCompleteIcon(false);
        downloadCompleteIconTimerRef.current = null;
      }, durationMs);
    },
    [hideDownloadCompleteIcon],
  );

  const scheduleGenerationStatusCleanup = useCallback(() => {
    clearGenerationStatusTimers();

    generationStatusFadeTimerRef.current = window.setTimeout(() => {
      setIsGenerationStatusFading(true);
    }, 700);
    generationStatusClearTimerRef.current = window.setTimeout(() => {
      onClearGenerationStatus();
      setIsGenerationStatusFading(false);
      generationStatusFadeTimerRef.current = null;
      generationStatusClearTimerRef.current = null;
    }, 1100);
  }, [clearGenerationStatusTimers, onClearGenerationStatus]);

  useEffect(() => {
    return () => {
      clearGenerationStatusTimerRefs();
      clearDownloadCompleteIconTimer();
      if (pageFlashClearTimerRef.current) {
        window.clearTimeout(pageFlashClearTimerRef.current);
      }
    };
  }, [clearDownloadCompleteIconTimer, clearGenerationStatusTimerRefs]);

  return {
    pageFlashById,
    flashPages,
    showDownloadCompleteIcon,
    showDownloadCompleteIconTemporarily,
    hideDownloadCompleteIcon,
    isGenerationStatusFading,
    clearGenerationStatus,
    clearGenerationStatusTimers,
    scheduleGenerationStatusCleanup,
  };
}
