import { describe, expect, it } from "vitest";
import { draftHistoryReducer, type DraftHistoryState } from "./draft-history";
import type { DraftSnapshot } from "./draft-history";

function snapshot(label: string): DraftSnapshot {
  return {
    pages: [
      {
        id: label,
        title: label,
        inputKind: "text",
        rawContent: label,
        baseUrl: null,
        previewHtml: label,
        createdAt: 0,
      },
    ],
    coverEnabled: true,
    customCoverHtml: null,
    coverBaseBackgroundId: "monochrome",
    coverSizePresetId: "ratio_1_1_6",
    coverTextScalePercent: 100,
    coverTextPosition: "style_1",
    coverTextColorMode: "adaptive",
    hideCoverText: false,
  };
}

function label(state: DraftHistoryState): string {
  return state.present.pages[0]?.title ?? "";
}

function state(present = "initial"): DraftHistoryState {
  return {
    past: [],
    present: snapshot(present),
    future: [],
  };
}

describe("draftHistoryReducer", () => {
  it("commits a changed draft, pushes the previous present into past, and clears redo state", () => {
    const current: DraftHistoryState = {
      ...state("current"),
      future: [snapshot("redo")],
    };

    const next = draftHistoryReducer(current, {
      type: "commit",
      updater: () => snapshot("next"),
    });

    expect(label(next)).toBe("next");
    expect(next.past.map((entry) => entry.pages[0]?.title)).toEqual(["current"]);
    expect(next.future).toEqual([]);
  });

  it("returns the same history object when a commit updater returns the same draft reference", () => {
    const current = state("current");

    const next = draftHistoryReducer(current, {
      type: "commit",
      updater: (previousDraft) => previousDraft,
    });

    expect(next).toBe(current);
  });

  it("undo moves the latest past draft into present and stores the replaced present for redo", () => {
    const current: DraftHistoryState = {
      past: [snapshot("one"), snapshot("two")],
      present: snapshot("three"),
      future: [],
    };

    const next = draftHistoryReducer(current, { type: "undo" });

    expect(label(next)).toBe("two");
    expect(next.past.map((entry) => entry.pages[0]?.title)).toEqual(["one"]);
    expect(next.future.map((entry) => entry.pages[0]?.title)).toEqual(["three"]);
  });

  it("redo moves the latest future draft into present and stores the replaced present in past", () => {
    const current: DraftHistoryState = {
      past: [snapshot("one")],
      present: snapshot("two"),
      future: [snapshot("three"), snapshot("four")],
    };

    const next = draftHistoryReducer(current, { type: "redo" });

    expect(label(next)).toBe("four");
    expect(next.past.map((entry) => entry.pages[0]?.title)).toEqual([
      "one",
      "two",
    ]);
    expect(next.future.map((entry) => entry.pages[0]?.title)).toEqual(["three"]);
  });

  it("does nothing when undo or redo has no available draft", () => {
    const current = state("current");

    expect(draftHistoryReducer(current, { type: "undo" })).toBe(current);
    expect(draftHistoryReducer(current, { type: "redo" })).toBe(current);
  });

  it("keeps only the latest 100 past entries after many commits", () => {
    let current = state("0");

    for (let index = 1; index <= 105; index += 1) {
      current = draftHistoryReducer(current, {
        type: "commit",
        updater: () => snapshot(String(index)),
      });
    }

    expect(label(current)).toBe("105");
    expect(current.past).toHaveLength(100);
    expect(current.past[0]?.pages[0]?.title).toBe("5");
    expect(current.past[99]?.pages[0]?.title).toBe("104");
  });
});
