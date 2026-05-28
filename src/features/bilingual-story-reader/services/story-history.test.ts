import { buildToolStorageKey } from "@utils/storage";
import { beforeEach, describe, expect, it } from "vitest";
import { BILINGUAL_STORY_READER_TOOL_ID } from "../domain/constants";
import type { RenderableStory } from "../domain/validate-story";
import {
  createStoryHistoryEntry,
  readStoryHistory,
  writeStoryHistory,
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
