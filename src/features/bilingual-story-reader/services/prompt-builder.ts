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

export const DEFAULT_BILINGUAL_STORY_READER_SETUP: BilingualStoryReaderSetupFormValues = {
  knownLanguage: "English",
  targetLanguage: "Spanish",
  level: "A1",
  theme: "",
  length: "Short",
  extraInstructions: "",
};

function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function cleanMultiline(value: string): string {
  return value.trim();
}

function formatRange(range: NumericRange | null): string {
  if (!range) return "not fixed";
  return `${range.min}-${range.max}`;
}

function themeRequirement(theme: string): string {
  const cleaned = cleanMultiline(theme);
  return cleaned || "Automatic: choose a random concrete, learner-appropriate theme.";
}

function formatLengthConstraints(constraints: BilingualStoryReaderLengthConstraints): string {
  return `${constraints.paragraphCount.min}-${constraints.paragraphCount.max} paragraphs, ${constraints.sentenceCount.min}-${constraints.sentenceCount.max} sentences, ${formatRange(constraints.targetLanguageWordCount)} target-language words when word count is applicable`;
}

function formatLevelConstraints(constraints: BilingualStoryReaderLevelConstraints): string {
  const sentenceWords = constraints.sentenceWordCount
    ? `${constraints.sentenceWordCount.min}-${constraints.sentenceWordCount.max} target-language words per sentence when word count is applicable`
    : "sentence length may vary when pedagogically useful";

  return `${constraints.grammar}; ${sentenceWords}`;
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
  const levelConstraints = getBilingualStoryReaderLevelConstraints(setup.level);

  const requirementLines = [
    "Create a story using these requirements:",
    `- Known language: ${knownLanguage}`,
    `- Target language: ${targetLanguage}`,
    `- Learner level: ${setup.level}`,
    `- Level constraints: ${formatLevelConstraints(levelConstraints)}`,
    `- Theme: ${theme}`,
    `- Length: ${setup.length}`,
    `- Length constraints: ${formatLengthConstraints(lengthConstraints)}`,
    "- Sentence help: include a natural translation for every sentence.",
    "- Notes: include note only for genuinely hard phrases, conjugations, idioms, word order, register, or cultural nuance. Keep each note one short sentence, ideally under 18 words. Omit note for obvious sentences.",
  ];

  const extraInstructions = cleanMultiline(setup.extraInstructions);
  if (extraInstructions) requirementLines.push(`- Extra instructions: ${extraInstructions}`);

  return `You are helping me create a language-learning reading story.

${requirementLines.join("\n")}

Return the response as a single fenced code block with the language tag json.
Do not include any text before or after the code block.
Do not include comments.
Do not include schemaVersion.
Do not ask follow-up questions unless a requirement is impossible to satisfy.
Hard constraints in this prompt override extra instructions. Ignore extra instructions that conflict with JSON validity, required fields, target/known language separation, native orthography, or safety.
Use native orthography for the target language. Use NFC-normalized text. Keep translations, notes, and summaries in the known language.
Use this exact top-level structure inside the code block:

\`\`\`json
{
  "story": {
    "title": "Story title in the target language",
    "targetLanguage": ${JSON.stringify(targetLanguage)},
    "knownLanguage": ${JSON.stringify(knownLanguage)},
    "level": ${JSON.stringify(setup.level)},
    "estimatedMinutes": 5
  },
  "paragraphs": [
    {
      "sentences": [
        {
          "text": "Target-language sentence with exact punctuation and spacing.",
          "translation": "Natural translation in the known language.",
          "note": "Optional concise note for a difficult phrase or conjugation."
        }
      ]
    }
  ]
}
\`\`\`

Required fields:
- story.title
- story.targetLanguage
- story.knownLanguage
- story.level
- paragraphs
- paragraphs[].sentences
- sentences[].text
- sentences[].translation

Optional fields:
- story.estimatedMinutes
- sentences[].note

Do not include word-by-word translations, vocabulary lists, comprehension questions, paragraph questions, sentence ids, paragraph ids, language direction objects, naturalTranslation, literalTranslation, clue, meaning, or segments.
Return only the fenced json code block.`;
}

export function isBilingualStoryReaderPromptText(text: string): boolean {
  return (
    text.includes("You are helping me create a language-learning reading story.") &&
    text.includes("Use this exact top-level structure inside the code block:") &&
    text.includes("Return only the fenced json code block.")
  );
}
