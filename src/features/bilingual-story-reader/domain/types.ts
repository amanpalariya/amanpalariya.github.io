import type {
  BILINGUAL_STORY_READER_LENGTHS,
  BILINGUAL_STORY_READER_LEVELS,
} from "./constants";

export type BilingualStoryReaderLevel = (typeof BILINGUAL_STORY_READER_LEVELS)[number];
export type BilingualStoryReaderLength = (typeof BILINGUAL_STORY_READER_LENGTHS)[number];

export interface BilingualStoryReaderSetupFormValues {
  knownLanguage: string;
  targetLanguage: string;
  level: BilingualStoryReaderLevel;
  theme: string;
  length: BilingualStoryReaderLength;
  extraInstructions: string;
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
}
