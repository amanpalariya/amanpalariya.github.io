import type {
  BILINGUAL_STORY_READER_LANGUAGE_OPTIONS,
  BILINGUAL_STORY_READER_LENGTHS,
  BILINGUAL_STORY_READER_LEVELS,
} from "./constants";

export type BilingualStoryReaderLevel = (typeof BILINGUAL_STORY_READER_LEVELS)[number];
export type BilingualStoryReaderLength = (typeof BILINGUAL_STORY_READER_LENGTHS)[number];
export type BilingualStoryReaderLanguageOption =
  (typeof BILINGUAL_STORY_READER_LANGUAGE_OPTIONS)[number]["name"];

export interface BilingualStoryReaderCustomLevelFields {
  maxSentenceLength: string;
  allowedGrammar: string;
  tenseAspectComfort: string;
  vocabularyComfort: string;
  cefrTarget: string;
  languageFeatures: string;
}

export interface BilingualStoryReaderSetupFormValues {
  knownLanguage: string;
  targetLanguage: string;
  level: BilingualStoryReaderLevel;
  theme: string;
  length: BilingualStoryReaderLength;
  extraInstructions: string;
  customLevel: BilingualStoryReaderCustomLevelFields;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface BilingualStoryReaderLengthConstraints {
  paragraphCount: NumericRange;
  sentenceCount: NumericRange;
  targetLanguageWordCount: NumericRange | null;
  targetLanguageCharacterCount: NumericRange | null;
}

export interface BilingualStoryReaderLevelConstraints {
  sentenceWordCount: NumericRange | null;
  sentenceCharacterCount: NumericRange | null;
  grammar: string;
  highlightDensity: NumericRange;
}
