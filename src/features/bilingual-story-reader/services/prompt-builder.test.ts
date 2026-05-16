import { describe, expect, it } from "vitest";
import {
  buildBilingualStoryReaderPrompt,
  DEFAULT_BILINGUAL_STORY_READER_SETUP,
  isBilingualStoryReaderSetupComplete,
} from "./prompt-builder";

const completeSetup = {
  ...DEFAULT_BILINGUAL_STORY_READER_SETUP,
  knownLanguage: "English",
  targetLanguage: "Spanish",
  theme: "lost phone at a train station",
};

describe("bilingual story reader prompt builder", () => {
  it("requires only known language and target language", () => {
    expect(isBilingualStoryReaderSetupComplete(DEFAULT_BILINGUAL_STORY_READER_SETUP)).toBe(true);
    expect(
      isBilingualStoryReaderSetupComplete({
        ...DEFAULT_BILINGUAL_STORY_READER_SETUP,
        targetLanguage: "",
      }),
    ).toBe(false);
    expect(isBilingualStoryReaderSetupComplete(completeSetup)).toBe(true);
  });

  it("expands required fields and short A1 constraints", () => {
    const prompt = buildBilingualStoryReaderPrompt(completeSetup);

    expect(prompt).toContain("- Known language: English");
    expect(prompt).toContain("- Target language: Spanish");
    expect(prompt).toContain("- Learner level: A1");
    expect(prompt).toContain("- Length constraints: 2-2 paragraphs, 4-6 sentences");
    expect(prompt).toContain('"sentenceWordCount": { "min": 6, "max": 10 }');
    expect(prompt).toContain('"targetLanguageWordCount": { "min": 80, "max": 120 }');
    expect(prompt).toContain('"schemaVersion": "1.0"');
  });

  it("omits blank extra instructions but keeps theme automatic", () => {
    const prompt = buildBilingualStoryReaderPrompt(completeSetup);
    const requirementSection = prompt.slice(
      prompt.indexOf("Create a story using these requirements:"),
      prompt.indexOf("Return only valid JSON."),
    );

    expect(requirementSection).not.toContain("- Extra instructions:");
    expect(prompt).toContain('"extraInstructions": null');
  });

  it("uses an automatic random theme when theme is blank", () => {
    const prompt = buildBilingualStoryReaderPrompt({
      ...DEFAULT_BILINGUAL_STORY_READER_SETUP,
      theme: "",
    });

    expect(prompt).toContain(
      "- Theme: Automatic: choose a random concrete, learner-appropriate theme.",
    );
    expect(prompt).toContain('"theme": null');
  });

  it("includes populated extra instructions", () => {
    const prompt = buildBilingualStoryReaderPrompt({
      ...completeSetup,
      extraInstructions: "Use simple dialogue.",
    });

    expect(prompt).toContain("- Extra instructions: Use simple dialogue.");
    expect(prompt).toContain('"extraInstructions": "Use simple dialogue."');
  });

  it("expands medium and B2 constraints", () => {
    const prompt = buildBilingualStoryReaderPrompt({
      ...completeSetup,
      length: "Medium",
      level: "B2",
    });

    expect(prompt).toContain("- Length constraints: 3-4 paragraphs, 8-12 sentences");
    expect(prompt).toContain('"targetLanguageWordCount": { "min": 180, "max": 260 }');
    expect(prompt).toContain('"sentenceWordCount": { "min": 12, "max": 24 }');
    expect(prompt).toContain("include naturalTranslation for every sentence");
  });

  it("is deterministic for the same setup state", () => {
    expect(buildBilingualStoryReaderPrompt(completeSetup)).toBe(buildBilingualStoryReaderPrompt(completeSetup));
  });
});
