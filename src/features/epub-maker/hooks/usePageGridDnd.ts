import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent as ReactDragEvent } from "react";
import type { PageDraft } from "../types";

type DragMode = "mouse" | "touch" | null;

export type DragPreviewAnchor = {
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  width: number;
};

export function usePageGridDnd({
  pages,
  isInteractionDisabled,
  onReorder,
  onAddFromFiles,
  coverOffset = 1,
}: {
  pages: PageDraft[];
  isInteractionDisabled: boolean;
  onReorder: (draggedId: string, targetIndex: number) => void;
  onAddFromFiles: (files: FileList | File[]) => Promise<void>;
  coverOffset?: number;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isGhostDropTarget, setIsGhostDropTarget] = useState(false);
  const [dragPreviewAnchor, setDragPreviewAnchor] =
    useState<DragPreviewAnchor | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const draggedIdRef = useRef<string | null>(null);
  const dropIndexRef = useRef<number | null>(null);
  const touchMoveRafRef = useRef<number | null>(null);
  const pendingTouchPointRef = useRef<{ x: number; y: number } | null>(null);

  const dragIndex = useMemo(
    () => (draggedId == null ? -1 : pages.findIndex((page) => page.id === draggedId)),
    [draggedId, pages],
  );
  const totalDisplayItemCount = pages.length + coverOffset;

  const previewPages = useMemo(
    () =>
      dragMode === "mouse" && draggedId && dropIndex !== null && dragIndex >= 0
        ? (() => {
            const draggedPage = pages[dragIndex];
            const remaining = pages.filter((page) => page.id !== draggedId);
            const targetChapterIndex = Math.max(0, dropIndex - 1);
            const insertionIndex = Math.max(
              0,
              Math.min(targetChapterIndex, remaining.length),
            );
            const next = [...remaining];
            next.splice(insertionIndex, 0, draggedPage);
            return next;
          })()
        : pages,
    [dragMode, draggedId, dropIndex, dragIndex, pages],
  );

  const clearDragState = useCallback(() => {
    setDraggedId(null);
    setDropIndex(null);
    setDragMode(null);
    draggedIdRef.current = null;
    dropIndexRef.current = null;
    setDragPreviewAnchor(null);
    setIsGhostDropTarget(false);
    pendingTouchPointRef.current = null;
    if (touchMoveRafRef.current != null) {
      window.cancelAnimationFrame(touchMoveRafRef.current);
      touchMoveRafRef.current = null;
    }
  }, []);

  const handleDrop = useCallback(() => {
    if (isInteractionDisabled) return;
    const activeDraggedId = draggedIdRef.current ?? draggedId;
    if (!activeDraggedId) return;
    const targetDisplayIndex =
      dropIndexRef.current ??
      dropIndex ??
      (dragIndex >= 0 ? dragIndex + coverOffset : 0);
    const targetIndex = Math.max(0, targetDisplayIndex - 1);
    onReorder(activeDraggedId, targetIndex);
    clearDragState();
  }, [
    isInteractionDisabled,
    draggedId,
    dropIndex,
    dragIndex,
    coverOffset,
    onReorder,
    clearDragState,
  ]);

  const updateDropIndexFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const hitTarget = document.elementFromPoint(
        clientX,
        clientY,
      ) as HTMLElement | null;
      const dropIndexElement =
        hitTarget?.closest<HTMLElement>("[data-drop-index]");
      if (dropIndexElement?.dataset.dropIndex) {
        const nextIndex = Number(dropIndexElement.dataset.dropIndex);
        if (!Number.isNaN(nextIndex)) {
          setDropIndex(nextIndex);
          dropIndexRef.current = nextIndex;
        }
        return;
      }

      const isOverGhost = Boolean(hitTarget?.closest("[data-ghost-drop-target]"));
      if (isOverGhost) {
        setDropIndex(totalDisplayItemCount);
        dropIndexRef.current = totalDisplayItemCount;
        setIsGhostDropTarget(true);
        return;
      }
      setIsGhostDropTarget(false);
    },
    [totalDisplayItemCount],
  );

  const maybeAutoScroll = useCallback((clientY: number) => {
    const edgeThreshold = 64;
    const scrollStep = 14;
    if (clientY < edgeThreshold) {
      window.scrollBy(0, -scrollStep);
      return;
    }
    if (clientY > window.innerHeight - edgeThreshold) {
      window.scrollBy(0, scrollStep);
    }
  }, []);

  const handleTouchDragStart = useCallback(
    (id: string, anchor: DragPreviewAnchor) => {
      if (isInteractionDisabled) return;
      const currentIndex = pages.findIndex((page) => page.id === id);
      if (currentIndex < 0) return;
      setDraggedId(id);
      setDropIndex(currentIndex + coverOffset);
      setDragMode("touch");
      draggedIdRef.current = id;
      dropIndexRef.current = currentIndex + coverOffset;
      setDragPreviewAnchor(anchor);
      updateDropIndexFromPoint(anchor.clientX, anchor.clientY);
    },
    [isInteractionDisabled, pages, coverOffset, updateDropIndexFromPoint],
  );

  const handleTouchDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggedIdRef.current) return;
      pendingTouchPointRef.current = { x: clientX, y: clientY };
      if (touchMoveRafRef.current != null) return;
      touchMoveRafRef.current = window.requestAnimationFrame(() => {
        touchMoveRafRef.current = null;
        const point = pendingTouchPointRef.current;
        if (!point) return;
        setDragPreviewAnchor((prev) =>
          prev
            ? {
                ...prev,
                clientX: point.x,
                clientY: point.y,
              }
            : prev,
        );
        updateDropIndexFromPoint(point.x, point.y);
        maybeAutoScroll(point.y);
      });
    },
    [updateDropIndexFromPoint, maybeAutoScroll],
  );

  const handleTouchDragEnd = useCallback(() => {
    if (isInteractionDisabled) return;
    handleDrop();
  }, [isInteractionDisabled, handleDrop]);

  const effectiveDropIndex = useCallback(
    (index: number) => {
      if (!draggedId) return null;
      return dropIndex === index ? index : null;
    },
    [draggedId, dropIndex],
  );

  const handleGridDragOver = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      if (!draggedId || !dragPreviewAnchor) return;
      if (event.clientX <= 0 && event.clientY <= 0) return;
      setDragPreviewAnchor((prev) =>
        prev
          ? {
              ...prev,
              clientX: event.clientX,
              clientY: event.clientY,
            }
          : prev,
      );
    },
    [draggedId, dragPreviewAnchor],
  );

  const handleDragStart = useCallback(
    (id: string, displayIndex: number, anchor: DragPreviewAnchor) => {
      if (isInteractionDisabled) return;
      setDraggedId(id);
      setDropIndex(displayIndex);
      setDragMode("mouse");
      draggedIdRef.current = id;
      dropIndexRef.current = displayIndex;
      setDragPreviewAnchor(anchor);
    },
    [isInteractionDisabled],
  );

  const handleCoverSlotDragOver = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      if (isInteractionDisabled) return;
      event.preventDefault();
      if (!draggedId) return;
      setDropIndex(0);
      dropIndexRef.current = 0;
    },
    [isInteractionDisabled, draggedId],
  );

  const handleCardSlotDragOver = useCallback(
    (
      event: ReactDragEvent<HTMLElement>,
      pageId: string,
      displayIndex: number,
    ) => {
      if (isInteractionDisabled) return;
      event.preventDefault();
      if (!draggedId) return;
      if (draggedId === pageId) return;
      setDropIndex(displayIndex);
      dropIndexRef.current = displayIndex;
    },
    [isInteractionDisabled, draggedId],
  );

  const handleGhostDragOver = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      if (isInteractionDisabled) return;
      event.preventDefault();
      setIsGhostDropTarget(true);
      dropIndexRef.current = totalDisplayItemCount;
    },
    [isInteractionDisabled, totalDisplayItemCount],
  );

  const handleGhostDragLeave = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      const nextTarget = event.relatedTarget as Node | null;
      if (nextTarget && event.currentTarget.contains(nextTarget)) return;
      setIsGhostDropTarget(false);
    },
    [],
  );

  const handleGhostDrop = useCallback(
    async (files: FileList | null) => {
      if (isInteractionDisabled) return;
      setIsGhostDropTarget(false);
      if (!files || files.length === 0) return;
      await onAddFromFiles(files);
    },
    [isInteractionDisabled, onAddFromFiles],
  );

  useEffect(() => {
    return () => {
      if (touchMoveRafRef.current != null) {
        window.cancelAnimationFrame(touchMoveRafRef.current);
      }
    };
  }, []);

  return {
    draggedId,
    dragPreviewAnchor,
    isGhostDropTarget,
    previewPages,
    totalDisplayItemCount,
    handleGridDragOver,
    handleCoverSlotDragOver,
    handleCardSlotDragOver,
    handleDragStart,
    handleTouchDragStart,
    handleTouchDragMove,
    handleTouchDragEnd,
    handleTouchDragCancel: clearDragState,
    handleDragEnd: clearDragState,
    handleDrop,
    effectiveDropIndex,
    handleGhostDragOver,
    handleGhostDragLeave,
    handleGhostDrop,
  };
}
