import type {
  BilingualStoryReaderLength,
  BilingualStoryReaderLengthConstraints,
  BilingualStoryReaderLevel,
  BilingualStoryReaderLevelConstraints,
} from "./types";

export const BILINGUAL_STORY_READER_LENGTH_CONSTRAINTS: Record<
  BilingualStoryReaderLength,
  BilingualStoryReaderLengthConstraints
> = {
  Short: {
    paragraphCount: { min: 2, max: 2 },
    sentenceCount: { min: 4, max: 6 },
    targetLanguageWordCount: { min: 80, max: 120 },
    targetLanguageCharacterCount: null,
  },
  Medium: {
    paragraphCount: { min: 3, max: 4 },
    sentenceCount: { min: 8, max: 12 },
    targetLanguageWordCount: { min: 180, max: 260 },
    targetLanguageCharacterCount: null,
  },
  Long: {
    paragraphCount: { min: 5, max: 7 },
    sentenceCount: { min: 14, max: 20 },
    targetLanguageWordCount: { min: 350, max: 500 },
    targetLanguageCharacterCount: null,
  },
};

const LEVEL_CONSTRAINTS: Record<BilingualStoryReaderLevel, BilingualStoryReaderLevelConstraints> = {
  Beginner: {
    sentenceWordCount: { min: 4, max: 8 },
    sentenceCharacterCount: null,
    grammar:
      "pre-A1/A1-lite, present tense only where the language supports tense, concrete nouns and verbs, very common daily-life vocabulary, no idioms, no subordinate clauses",
  },
  A1: {
    sentenceWordCount: { min: 6, max: 10 },
    sentenceCharacterCount: null,
    grammar:
      "mostly present tense, concrete nouns and verbs, no unexplained idioms, no subordinate clauses unless explained",
  },
  A2: {
    sentenceWordCount: { min: 8, max: 14 },
    sentenceCharacterCount: null,
    grammar:
      "present and common past/future forms, simple connectors, familiar everyday topics, limited subordinate clauses",
  },
  B1: {
    sentenceWordCount: { min: 10, max: 18 },
    sentenceCharacterCount: null,
    grammar:
      "mixed common tenses, clear cause/effect, moderate dialogue, occasional idioms with explanations",
  },
  B2: {
    sentenceWordCount: { min: 12, max: 24 },
    sentenceCharacterCount: null,
    grammar:
      "more natural prose, varied sentence structure, nuance and register notes, idioms allowed when explained",
  },
  C1: {
    sentenceWordCount: null,
    sentenceCharacterCount: null,
    grammar:
      "authentic-style prose, idioms, collocations, register and nuance explanations, longer sentences allowed when pedagogically useful",
  },
  C2: {
    sentenceWordCount: null,
    sentenceCharacterCount: null,
    grammar:
      "authentic-style prose, idioms, collocations, register and nuance explanations, longer sentences allowed when pedagogically useful",
  },
};

export function getBilingualStoryReaderLevelConstraints(
  level: BilingualStoryReaderLevel,
): BilingualStoryReaderLevelConstraints {
  return LEVEL_CONSTRAINTS[level];
}
