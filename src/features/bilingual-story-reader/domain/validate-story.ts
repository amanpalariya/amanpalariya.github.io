import {
  BILINGUAL_STORY_READER_DIRECTIONS,
  BILINGUAL_STORY_READER_QUESTION_DIFFICULTIES,
  BILINGUAL_STORY_READER_SCHEMA_VERSION,
  BILINGUAL_STORY_READER_SEGMENT_KINDS,
} from "./constants";

export type BilingualStoryReaderWarningCategory =
  | "cleanup"
  | "structural"
  | "request-mismatch"
  | "quality";

export interface BilingualStoryReaderValidationError {
  path: string;
  message: string;
}

export interface BilingualStoryReaderWarning {
  category: BilingualStoryReaderWarningCategory;
  code: string;
  path: string;
  message: string;
}

export interface RenderableLanguage {
  code: string | null;
  name: string;
  direction: "ltr" | "rtl" | "auto";
}

export interface RenderableSegment {
  text: string;
  kind: "word" | "phrase" | null;
  lemma: string | null;
  partOfSpeech: string | null;
  meaning: string | null;
  hint: string | null;
  romanization: string | null;
  pronunciation: string | null;
  scriptNote: string | null;
  wordBreakdown: string | null;
  morphology: Record<string, unknown> | null;
}

export interface RenderableSentence {
  id: string;
  text: string;
  clue: string | null;
  meaning: string | null;
  naturalTranslation: string;
  literalTranslation: string | null;
  grammarNotes: unknown[];
  usageNotes: unknown[];
  commonMistakes: unknown[];
  wordByWord: unknown[];
  segments: RenderableSegment[];
  hasValidSegments: boolean;
}

export interface RenderableParagraph {
  id: string;
  summary: string | null;
  keyPoint: string | null;
  question: string | null;
  answer: string | null;
  sentences: RenderableSentence[];
}

export interface RenderableStory {
  schemaVersion: typeof BILINGUAL_STORY_READER_SCHEMA_VERSION;
  story: {
    id: string | null;
    title: string;
    targetLanguage: RenderableLanguage;
    knownLanguage: RenderableLanguage;
    level: string;
    theme: string | null;
    summary: string | null;
    estimatedMinutes: number | null;
  };
  paragraphs: RenderableParagraph[];
  vocabularyReview: unknown[];
  comprehensionQuestions: unknown[];
  qualityNotes: string[];
}

export type StoryValidationResult =
  | {
      ok: true;
      value: RenderableStory;
      warnings: BilingualStoryReaderWarning[];
    }
  | {
      ok: false;
      errors: BilingualStoryReaderValidationError[];
      warnings: BilingualStoryReaderWarning[];
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function objectArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeNfc(value: string): string {
  return value.normalize("NFC");
}

function validateDirection(
  language: Record<string, unknown>,
  path: string,
  warnings: BilingualStoryReaderWarning[],
  errors: BilingualStoryReaderValidationError[],
): "ltr" | "rtl" | "auto" {
  const direction = language.direction;
  if (direction === undefined) {
    warnings.push({
      category: "structural",
      code: "missing-direction",
      path,
      message: `${path} is missing direction; using auto.`,
    });
    return "auto";
  }

  if (
    typeof direction === "string" &&
    BILINGUAL_STORY_READER_DIRECTIONS.includes(
      direction as (typeof BILINGUAL_STORY_READER_DIRECTIONS)[number],
    )
  ) {
    return direction as "ltr" | "rtl" | "auto";
  }

  errors.push({
    path,
    message: `${path} direction must be ltr, rtl, or auto.`,
  });
  return "auto";
}

function validateLanguage(
  value: unknown,
  path: string,
  warnings: BilingualStoryReaderWarning[],
  errors: BilingualStoryReaderValidationError[],
): RenderableLanguage {
  if (!isRecord(value)) {
    errors.push({ path, message: `${path} must be an object.` });
    errors.push({ path: `${path}.name`, message: `${path}.name is required.` });
    return { code: null, name: "", direction: "auto" };
  }

  const name = stringValue(value.name);
  if (!name) {
    errors.push({ path: `${path}.name`, message: `${path}.name is required.` });
  }

  return {
    code: stringValue(value.code),
    name: name ?? "",
    direction: validateDirection(value, `${path}.direction`, warnings, errors),
  };
}

function validateSegments(
  value: unknown,
  sentenceText: string,
  path: string,
  warnings: BilingualStoryReaderWarning[],
): { segments: RenderableSegment[]; hasValidSegments: boolean } {
  if (value === undefined) return { segments: [], hasValidSegments: false };
  if (!Array.isArray(value)) {
    warnings.push({
      category: "structural",
      code: "invalid-segments",
      path,
      message: `${path} must be an array; vocabulary highlights are disabled for this sentence.`,
    });
    return { segments: [], hasValidSegments: false };
  }

  const segments: RenderableSegment[] = [];
  let hasInvalidSegment = false;

  value.forEach((segment, index) => {
    const segmentPath = `${path}[${index}]`;
    if (!isRecord(segment)) {
      hasInvalidSegment = true;
      return;
    }

    const text = stringValue(segment.text);
    if (!text) {
      hasInvalidSegment = true;
      return;
    }

    const kind = segment.kind;
    const normalizedKind =
      typeof kind === "string" &&
      BILINGUAL_STORY_READER_SEGMENT_KINDS.includes(
        kind as (typeof BILINGUAL_STORY_READER_SEGMENT_KINDS)[number],
      )
        ? (kind as "word" | "phrase")
        : null;

    if (kind !== undefined && normalizedKind === null) {
      hasInvalidSegment = true;
      warnings.push({
        category: "structural",
        code: "invalid-segment-kind",
        path: `${segmentPath}.kind`,
        message: `${segmentPath}.kind is invalid; vocabulary highlights are disabled for this sentence.`,
      });
    }

    segments.push({
      text,
      kind: normalizedKind,
      lemma: stringValue(segment.lemma),
      partOfSpeech: stringValue(segment.partOfSpeech),
      meaning: stringValue(segment.meaning),
      hint: stringValue(segment.hint),
      romanization: stringValue(segment.romanization),
      pronunciation: stringValue(segment.pronunciation),
      scriptNote: stringValue(segment.scriptNote),
      wordBreakdown: stringValue(segment.wordBreakdown),
      morphology: isRecord(segment.morphology) ? segment.morphology : null,
    });
  });

  const joinedText = segments.map((segment) => segment.text).join("");
  if (hasInvalidSegment || normalizeNfc(joinedText) !== normalizeNfc(sentenceText)) {
    warnings.push({
      category: "structural",
      code: "segment-text-mismatch",
      path,
      message: `${path} does not exactly match sentence.text; vocabulary highlights are disabled for this sentence.`,
    });
    return { segments: [], hasValidSegments: false };
  }

  return { segments, hasValidSegments: segments.length > 0 };
}

function validateParagraphs(
  value: unknown,
  warnings: BilingualStoryReaderWarning[],
  errors: BilingualStoryReaderValidationError[],
): RenderableParagraph[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push({
      path: "paragraphs",
      message: "paragraphs must be a non-empty array.",
    });
    return [];
  }

  const paragraphIds = new Set<string>();
  const sentenceIds = new Set<string>();

  return value.map((paragraph, paragraphIndex) => {
    const paragraphPath = `paragraphs[${paragraphIndex}]`;
    if (!isRecord(paragraph)) {
      errors.push({ path: paragraphPath, message: `${paragraphPath} must be an object.` });
      return {
        id: "",
        summary: null,
        keyPoint: null,
        question: null,
        answer: null,
        sentences: [],
      };
    }

    const paragraphId = stringValue(paragraph.id);
    if (!paragraphId) {
      errors.push({
        path: `${paragraphPath}.id`,
        message: `${paragraphPath}.id is required.`,
      });
    } else if (paragraphIds.has(paragraphId)) {
      errors.push({
        path: `${paragraphPath}.id`,
        message: `Duplicate paragraph id "${paragraphId}".`,
      });
    } else {
      paragraphIds.add(paragraphId);
    }

    const sentenceValues = paragraph.sentences;
    if (!Array.isArray(sentenceValues) || sentenceValues.length === 0) {
      errors.push({
        path: `${paragraphPath}.sentences`,
        message: `${paragraphPath}.sentences must be a non-empty array.`,
      });
    }

    const sentences = objectArray(sentenceValues).map((sentence, sentenceIndex) => {
      const sentencePath = `${paragraphPath}.sentences[${sentenceIndex}]`;
      if (!isRecord(sentence)) {
        errors.push({
          path: sentencePath,
          message: `${sentencePath} must be an object.`,
        });
        return {
          id: "",
          text: "",
          clue: null,
          meaning: null,
          naturalTranslation: "",
          literalTranslation: null,
          grammarNotes: [],
          usageNotes: [],
          commonMistakes: [],
          wordByWord: [],
          segments: [],
          hasValidSegments: false,
        };
      }

      const sentenceId = stringValue(sentence.id);
      const text = stringValue(sentence.text);
      const naturalTranslation = stringValue(sentence.naturalTranslation);

      if (!sentenceId) {
        errors.push({
          path: `${sentencePath}.id`,
          message: `${sentencePath}.id is required.`,
        });
      } else if (sentenceIds.has(sentenceId)) {
        errors.push({
          path: `${sentencePath}.id`,
          message: `Duplicate sentence id "${sentenceId}".`,
        });
      } else {
        sentenceIds.add(sentenceId);
      }

      if (!text) {
        errors.push({
          path: `${sentencePath}.text`,
          message: `${sentencePath}.text is required.`,
        });
      }

      if (!naturalTranslation) {
        errors.push({
          path: `${sentencePath}.naturalTranslation`,
          message: `${sentencePath}.naturalTranslation is required.`,
        });
      }

      const segmentResult = validateSegments(
        sentence.segments,
        text ?? "",
        `${sentencePath}.segments`,
        warnings,
      );

      return {
        id: sentenceId ?? "",
        text: text ?? "",
        clue: stringValue(sentence.clue),
        meaning: stringValue(sentence.meaning),
        naturalTranslation: naturalTranslation ?? "",
        literalTranslation: stringValue(sentence.literalTranslation),
        grammarNotes: objectArray(sentence.grammarNotes),
        usageNotes: objectArray(sentence.usageNotes),
        commonMistakes: objectArray(sentence.commonMistakes),
        wordByWord: objectArray(sentence.wordByWord),
        segments: segmentResult.segments,
        hasValidSegments: segmentResult.hasValidSegments,
      };
    });

    return {
      id: paragraphId ?? "",
      summary: stringValue(paragraph.summary),
      keyPoint: stringValue(paragraph.keyPoint),
      question: stringValue(paragraph.question),
      answer: stringValue(paragraph.answer),
      sentences,
    };
  });
}

function validateComprehensionQuestions(
  value: unknown,
  errors: BilingualStoryReaderValidationError[],
): unknown[] {
  const questions = objectArray(value);
  questions.forEach((question, index) => {
    if (!isRecord(question)) return;
    const difficulty = question.difficulty;
    if (
      difficulty !== undefined &&
      (!(
        typeof difficulty === "string" &&
        BILINGUAL_STORY_READER_QUESTION_DIFFICULTIES.includes(
          difficulty as (typeof BILINGUAL_STORY_READER_QUESTION_DIFFICULTIES)[number],
        )
      ))
    ) {
      errors.push({
        path: `comprehensionQuestions[${index}].difficulty`,
        message:
          "comprehensionQuestions[].difficulty must be direct-recall, inference, or vocabulary-in-context.",
      });
    }
  });
  return questions;
}

export function validateBilingualStoryReaderSchema(value: unknown): StoryValidationResult {
  const errors: BilingualStoryReaderValidationError[] = [];
  const warnings: BilingualStoryReaderWarning[] = [];

  if (!isRecord(value)) {
    return {
      ok: false,
      errors: [{ path: "$", message: "Story JSON must be an object." }],
      warnings,
    };
  }

  if (value.schemaVersion !== BILINGUAL_STORY_READER_SCHEMA_VERSION) {
    errors.push({
      path: "schemaVersion",
      message: `schemaVersion must be exactly ${BILINGUAL_STORY_READER_SCHEMA_VERSION}.`,
    });
  }

  if (!isRecord(value.story)) {
    errors.push({ path: "story", message: "story must be an object." });
  }

  const story = isRecord(value.story) ? value.story : {};
  const title = stringValue(story.title);
  const level = stringValue(story.level);

  if (!title) errors.push({ path: "story.title", message: "story.title is required." });
  if (!level) errors.push({ path: "story.level", message: "story.level is required." });

  const targetLanguage = validateLanguage(
    story.targetLanguage,
    "story.targetLanguage",
    warnings,
    errors,
  );
  const knownLanguage = validateLanguage(
    story.knownLanguage,
    "story.knownLanguage",
    warnings,
    errors,
  );
  const paragraphs = validateParagraphs(value.paragraphs, warnings, errors);
  const comprehensionQuestions = validateComprehensionQuestions(
    value.comprehensionQuestions,
    errors,
  );

  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }

  return {
    ok: true,
    warnings,
    value: {
      schemaVersion: BILINGUAL_STORY_READER_SCHEMA_VERSION,
      story: {
        id: stringValue(story.id),
        title: title ?? "",
        targetLanguage,
        knownLanguage,
        level: level ?? "",
        theme: stringValue(story.theme),
        summary: stringValue(story.summary),
        estimatedMinutes: numberValue(story.estimatedMinutes),
      },
      paragraphs,
      vocabularyReview: objectArray(value.vocabularyReview),
      comprehensionQuestions,
      qualityNotes: objectArray(value.qualityNotes).filter(
        (note): note is string => typeof note === "string",
      ),
    },
  };
}
