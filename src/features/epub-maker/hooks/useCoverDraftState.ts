import { useEffect, useRef, useState } from "react";
import type { AutoCoverRendererId } from "../domain/cover";
import { createCoverHtml, createCoverHtmlAsync } from "../domain/cover";
import { sanitizeHtmlContent } from "../domain/html-sanitizer";
import type {
  CoverDraft,
  CoverMode,
  SanitizationPolicy,
  CoverSizePresetId,
  CoverTextColorMode,
  CoverTextPosition,
  BaseCoverBackgroundId,
} from "../types";

function buildCoverDraft(
  rawHtml: string,
  mode: CoverMode,
  sanitizePolicy: SanitizationPolicy,
): CoverDraft {
  const sanitized = sanitizeHtmlContent(rawHtml, "Cover", sanitizePolicy, {
    variant: "cover",
  });
  return {
    mode,
    title: "Cover",
    rawHtml,
    previewHtml: sanitized.previewHtml,
  };
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, value]);

  return debouncedValue;
}

export function useCoverDraftState({
  normalizedBookTitle,
  normalizedBookAuthor,
  backgroundId,
  sizePresetId,
  textScalePercent,
  textPosition,
  textColorMode,
  customCoverHtml,
  hideCoverText,
  sanitizePolicy,
  rendererId,
}: {
  normalizedBookTitle: string;
  normalizedBookAuthor: string;
  backgroundId: BaseCoverBackgroundId;
  sizePresetId: CoverSizePresetId;
  textScalePercent: number;
  textPosition: CoverTextPosition;
  textColorMode: CoverTextColorMode;
  customCoverHtml: string | null;
  hideCoverText: boolean;
  sanitizePolicy: SanitizationPolicy;
  rendererId: AutoCoverRendererId;
}) {
  const debouncedCoverTitle = useDebouncedValue(normalizedBookTitle, 140);
  const debouncedCoverAuthor = useDebouncedValue(normalizedBookAuthor, 140);
  const coverMode: CoverMode = customCoverHtml ? "custom" : "auto";

  const [coverDraft, setCoverDraft] = useState<CoverDraft>(() => {
    const initialRawHtml = createCoverHtml(
      debouncedCoverTitle,
      debouncedCoverAuthor,
      {
        backgroundId,
        sizePresetId,
        textScalePercent,
        textPosition,
        textColorMode,
        customCoverHtml,
        hideCoverText,
      },
      rendererId,
    );
    return buildCoverDraft(initialRawHtml, coverMode, sanitizePolicy);
  });

  const coverDraftRef = useRef<CoverDraft | null>(null);
  const isCoverRenderPendingRef = useRef(false);
  const coverRenderTaskIdRef = useRef(0);
  const coverRenderWaitersRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    coverDraftRef.current = coverDraft;
  }, [coverDraft]);

  useEffect(() => {
    const taskId = coverRenderTaskIdRef.current + 1;
    coverRenderTaskIdRef.current = taskId;
    isCoverRenderPendingRef.current = true;

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const nextRawHtml = await createCoverHtmlAsync(
            debouncedCoverTitle,
            debouncedCoverAuthor,
            {
              backgroundId,
              sizePresetId,
              textScalePercent,
              textPosition,
              textColorMode,
              customCoverHtml,
              hideCoverText,
            },
            rendererId,
          );

          const nextCoverDraft = buildCoverDraft(
            nextRawHtml,
            coverMode,
            sanitizePolicy,
          );
          if (coverRenderTaskIdRef.current !== taskId) return;

          setCoverDraft(nextCoverDraft);
          coverDraftRef.current = nextCoverDraft;
        } finally {
          if (coverRenderTaskIdRef.current !== taskId) return;
          isCoverRenderPendingRef.current = false;
          const waiters = coverRenderWaitersRef.current;
          coverRenderWaitersRef.current = [];
          waiters.forEach((resolve) => resolve());
        }
      })();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    debouncedCoverTitle,
    debouncedCoverAuthor,
    backgroundId,
    sizePresetId,
    textScalePercent,
    textPosition,
    textColorMode,
    hideCoverText,
    customCoverHtml,
    coverMode,
    sanitizePolicy,
    rendererId,
  ]);

  useEffect(() => {
    return () => {
      const waiters = coverRenderWaitersRef.current;
      coverRenderWaitersRef.current = [];
      waiters.forEach((resolve) => resolve());
    };
  }, []);

  async function waitForCoverRenderIfPending() {
    if (!isCoverRenderPendingRef.current) return;
    await new Promise<void>((resolve) => {
      coverRenderWaitersRef.current.push(resolve);
    });
  }

  return {
    coverMode,
    hasCustomCover: customCoverHtml !== null,
    coverDraft,
    coverDraftRef,
    waitForCoverRenderIfPending,
  };
}
