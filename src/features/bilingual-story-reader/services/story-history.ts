import { buildToolStorageKey } from "@utils/storage";
import {
  BILINGUAL_STORY_READER_LENGTHS,
  BILINGUAL_STORY_READER_LEVELS,
  BILINGUAL_STORY_READER_TOOL_ID,
} from "../domain/constants";
import type { BilingualStoryReaderSetupFormValues } from "../domain/types";
import type { RenderableStory } from "../domain/validate-story";
import { validateBilingualStoryReaderSchema } from "../domain/validate-story";

export interface StoryHistoryEntry {
  id: string;
  loadedAt: string;
  setup: BilingualStoryReaderSetupFormValues;
  story: RenderableStory;
}

const STORY_HISTORY_STORAGE_KEY = buildToolStorageKey(
  BILINGUAL_STORY_READER_TOOL_ID,
  "history",
);
export const STORY_HISTORY_LIMIT = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSetup(value: unknown): BilingualStoryReaderSetupFormValues | null {
  if (!isRecord(value)) return null;

  const knownLanguage = nonEmptyString(value.knownLanguage);
  const targetLanguage = nonEmptyString(value.targetLanguage);
  const theme = typeof value.theme === "string" ? value.theme : "";
  const extraInstructions =
    typeof value.extraInstructions === "string" ? value.extraInstructions : "";
  const level = value.level;
  const length = value.length;

  if (!knownLanguage || !targetLanguage) return null;
  if (!BILINGUAL_STORY_READER_LEVELS.includes(level as never)) return null;
  if (!BILINGUAL_STORY_READER_LENGTHS.includes(length as never)) return null;

  return {
    knownLanguage,
    targetLanguage,
    level: level as BilingualStoryReaderSetupFormValues["level"],
    theme,
    length: length as BilingualStoryReaderSetupFormValues["length"],
    extraInstructions,
  };
}

function normalizeHistoryEntry(value: unknown): StoryHistoryEntry | null {
  if (!isRecord(value)) return null;

  const id = nonEmptyString(value.id);
  const loadedAt = nonEmptyString(value.loadedAt);
  const setup = normalizeSetup(value.setup);
  const storyValidation = validateBilingualStoryReaderSchema(value.story);

  if (!id || !loadedAt || !setup || !storyValidation.ok) return null;

  return {
    id,
    loadedAt,
    setup,
    story: storyValidation.value,
  };
}

export function readStoryHistory(): StoryHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(STORY_HISTORY_STORAGE_KEY);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => normalizeHistoryEntry(entry))
      .filter((entry): entry is StoryHistoryEntry => entry !== null)
      .slice(0, STORY_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function writeStoryHistory(entries: StoryHistoryEntry[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORY_HISTORY_STORAGE_KEY,
      JSON.stringify(entries.slice(0, STORY_HISTORY_LIMIT)),
    );
  } catch {
    // ignore localStorage write failures
  }
}

export function createStoryHistoryEntry(
  setup: BilingualStoryReaderSetupFormValues,
  story: RenderableStory,
): StoryHistoryEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    loadedAt: new Date().toISOString(),
    setup: {
      knownLanguage: setup.knownLanguage,
      targetLanguage: setup.targetLanguage,
      level: setup.level,
      theme: setup.theme,
      length: setup.length,
      extraInstructions: setup.extraInstructions,
    },
    story,
  };
}

export function prependStoryHistoryEntry(
  entries: StoryHistoryEntry[],
  setup: BilingualStoryReaderSetupFormValues,
  story: RenderableStory,
): StoryHistoryEntry[] {
  return prependStoryHistoryEntryObject(
    entries,
    createStoryHistoryEntry(setup, story),
  );
}

export function prependStoryHistoryEntryObject(
  entries: StoryHistoryEntry[],
  entry: StoryHistoryEntry,
): StoryHistoryEntry[] {
  return [entry, ...entries.filter((current) => current.id !== entry.id)].slice(
    0,
    STORY_HISTORY_LIMIT,
  );
}
