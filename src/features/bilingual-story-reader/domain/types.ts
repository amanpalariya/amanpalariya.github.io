import type {
  BILINGUAL_STORY_READER_LENGTHS,
  BILINGUAL_STORY_READER_LEVELS,
  BILINGUAL_STORY_READER_TRANSLATION_STYLES,
} from "./constants";

export type BilingualStoryReaderLevel = (typeof BILINGUAL_STORY_READER_LEVELS)[number];
export type BilingualStoryReaderLength = (typeof BILINGUAL_STORY_READER_LENGTHS)[number];
export type BilingualStoryReaderTranslationStyle =
  (typeof BILINGUAL_STORY_READER_TRANSLATION_STYLES)[number];

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
  translationStyle: BilingualStoryReaderTranslationStyle;
  vocabularyFocus: string;
  tone: string;
  avoidTopics: string;
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

