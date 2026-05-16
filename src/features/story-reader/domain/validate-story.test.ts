import { describe, expect, it } from "vitest";
import { validateStoryReaderSchema } from "./validate-story";

function validStory(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: "1.0",
    story: {
      title: "El tren",
      targetLanguage: { name: "Spanish", direction: "ltr" },
      knownLanguage: { name: "English", direction: "ltr" },
      level: "A1",
    },
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            text: "Lina entra.",
            naturalTranslation: "Lina enters.",
            segments: [
              { text: "Lina " },
              { text: "entra", kind: "word", meaning: "enters" },
              { text: "." },
            ],
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("validateStoryReaderSchema", () => {
  it("normalizes a valid story into a renderable view model", () => {
    const result = validateStoryReaderSchema(validStory());

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected validation success");
    expect(result.value.story.title).toBe("El tren");
    expect(result.value.paragraphs[0]?.sentences[0]?.hasValidSegments).toBe(true);
    expect(result.value.vocabularyReview).toEqual([]);
    expect(result.value.comprehensionQuestions).toEqual([]);
  });

  it("rejects unsupported schema versions", () => {
    const result = validateStoryReaderSchema(validStory({ schemaVersion: "2.0" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected validation failure");
    expect(result.errors).toContainEqual({
      path: "schemaVersion",
      message: "schemaVersion must be exactly 1.0.",
    });
  });

  it("rejects missing required story fields", () => {
    const result = validateStoryReaderSchema({
      schemaVersion: "1.0",
      story: {},
      paragraphs: [],
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected validation failure");
    expect(result.errors.map((error) => error.path)).toEqual(
      expect.arrayContaining([
        "story.title",
        "story.level",
        "story.targetLanguage.name",
        "story.knownLanguage.name",
        "paragraphs",
      ]),
    );
  });

  it("rejects duplicate paragraph and sentence ids", () => {
    const result = validateStoryReaderSchema(
      validStory({
        paragraphs: [
          {
            id: "p1",
            sentences: [
              { id: "s1", text: "Uno.", naturalTranslation: "One." },
              { id: "s1", text: "Dos.", naturalTranslation: "Two." },
            ],
          },
          {
            id: "p1",
            sentences: [{ id: "s3", text: "Tres.", naturalTranslation: "Three." }],
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected validation failure");
    expect(result.errors.map((error) => error.message)).toEqual(
      expect.arrayContaining([
        'Duplicate sentence id "s1".',
        'Duplicate paragraph id "p1".',
      ]),
    );
  });

  it("defaults missing directions to auto with warnings", () => {
    const result = validateStoryReaderSchema(
      validStory({
        story: {
          title: "El tren",
          targetLanguage: { name: "Spanish" },
          knownLanguage: { name: "English" },
          level: "A1",
        },
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected validation success");
    expect(result.value.story.targetLanguage.direction).toBe("auto");
    expect(result.value.story.knownLanguage.direction).toBe("auto");
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "missing-direction",
      "missing-direction",
    ]);
  });

  it("rejects invalid enum values", () => {
    const result = validateStoryReaderSchema(
      validStory({
        story: {
          title: "El tren",
          targetLanguage: { name: "Spanish", direction: "sideways" },
          knownLanguage: { name: "English", direction: "ltr" },
          level: "A1",
        },
        comprehensionQuestions: [{ difficulty: "unknown" }],
      }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected validation failure");
    expect(result.errors.map((error) => error.path)).toEqual(
      expect.arrayContaining([
        "story.targetLanguage.direction",
        "comprehensionQuestions[0].difficulty",
      ]),
    );
  });

  it("disables segment highlights for text mismatches without blocking rendering", () => {
    const result = validateStoryReaderSchema(
      validStory({
        paragraphs: [
          {
            id: "p1",
            sentences: [
              {
                id: "s1",
                text: "Lina entra.",
                naturalTranslation: "Lina enters.",
                segments: [{ text: "Lina entra!" }],
              },
            ],
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected validation success");
    expect(result.value.paragraphs[0]?.sentences[0]?.hasValidSegments).toBe(false);
    expect(result.warnings[0]?.code).toBe("segment-text-mismatch");
  });

  it("accepts NFC-equivalent segment text", () => {
    const result = validateStoryReaderSchema(
      validStory({
        paragraphs: [
          {
            id: "p1",
            sentences: [
              {
                id: "s1",
                text: "café",
                naturalTranslation: "cafe",
                segments: [{ text: "cafe\u0301" }],
              },
            ],
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected validation success");
    expect(result.value.paragraphs[0]?.sentences[0]?.hasValidSegments).toBe(true);
  });
});

