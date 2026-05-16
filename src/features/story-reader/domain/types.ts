import type {
  STORY_READER_LENGTHS,
  STORY_READER_LEVELS,
  STORY_READER_TRANSLATION_STYLES,
} from "./constants";

export type StoryReaderLevel = (typeof STORY_READER_LEVELS)[number];
export type StoryReaderLength = (typeof STORY_READER_LENGTHS)[number];
export type StoryReaderTranslationStyle =
  (typeof STORY_READER_TRANSLATION_STYLES)[number];

export interface StoryReaderCustomLevelFields {
  maxSentenceLength: string;
  allowedGrammar: string;
  tenseAspectComfort: string;
  vocabularyComfort: string;
  cefrTarget: string;
  languageFeatures: string;
}

export interface StoryReaderSetupFormValues {
  knownLanguage: string;
  targetLanguage: string;
  level: StoryReaderLevel;
  theme: string;
  length: StoryReaderLength;
  translationStyle: StoryReaderTranslationStyle;
  vocabularyFocus: string;
  tone: string;
  avoidTopics: string;
  extraInstructions: string;
  customLevel: StoryReaderCustomLevelFields;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface StoryReaderLengthConstraints {
  paragraphCount: NumericRange;
  sentenceCount: NumericRange;
  targetLanguageWordCount: NumericRange | null;
  targetLanguageCharacterCount: NumericRange | null;
}

export interface StoryReaderLevelConstraints {
  sentenceWordCount: NumericRange | null;
  sentenceCharacterCount: NumericRange | null;
  grammar: string;
  highlightDensity: NumericRange;
}

