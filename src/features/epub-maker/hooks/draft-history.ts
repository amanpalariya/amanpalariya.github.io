import type { CoverSettingsState, PageDraft } from "../types";

const PAGE_HISTORY_LIMIT = 100;

export type DraftSnapshot = {
  pages: PageDraft[];
} & CoverSettingsState;

export interface DraftHistoryState {
  past: DraftSnapshot[];
  present: DraftSnapshot;
  future: DraftSnapshot[];
}

export type DraftHistoryAction =
  | { type: "commit"; updater: (previousDraft: DraftSnapshot) => DraftSnapshot }
  | { type: "undo" }
  | { type: "redo" };

export function draftHistoryReducer(
  state: DraftHistoryState,
  action: DraftHistoryAction,
): DraftHistoryState {
  if (action.type === "undo") {
    if (state.past.length === 0) {
      return state;
    }

    const previousDraft = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previousDraft,
      future: [...state.future.slice(-(PAGE_HISTORY_LIMIT - 1)), state.present],
    };
  }

  if (action.type === "redo") {
    if (state.future.length === 0) {
      return state;
    }

    const nextDraft = state.future[state.future.length - 1];
    return {
      past: [...state.past.slice(-(PAGE_HISTORY_LIMIT - 1)), state.present],
      present: nextDraft,
      future: state.future.slice(0, -1),
    };
  }

  const nextDraft = action.updater(state.present);
  if (nextDraft === state.present) {
    return state;
  }

  return {
    past: [...state.past.slice(-(PAGE_HISTORY_LIMIT - 1)), state.present],
    present: nextDraft,
    future: [],
  };
}
