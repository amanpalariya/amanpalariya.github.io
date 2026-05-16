import { STORY_READER_SCHEMA_VERSION } from "../domain/constants";
import {
  getStoryReaderLevelConstraints,
  getStoryReaderTranslationStyleRules,
  STORY_READER_LENGTH_CONSTRAINTS,
} from "../domain/constraints";
import type {
  NumericRange,
  StoryReaderLengthConstraints,
  StoryReaderLevelConstraints,
  StoryReaderSetupFormValues,
} from "../domain/types";

export const EMPTY_STORY_READER_CUSTOM_LEVEL = {
  maxSentenceLength: "",
  allowedGrammar: "",
  tenseAspectComfort: "",
  vocabularyComfort: "",
  cefrTarget: "",
  languageFeatures: "",
};

export const DEFAULT_STORY_READER_SETUP: StoryReaderSetupFormValues = {
  knownLanguage: "",
  targetLanguage: "",
  level: "A1",
  theme: "",
  length: "Short",
  translationStyle: "Both",
  vocabularyFocus: "",
  tone: "",
  avoidTopics: "",
  extraInstructions: "",
  customLevel: EMPTY_STORY_READER_CUSTOM_LEVEL,
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

function formatLengthConstraints(constraints: StoryReaderLengthConstraints): string {
  return `${constraints.paragraphCount.min}-${constraints.paragraphCount.max} paragraphs, ${constraints.sentenceCount.min}-${constraints.sentenceCount.max} sentences, ${constraints.targetLanguageWordCount?.min ?? "no"}-${constraints.targetLanguageWordCount?.max ?? "fixed"} target-language words when word count is applicable`;
}

function formatLevelConstraints(constraints: StoryReaderLevelConstraints): string {
  const sentenceWords = constraints.sentenceWordCount
    ? `${constraints.sentenceWordCount.min}-${constraints.sentenceWordCount.max} target-language words per sentence when word count is applicable`
    : "sentence length may vary when pedagogically useful";

  return `${constraints.grammar}; ${sentenceWords}; ${constraints.highlightDensity.min}-${constraints.highlightDensity.max} highlighted words or phrases per sentence`;
}

function appendOptionalLine(lines: string[], label: string, value: string): void {
  const cleaned = cleanMultiline(value);
  if (cleaned) lines.push(`- ${label}: ${cleaned}`);
}

export function isStoryReaderSetupComplete(
  setup: Pick<
    StoryReaderSetupFormValues,
    "knownLanguage" | "targetLanguage" | "theme"
  >,
): boolean {
  return Boolean(
    cleanText(setup.knownLanguage) &&
      cleanText(setup.targetLanguage) &&
      cleanText(setup.theme),
  );
}

export function buildStoryReaderPrompt(setup: StoryReaderSetupFormValues): string {
  const knownLanguage = cleanText(setup.knownLanguage);
  const targetLanguage = cleanText(setup.targetLanguage);
  const theme = cleanMultiline(setup.theme);
  const lengthConstraints = STORY_READER_LENGTH_CONSTRAINTS[setup.length];
  const levelConstraints = getStoryReaderLevelConstraints(setup);
  const translationStyleRules = getStoryReaderTranslationStyleRules(setup.translationStyle);

  const requirementLines = [
    "Create a story using these requirements:",
    `- Known language: ${knownLanguage}`,
    `- Target language: ${targetLanguage}`,
    `- Learner level: ${setup.level}`,
    `- Level constraints: ${formatLevelConstraints(levelConstraints)}`,
    `- Theme: ${theme}`,
  ];

  appendOptionalLine(requirementLines, "Avoid topics", setup.avoidTopics);
  requirementLines.push(
    `- Length: ${setup.length}`,
    `- Length constraints: ${formatLengthConstraints(lengthConstraints)}`,
    `- Translation style: ${setup.translationStyle}`,
    `- Translation style rules: ${translationStyleRules}`,
  );
  appendOptionalLine(requirementLines, "Vocabulary focus", setup.vocabularyFocus);
  appendOptionalLine(requirementLines, "Tone", setup.tone);
  appendOptionalLine(requirementLines, "Extra instructions", setup.extraInstructions);

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
  "schemaVersion": "${STORY_READER_SCHEMA_VERSION}",
  "generationRequest": {
    "knownLanguage": ${JSON.stringify(knownLanguage)},
    "targetLanguage": ${JSON.stringify(targetLanguage)},
    "level": ${JSON.stringify(setup.level)},
    "theme": ${JSON.stringify(theme)},
    "avoidTopics": ${jsonStringOrNull(setup.avoidTopics)},
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
    "translationStyle": ${JSON.stringify(setup.translationStyle.toLowerCase())},
    "vocabularyFocus": ${jsonStringOrNull(setup.vocabularyFocus)},
    "tone": ${jsonStringOrNull(setup.tone)},
    "extraInstructions": ${jsonStringOrNull(setup.extraInstructions)}
  },
  "story": {
    "id": "lowercase-kebab-case-id",
    "title": "Story title in the target language",
    "targetLanguage": { "code": "optional ISO code", "name": ${JSON.stringify(targetLanguage)}, "direction": "ltr" },
    "knownLanguage": { "code": "optional ISO code", "name": ${JSON.stringify(knownLanguage)}, "direction": "ltr" },
    "level": ${JSON.stringify(setup.level)},
    "theme": ${JSON.stringify(theme)},
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
- schemaVersion must be exactly "${STORY_READER_SCHEMA_VERSION}".

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

