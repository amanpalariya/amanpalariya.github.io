export const STORY_READER_TOOL_ID = "story-reader";
export const STORY_READER_ROUTE = "/tools/story-reader/";
export const STORY_READER_SCHEMA_VERSION = "1.0";

export const STORY_READER_LEVELS = [
  "Beginner",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Custom",
] as const;

export const STORY_READER_LENGTHS = ["Short", "Medium", "Long"] as const;

export const STORY_READER_TRANSLATION_STYLES = [
  "Natural",
  "Literal",
  "Both",
] as const;

export const STORY_READER_DIRECTIONS = ["ltr", "rtl", "auto"] as const;

export const STORY_READER_SEGMENT_KINDS = ["word", "phrase"] as const;

export const STORY_READER_QUESTION_DIFFICULTIES = [
  "direct-recall",
  "inference",
  "vocabulary-in-context",
] as const;

