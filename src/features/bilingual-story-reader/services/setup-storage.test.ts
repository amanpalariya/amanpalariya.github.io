import { buildToolStorageKey } from "@utils/storage";
import { beforeEach, describe, expect, it } from "vitest";
import { BILINGUAL_STORY_READER_TOOL_ID } from "../domain/constants";
import { DEFAULT_BILINGUAL_STORY_READER_SETUP } from "./prompt-builder";
import {
  readBilingualStoryReaderSetup,
  writeBilingualStoryReaderSetup,
} from "./setup-storage";

const SETUP_STORAGE_KEY = buildToolStorageKey(
  BILINGUAL_STORY_READER_TOOL_ID,
  "setup",
);

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

describe("bilingual story reader setup storage", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("returns defaults when no setup is persisted", () => {
    expect(readBilingualStoryReaderSetup()).toEqual(
      DEFAULT_BILINGUAL_STORY_READER_SETUP,
    );
  });

  it("round-trips setup values", () => {
    const setup = {
      knownLanguage: "English",
      targetLanguage: "French",
      level: "B1",
      theme: "quiet mystery",
      length: "Long",
      extraInstructions: "Use short dialogue.",
    } as const;

    writeBilingualStoryReaderSetup(setup);

    expect(readBilingualStoryReaderSetup()).toEqual(setup);
  });

  it("falls back safely for malformed or unsupported persisted fields", () => {
    window.localStorage.setItem(
      SETUP_STORAGE_KEY,
      JSON.stringify({
        knownLanguage: "Hindi",
        targetLanguage: 42,
        level: "Expert",
        theme: "festival",
        length: "Tiny",
        extraInstructions: null,
      }),
    );

    expect(readBilingualStoryReaderSetup()).toEqual({
      ...DEFAULT_BILINGUAL_STORY_READER_SETUP,
      knownLanguage: "Hindi",
      theme: "festival",
    });
  });

  it("returns defaults for unreadable stored JSON", () => {
    window.localStorage.setItem(SETUP_STORAGE_KEY, "{not json");

    expect(readBilingualStoryReaderSetup()).toEqual(
      DEFAULT_BILINGUAL_STORY_READER_SETUP,
    );
  });
});
