import { buildToolStorageKey } from "@utils/storage";
import {
  BILINGUAL_STORY_READER_LENGTHS,
  BILINGUAL_STORY_READER_LEVELS,
  BILINGUAL_STORY_READER_TOOL_ID,
} from "../domain/constants";
import type {
  BilingualStoryReaderLength,
  BilingualStoryReaderLevel,
  BilingualStoryReaderSetupFormValues,
} from "../domain/types";
import { DEFAULT_BILINGUAL_STORY_READER_SETUP } from "./prompt-builder";

const SETUP_STORAGE_KEY = buildToolStorageKey(
  BILINGUAL_STORY_READER_TOOL_ID,
  "setup",
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  value: Record<string, unknown>,
  key: keyof BilingualStoryReaderSetupFormValues,
): string {
  return typeof value[key] === "string"
    ? value[key]
    : DEFAULT_BILINGUAL_STORY_READER_SETUP[key];
}

function readLevel(value: unknown): BilingualStoryReaderLevel {
  return BILINGUAL_STORY_READER_LEVELS.includes(value as BilingualStoryReaderLevel)
    ? (value as BilingualStoryReaderLevel)
    : DEFAULT_BILINGUAL_STORY_READER_SETUP.level;
}

function readLength(value: unknown): BilingualStoryReaderLength {
  return BILINGUAL_STORY_READER_LENGTHS.includes(value as BilingualStoryReaderLength)
    ? (value as BilingualStoryReaderLength)
    : DEFAULT_BILINGUAL_STORY_READER_SETUP.length;
}

function normalizeSetup(value: unknown): BilingualStoryReaderSetupFormValues | null {
  if (!isRecord(value)) return null;

  return {
    knownLanguage: readString(value, "knownLanguage"),
    targetLanguage: readString(value, "targetLanguage"),
    level: readLevel(value.level),
    theme: readString(value, "theme"),
    length: readLength(value.length),
    extraInstructions: readString(value, "extraInstructions"),
  };
}

export function readBilingualStoryReaderSetup(): BilingualStoryReaderSetupFormValues {
  if (typeof window === "undefined") return DEFAULT_BILINGUAL_STORY_READER_SETUP;

  try {
    const rawValue = window.localStorage.getItem(SETUP_STORAGE_KEY);
    if (!rawValue) return DEFAULT_BILINGUAL_STORY_READER_SETUP;

    return normalizeSetup(JSON.parse(rawValue)) ?? DEFAULT_BILINGUAL_STORY_READER_SETUP;
  } catch {
    return DEFAULT_BILINGUAL_STORY_READER_SETUP;
  }
}

export function writeBilingualStoryReaderSetup(
  setup: BilingualStoryReaderSetupFormValues,
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(setup));
  } catch {
    // ignore localStorage write failures
  }
}
