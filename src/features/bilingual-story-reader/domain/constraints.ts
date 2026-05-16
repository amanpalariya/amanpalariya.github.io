import type {
  BilingualStoryReaderLength,
  BilingualStoryReaderLengthConstraints,
  BilingualStoryReaderLevel,
  BilingualStoryReaderLevelConstraints,
  BilingualStoryReaderSetupFormValues,
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
    highlightDensity: { min: 1, max: 1 },
  },
  A1: {
    sentenceWordCount: { min: 6, max: 10 },
    sentenceCharacterCount: null,
    grammar:
      "mostly present tense, concrete nouns and verbs, no unexplained idioms, no subordinate clauses unless explained",
    highlightDensity: { min: 1, max: 2 },
  },
  A2: {
    sentenceWordCount: { min: 8, max: 14 },
    sentenceCharacterCount: null,
    grammar:
      "present and common past/future forms, simple connectors, familiar everyday topics, limited subordinate clauses",
    highlightDensity: { min: 1, max: 2 },
  },
  B1: {
    sentenceWordCount: { min: 10, max: 18 },
    sentenceCharacterCount: null,
    grammar:
      "mixed common tenses, clear cause/effect, moderate dialogue, occasional idioms with explanations",
    highlightDensity: { min: 1, max: 3 },
  },
  B2: {
    sentenceWordCount: { min: 12, max: 24 },
    sentenceCharacterCount: null,
    grammar:
      "more natural prose, varied sentence structure, nuance and register notes, idioms allowed when explained",
    highlightDensity: { min: 1, max: 3 },
  },
  C1: {
    sentenceWordCount: null,
    sentenceCharacterCount: null,
    grammar:
      "authentic-style prose, idioms, collocations, register and nuance explanations, longer sentences allowed when pedagogically useful",
    highlightDensity: { min: 1, max: 3 },
  },
  C2: {
    sentenceWordCount: null,
    sentenceCharacterCount: null,
    grammar:
      "authentic-style prose, idioms, collocations, register and nuance explanations, longer sentences allowed when pedagogically useful",
    highlightDensity: { min: 1, max: 3 },
  },
  Custom: {
    sentenceWordCount: null,
    sentenceCharacterCount: null,
    grammar: "custom learner constraints supplied by the setup form",
    highlightDensity: { min: 1, max: 3 },
  },
};

export function getBilingualStoryReaderLevelConstraints(
  setup: Pick<BilingualStoryReaderSetupFormValues, "level" | "customLevel">,
): BilingualStoryReaderLevelConstraints {
  if (setup.level !== "Custom") return LEVEL_CONSTRAINTS[setup.level];

  const customParts = [
    setup.customLevel.cefrTarget ? `CEFR-like target: ${setup.customLevel.cefrTarget}` : null,
    setup.customLevel.allowedGrammar ? `allowed grammar: ${setup.customLevel.allowedGrammar}` : null,
    setup.customLevel.tenseAspectComfort
      ? `tense/aspect comfort: ${setup.customLevel.tenseAspectComfort}`
      : null,
    setup.customLevel.vocabularyComfort
      ? `vocabulary comfort: ${setup.customLevel.vocabularyComfort}`
      : null,
    setup.customLevel.languageFeatures
      ? `features to include or avoid: ${setup.customLevel.languageFeatures}`
      : null,
  ].filter(Boolean);

  const maxSentenceLength = Number.parseInt(setup.customLevel.maxSentenceLength, 10);

  return {
    sentenceWordCount: Number.isFinite(maxSentenceLength)
      ? { min: 1, max: maxSentenceLength }
      : null,
    sentenceCharacterCount: null,
    grammar: customParts.join("; ") || LEVEL_CONSTRAINTS.Custom.grammar,
    highlightDensity: LEVEL_CONSTRAINTS.Custom.highlightDensity,
  };
}
