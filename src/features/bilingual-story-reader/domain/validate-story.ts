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

export interface RenderableSentence {
  id: string;
  text: string;
  translation: string;
  note: string | null;
}

export interface RenderableParagraph {
  id: string;
  sentences: RenderableSentence[];
}

export interface RenderableStory {
  story: {
    title: string;
    targetLanguage: string;
    knownLanguage: string;
    level: string;
    theme: string;
    estimatedMinutes: number | null;
  };
  paragraphs: RenderableParagraph[];
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

function validateParagraphs(
  value: unknown,
  errors: BilingualStoryReaderValidationError[],
): RenderableParagraph[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push({
      path: "paragraphs",
      message: "paragraphs must be a non-empty array.",
    });
    return [];
  }

  return value.map((paragraph, paragraphIndex) => {
    const paragraphPath = `paragraphs[${paragraphIndex}]`;
    const paragraphId = `p${paragraphIndex + 1}`;

    if (!isRecord(paragraph)) {
      errors.push({ path: paragraphPath, message: `${paragraphPath} must be an object.` });
      return { id: paragraphId, sentences: [] };
    }

    const sentenceValues = paragraph.sentences;
    if (!Array.isArray(sentenceValues) || sentenceValues.length === 0) {
      errors.push({
        path: `${paragraphPath}.sentences`,
        message: `${paragraphPath}.sentences must be a non-empty array.`,
      });
      return { id: paragraphId, sentences: [] };
    }

    const sentences = sentenceValues.map((sentence, sentenceIndex) => {
      const sentencePath = `${paragraphPath}.sentences[${sentenceIndex}]`;
      const sentenceId = `${paragraphId}-s${sentenceIndex + 1}`;

      if (!isRecord(sentence)) {
        errors.push({
          path: sentencePath,
          message: `${sentencePath} must be an object.`,
        });
        return {
          id: sentenceId,
          text: "",
          translation: "",
          note: null,
        };
      }

      const text = stringValue(sentence.text);
      const translation = stringValue(sentence.translation);

      if (!text) {
        errors.push({
          path: `${sentencePath}.text`,
          message: `${sentencePath}.text is required.`,
        });
      }

      if (!translation) {
        errors.push({
          path: `${sentencePath}.translation`,
          message: `${sentencePath}.translation is required.`,
        });
      }

      return {
        id: sentenceId,
        text: text ?? "",
        translation: translation ?? "",
        note: stringValue(sentence.note),
      };
    });

    return {
      id: paragraphId,
      sentences,
    };
  });
}

export function validateBilingualStoryReaderSchema(value: unknown): StoryValidationResult {
  const errors: BilingualStoryReaderValidationError[] = [];
  const warnings: BilingualStoryReaderWarning[] = [];

  if (!isRecord(value)) {
    return {
      ok: false,
      errors: [{ path: "$", message: "Story response must be an object." }],
      warnings,
    };
  }

  if (!isRecord(value.story)) {
    errors.push({ path: "story", message: "story must be an object." });
  }

  const story = isRecord(value.story) ? value.story : {};
  const title = stringValue(story.title);
  const targetLanguage = stringValue(story.targetLanguage);
  const knownLanguage = stringValue(story.knownLanguage);
  const level = stringValue(story.level);
  const theme = stringValue(story.theme);

  if (!title) errors.push({ path: "story.title", message: "story.title is required." });
  if (!targetLanguage) {
    errors.push({
      path: "story.targetLanguage",
      message: "story.targetLanguage is required.",
    });
  }
  if (!knownLanguage) {
    errors.push({
      path: "story.knownLanguage",
      message: "story.knownLanguage is required.",
    });
  }
  if (!level) errors.push({ path: "story.level", message: "story.level is required." });
  if (!theme) errors.push({ path: "story.theme", message: "story.theme is required." });

  const paragraphs = validateParagraphs(value.paragraphs, errors);

  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }

  return {
    ok: true,
    warnings,
    value: {
      story: {
        title: title ?? "",
        targetLanguage: targetLanguage ?? "",
        knownLanguage: knownLanguage ?? "",
        level: level ?? "",
        theme: theme ?? "",
        estimatedMinutes: numberValue(story.estimatedMinutes),
      },
      paragraphs,
    },
  };
}
