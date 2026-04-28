import { useCallback, useEffect, useState } from "react";
import type { CoverSettingsState } from "../types";

const COVER_SETTINGS_HISTORY_LIMIT = 100;

type CoverSettingsHistoryState = {
  past: CoverSettingsState[];
  present: CoverSettingsState;
  future: CoverSettingsState[];
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}

function isSameCoverSettingsState(
  left: CoverSettingsState,
  right: CoverSettingsState,
): boolean {
  return (
    left.coverEnabled === right.coverEnabled &&
    left.customCoverHtml === right.customCoverHtml &&
    left.coverBaseBackgroundId === right.coverBaseBackgroundId &&
    left.coverSizePresetId === right.coverSizePresetId &&
    left.coverTextScalePercent === right.coverTextScalePercent &&
    left.coverTextPosition === right.coverTextPosition &&
    left.coverTextColorMode === right.coverTextColorMode &&
    left.hideCoverText === right.hideCoverText
  );
}

export function useCoverSettingsSession({
  isInteractionDisabled,
  buildCurrentSettings,
  onApplyCoverSettings,
}: {
  isInteractionDisabled: boolean;
  buildCurrentSettings: () => CoverSettingsState;
  onApplyCoverSettings?: (settings: CoverSettingsState) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<CoverSettingsHistoryState | null>(
    null,
  );

  const baseSettings = buildCurrentSettings();
  const activeSettings = history?.present ?? baseSettings;
  const canUndo = (history?.past.length ?? 0) > 0;
  const canRedo = (history?.future.length ?? 0) > 0;

  const commitChange = useCallback(
    (updater: (previous: CoverSettingsState) => CoverSettingsState) => {
      setHistory((previousHistory) => {
        if (!previousHistory) return previousHistory;
        const nextSettings = updater(previousHistory.present);
        if (isSameCoverSettingsState(nextSettings, previousHistory.present)) {
          return previousHistory;
        }
        return {
          past: [
            ...previousHistory.past.slice(-(COVER_SETTINGS_HISTORY_LIMIT - 1)),
            previousHistory.present,
          ],
          present: nextSettings,
          future: [],
        };
      });
    },
    [],
  );

  const open = useCallback(() => {
    const initialSettings = buildCurrentSettings();
    setHistory({
      past: [],
      present: initialSettings,
      future: [],
    });
    setIsOpen(true);
  }, [buildCurrentSettings]);

  const close = useCallback(() => {
    if (history) {
      const latestFromMain = buildCurrentSettings();
      if (!isSameCoverSettingsState(history.present, latestFromMain)) {
        onApplyCoverSettings?.(history.present);
      }
    }
    setHistory(null);
    setIsOpen(false);
  }, [history, buildCurrentSettings, onApplyCoverSettings]);

  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      if (details.open) {
        open();
        return;
      }
      close();
    },
    [open, close],
  );

  const undo = useCallback(() => {
    setHistory((previousHistory) => {
      if (!previousHistory || previousHistory.past.length === 0) {
        return previousHistory;
      }
      const previousSettings =
        previousHistory.past[previousHistory.past.length - 1];
      return {
        past: previousHistory.past.slice(0, -1),
        present: previousSettings,
        future: [
          ...previousHistory.future.slice(-(COVER_SETTINGS_HISTORY_LIMIT - 1)),
          previousHistory.present,
        ],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((previousHistory) => {
      if (!previousHistory || previousHistory.future.length === 0) {
        return previousHistory;
      }
      const nextSettings =
        previousHistory.future[previousHistory.future.length - 1];
      return {
        past: [
          ...previousHistory.past.slice(-(COVER_SETTINGS_HISTORY_LIMIT - 1)),
          previousHistory.present,
        ],
        present: nextSettings,
        future: previousHistory.future.slice(0, -1),
      };
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleUndoRedoHotkeys(event: KeyboardEvent) {
      if (isInteractionDisabled) return;
      if (isEditableTarget(event.target)) return;
      if (event.altKey) return;
      if (!event.metaKey && !event.ctrlKey) return;

      const key = event.key.toLowerCase();
      const isUndoKey = key === "z" && !event.shiftKey;
      const isRedoKey =
        (key === "z" && event.shiftKey) || (!event.metaKey && key === "y");

      if (isUndoKey) {
        if (!canUndo) return;
        event.preventDefault();
        undo();
        return;
      }

      if (isRedoKey) {
        if (!canRedo) return;
        event.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleUndoRedoHotkeys);
    return () => {
      window.removeEventListener("keydown", handleUndoRedoHotkeys);
    };
  }, [isOpen, isInteractionDisabled, canUndo, canRedo, undo, redo]);

  return {
    isOpen,
    baseSettings,
    activeSettings,
    canUndo,
    canRedo,
    commitChange,
    undo,
    redo,
    handleOpenChange,
  };
}
