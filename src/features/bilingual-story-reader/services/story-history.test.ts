import { buildToolStorageKey } from "@utils/storage";
import { beforeEach, describe, expect, it } from "vitest";
import { BILINGUAL_STORY_READER_TOOL_ID } from "../domain/constants";
import type { RenderableStory } from "../domain/validate-story";
import {
  createStoryHistoryEntry,
  prependStoryHistoryEntryObject,
  readStoryHistory,
  removeStoryHistoryEntry,
  STORY_HISTORY_LIMIT,
  writeStoryHistory,
  type StoryHistoryEntry,
} from "./story-history";

function story(): RenderableStory {
  return {
    story: {
      title: "El tren",
      targetLanguage: "Spanish",
      knownLanguage: "English",
      level: "A1",
      theme: "train station",
      estimatedMinutes: 3,
    },
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "p1-s1",
            text: "Lina entra.",
            translation: "Lina enters.",
            note: null,
          },
        ],
      },
    ],
  };
}

function historyEntry(id: string): StoryHistoryEntry {
  return {
    id,
    loadedAt: `2026-01-01T00:00:${id.padStart(2, "0")}.000Z`,
    story: story(),
  };
}

function installLocalStorage(): void {
  const values = new Map<string, string>();
  const localStorage = {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  } satisfies Storage;

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: localStorage,
  });
}

describe("story history", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("creates entries from story metadata without setup snapshots", () => {
    const entry = createStoryHistoryEntry(story());

    expect((entry as { setup?: unknown }).setup).toBeUndefined();
    expect(entry.story.story.theme).toBe("train station");
  });

  it("round-trips persisted entries without setup snapshots", () => {
    const entry = createStoryHistoryEntry(story());

    writeStoryHistory([entry]);

    const [persistedEntry] = readStoryHistory();
    expect(persistedEntry?.story.story).toMatchObject({
      title: "El tren",
      level: "A1",
      theme: "train station",
    });
    expect((persistedEntry as { setup?: unknown } | undefined)?.setup).toBeUndefined();
  });

  it("prepends new history entries and replaces duplicate ids", () => {
    const existing = [historyEntry("1"), historyEntry("2")];
    const replacement = historyEntry("2");

    const nextHistory = prependStoryHistoryEntryObject(existing, replacement);

    expect(nextHistory.map((entry) => entry.id)).toEqual(["2", "1"]);
    expect(nextHistory[0]).toBe(replacement);
  });

  it("limits history to the configured maximum", () => {
    const existing = Array.from({ length: STORY_HISTORY_LIMIT }, (_, index) =>
      historyEntry(String(index)),
    );

    const nextHistory = prependStoryHistoryEntryObject(existing, historyEntry("new"));

    expect(nextHistory).toHaveLength(STORY_HISTORY_LIMIT);
    expect(nextHistory[0]?.id).toBe("new");
    expect(nextHistory.at(-1)?.id).toBe(String(STORY_HISTORY_LIMIT - 2));
  });

  it("removes a matching history entry without touching the others", () => {
    const nextHistory = removeStoryHistoryEntry(
      [historyEntry("1"), historyEntry("2"), historyEntry("3")],
      "2",
    );

    expect(nextHistory.map((entry) => entry.id)).toEqual(["1", "3"]);
  });

  it("drops entries whose pasted story metadata is incomplete", () => {
    window.localStorage.setItem(
      buildToolStorageKey(BILINGUAL_STORY_READER_TOOL_ID, "history"),
      JSON.stringify([
        {
          id: "missing-theme",
          loadedAt: new Date().toISOString(),
          story: {
            story: {
              title: "El tren",
              targetLanguage: "Spanish",
              knownLanguage: "English",
              level: "A1",
              estimatedMinutes: 3,
            },
            paragraphs: [
              {
                sentences: [
                  {
                    text: "Lina entra.",
                    translation: "Lina enters.",
                  },
                ],
              },
            ],
          },
        },
      ]),
    );

    expect(readStoryHistory()).toEqual([]);
  });
});
