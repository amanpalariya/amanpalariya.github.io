import { describe, expect, it } from "vitest";
import { validateBilingualStoryReaderSchema } from "./validate-story";

function validStory(overrides: Record<string, unknown> = {}) {
  return {
    story: {
      title: "El tren",
      targetLanguage: "Spanish",
      knownLanguage: "English",
      level: "A1",
      theme: "train station",
      estimatedMinutes: 3,
    },
    paragraphs: [
      {
        sentences: [
          {
            text: "Lina entra.",
            translation: "Lina enters.",
            note: "Entra is present tense.",
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("validateBilingualStoryReaderSchema", () => {
  it("normalizes a valid story into a renderable view model", () => {
    const result = validateBilingualStoryReaderSchema(validStory());

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected validation success");
    expect(result.value.story.title).toBe("El tren");
    expect(result.value.story.targetLanguage).toBe("Spanish");
    expect(result.value.story.knownLanguage).toBe("English");
    expect(result.value.story.level).toBe("A1");
    expect(result.value.story.theme).toBe("train station");
    expect(result.value.paragraphs[0]?.id).toBe("p1");
    expect(result.value.paragraphs[0]?.sentences[0]).toMatchObject({
      id: "p1-s1",
      text: "Lina entra.",
      translation: "Lina enters.",
      note: "Entra is present tense.",
    });
  });

  it("rejects missing required story fields", () => {
    const result = validateBilingualStoryReaderSchema({
      story: {},
      paragraphs: [],
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected validation failure");
    expect(result.errors.map((error) => error.path)).toEqual(
      expect.arrayContaining([
        "story.title",
        "story.level",
        "story.theme",
        "story.targetLanguage",
        "story.knownLanguage",
        "paragraphs",
      ]),
    );
  });

  it("rejects paragraph objects without sentences", () => {
    const result = validateBilingualStoryReaderSchema(
      validStory({
        paragraphs: [{}],
      }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected validation failure");
    expect(result.errors).toContainEqual({
      path: "paragraphs[0].sentences",
      message: "paragraphs[0].sentences must be a non-empty array.",
    });
  });

  it("rejects missing sentence text and translation", () => {
    const result = validateBilingualStoryReaderSchema(
      validStory({
        paragraphs: [
          {
            sentences: [{ text: "" }, "not an object"],
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected validation failure");
    expect(result.errors.map((error) => error.path)).toEqual(
      expect.arrayContaining([
        "paragraphs[0].sentences[0].text",
        "paragraphs[0].sentences[0].translation",
        "paragraphs[0].sentences[1]",
      ]),
    );
  });

  it("allows notes to be omitted", () => {
    const result = validateBilingualStoryReaderSchema(
      validStory({
        paragraphs: [
          {
            sentences: [
              {
                text: "Lina mira.",
                translation: "Lina looks.",
              },
            ],
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected validation success");
    expect(result.value.paragraphs[0]?.sentences[0]?.note).toBeNull();
  });

  it("ignores unknown extra fields", () => {
    const result = validateBilingualStoryReaderSchema(
      validStory({
        extraTopLevel: "ignored",
        paragraphs: [
          {
            extraParagraph: "ignored",
            sentences: [
              {
                text: "Lina entra.",
                translation: "Lina enters.",
                extraSentence: "ignored",
              },
            ],
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected validation success");
    expect(result.value.paragraphs[0]?.id).toBe("p1");
    expect(result.value.paragraphs[0]?.sentences[0]).toMatchObject({
      id: "p1-s1",
      translation: "Lina enters.",
    });
    expect("extraTopLevel" in result.value).toBe(false);
    expect("extraParagraph" in result.value.paragraphs[0]!).toBe(false);
    expect("extraSentence" in result.value.paragraphs[0]!.sentences[0]!).toBe(false);
  });
});
