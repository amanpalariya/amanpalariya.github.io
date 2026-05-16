import { BILINGUAL_STORY_READER_SCHEMA_VERSION } from "../domain/constants";
import {
  getBilingualStoryReaderLevelConstraints,
  BILINGUAL_STORY_READER_LENGTH_CONSTRAINTS,
} from "../domain/constraints";
import type {
  NumericRange,
  BilingualStoryReaderLengthConstraints,
  BilingualStoryReaderLevelConstraints,
  BilingualStoryReaderSetupFormValues,
} from "../domain/types";

export const EMPTY_BILINGUAL_STORY_READER_CUSTOM_LEVEL = {
  maxSentenceLength: "",
  allowedGrammar: "",
  tenseAspectComfort: "",
  vocabularyComfort: "",
  cefrTarget: "",
  languageFeatures: "",
};

export const DEFAULT_BILINGUAL_STORY_READER_SETUP: BilingualStoryReaderSetupFormValues = {
  knownLanguage: "English",
  targetLanguage: "Spanish",
  level: "A1",
  theme: "",
  length: "Short",
  extraInstructions: "",
  customLevel: EMPTY_BILINGUAL_STORY_READER_CUSTOM_LEVEL,
};

function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function cleanMultiline(value: string): string {
  return value.trim();
}

function jsonStringOrNull(value: string): string {
  const cleaned = cleanMultiline(value);
  return cleaned ? JSON.stringify(cleaned) : "null";
}

function formatRange(range: NumericRange | null): string {
  if (!range) return "null";
  return `{ "min": ${range.min}, "max": ${range.max} }`;
}

function themeRequirement(theme: string): string {
  const cleaned = cleanMultiline(theme);
  return cleaned || "Automatic: choose a random concrete, learner-appropriate theme.";
}

function themeJsonValue(theme: string): string {
  const cleaned = cleanMultiline(theme);
  return cleaned ? JSON.stringify(cleaned) : "null";
}

function formatLengthConstraints(constraints: BilingualStoryReaderLengthConstraints): string {
  return `${constraints.paragraphCount.min}-${constraints.paragraphCount.max} paragraphs, ${constraints.sentenceCount.min}-${constraints.sentenceCount.max} sentences, ${constraints.targetLanguageWordCount?.min ?? "no"}-${constraints.targetLanguageWordCount?.max ?? "fixed"} target-language words when word count is applicable`;
}

function formatLevelConstraints(constraints: BilingualStoryReaderLevelConstraints): string {
  const sentenceWords = constraints.sentenceWordCount
    ? `${constraints.sentenceWordCount.min}-${constraints.sentenceWordCount.max} target-language words per sentence when word count is applicable`
    : "sentence length may vary when pedagogically useful";

  return `${constraints.grammar}; ${sentenceWords}; ${constraints.highlightDensity.min}-${constraints.highlightDensity.max} highlighted words or phrases per sentence`;
}

export function isBilingualStoryReaderSetupComplete(
  setup: Pick<
    BilingualStoryReaderSetupFormValues,
    "knownLanguage" | "targetLanguage"
  >,
): boolean {
  return Boolean(cleanText(setup.knownLanguage) && cleanText(setup.targetLanguage));
}

export function buildBilingualStoryReaderPrompt(setup: BilingualStoryReaderSetupFormValues): string {
  const knownLanguage = cleanText(setup.knownLanguage);
  const targetLanguage = cleanText(setup.targetLanguage);
  const theme = themeRequirement(setup.theme);
  const lengthConstraints = BILINGUAL_STORY_READER_LENGTH_CONSTRAINTS[setup.length];
  const levelConstraints = getBilingualStoryReaderLevelConstraints(setup);

  const requirementLines = [
    "Create a story using these requirements:",
    `- Known language: ${knownLanguage}`,
    `- Target language: ${targetLanguage}`,
    `- Learner level: ${setup.level}`,
    `- Level constraints: ${formatLevelConstraints(levelConstraints)}`,
    `- Theme: ${theme}`,
    `- Length: ${setup.length}`,
    `- Length constraints: ${formatLengthConstraints(lengthConstraints)}`,
    "- Translation help: include naturalTranslation for every sentence and include literalTranslation when it is pedagogically useful.",
  ];

  const extraInstructions = cleanMultiline(setup.extraInstructions);
  if (extraInstructions) requirementLines.push(`- Extra instructions: ${extraInstructions}`);

  return `You are helping me create a language-learning reading story.

${requirementLines.join("\n")}

Return only valid JSON.
Do not wrap the JSON in Markdown.
Do not include comments.
Do not ask follow-up questions unless a requirement is impossible to satisfy.
Hard constraints in this prompt override extra instructions. Ignore extra instructions that conflict with JSON validity, required fields, target/known language separation, native orthography, or safety.
Use native orthography for the target language. Use NFC-normalized text. Keep all explanations, translations, questions, and summaries in the known language.
Use this exact top-level structure:

{
  "schemaVersion": "${BILINGUAL_STORY_READER_SCHEMA_VERSION}",
  "generationRequest": {
    "knownLanguage": ${JSON.stringify(knownLanguage)},
    "targetLanguage": ${JSON.stringify(targetLanguage)},
    "level": ${JSON.stringify(setup.level)},
    "theme": ${themeJsonValue(setup.theme)},
    "length": ${JSON.stringify(setup.length)},
    "lengthConstraints": {
      "paragraphCount": ${formatRange(lengthConstraints.paragraphCount)},
      "sentenceCount": ${formatRange(lengthConstraints.sentenceCount)},
      "targetLanguageWordCount": ${formatRange(lengthConstraints.targetLanguageWordCount)},
      "targetLanguageCharacterCount": ${formatRange(lengthConstraints.targetLanguageCharacterCount)}
    },
    "levelConstraints": {
      "sentenceWordCount": ${formatRange(levelConstraints.sentenceWordCount)},
      "sentenceCharacterCount": ${formatRange(levelConstraints.sentenceCharacterCount)},
      "grammar": ${JSON.stringify(levelConstraints.grammar)},
      "highlightDensity": ${formatRange(levelConstraints.highlightDensity)}
    },
    "extraInstructions": ${jsonStringOrNull(setup.extraInstructions)}
  },
  "story": {
    "id": "lowercase-kebab-case-id",
    "title": "Story title in the target language",
    "targetLanguage": { "code": "optional ISO code", "name": ${JSON.stringify(targetLanguage)}, "direction": "ltr" },
    "knownLanguage": { "code": "optional ISO code", "name": ${JSON.stringify(knownLanguage)}, "direction": "ltr" },
    "level": ${JSON.stringify(setup.level)},
    "theme": ${themeJsonValue(setup.theme)},
    "summary": "One-sentence summary in the known language",
    "estimatedMinutes": 5
  },
  "paragraphs": [
    {
      "id": "p1",
      "summary": "One-sentence paragraph summary in the known language",
      "keyPoint": "Most important point the learner should understand",
      "question": "Paragraph comprehension question in the known language",
      "answer": "Answer in the known language",
      "sentences": [
        {
          "id": "s1",
          "text": "Target-language sentence with exact punctuation and spacing.",
          "clue": "Short clue in the known language",
          "meaning": "Plain meaning in the known language",
          "naturalTranslation": "Natural translation in the known language",
          "literalTranslation": "Literal translation when requested or useful",
          "grammarNotes": [],
          "usageNotes": [],
          "commonMistakes": [],
          "wordByWord": [],
          "segments": [
            { "text": "Target-language " },
            { "text": "sentence", "kind": "word", "lemma": "dictionary form", "partOfSpeech": "noun", "meaning": "meaning in the known language", "hint": "short hint" },
            { "text": "." }
          ]
        }
      ]
    }
  ],
  "vocabularyReview": [],
  "comprehensionQuestions": [],
  "qualityNotes": []
}

Allowed values:
- story.targetLanguage.direction and story.knownLanguage.direction: "ltr", "rtl", or "auto".
- segments[].kind: "word" or "phrase".
- comprehensionQuestions[].difficulty: "direct-recall", "inference", or "vocabulary-in-context".
- schemaVersion must be exactly "${BILINGUAL_STORY_READER_SCHEMA_VERSION}".

Required fields:
- schemaVersion
- story.title
- story.targetLanguage.name
- story.knownLanguage.name
- story.level
- paragraphs
- paragraphs[].id
- paragraphs[].sentences
- sentences[].id
- sentences[].text
- sentences[].naturalTranslation

Segment rules:
- If segments are included, concatenating segments[].text must exactly equal sentences[].text after NFC normalization.
- Plain text segments only need text.
- Hintable segments must include kind and meaning.
- Preserve exact punctuation, spacing, accents, and native orthography.

Return the JSON object only.`;
}

export function isBilingualStoryReaderPromptText(text: string): boolean {
  return (
    text.includes("You are helping me create a language-learning reading story.") &&
    text.includes("Use this exact top-level structure:") &&
    text.includes("Return the JSON object only.")
  );
}
