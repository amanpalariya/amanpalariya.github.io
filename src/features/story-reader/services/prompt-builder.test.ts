import { describe, expect, it } from "vitest";
import {
  buildStoryReaderPrompt,
  DEFAULT_STORY_READER_SETUP,
  isStoryReaderSetupComplete,
} from "./prompt-builder";

const completeSetup = {
  ...DEFAULT_STORY_READER_SETUP,
  knownLanguage: "English",
  targetLanguage: "Spanish",
  theme: "lost phone at a train station",
};

describe("story reader prompt builder", () => {
  it("requires known language, target language, and theme", () => {
    expect(isStoryReaderSetupComplete(DEFAULT_STORY_READER_SETUP)).toBe(false);
    expect(isStoryReaderSetupComplete(completeSetup)).toBe(true);
  });

  it("expands required fields and short A1 constraints", () => {
    const prompt = buildStoryReaderPrompt(completeSetup);

    expect(prompt).toContain("- Known language: English");
    expect(prompt).toContain("- Target language: Spanish");
    expect(prompt).toContain("- Learner level: A1");
    expect(prompt).toContain("- Length constraints: 2-2 paragraphs, 4-6 sentences");
    expect(prompt).toContain('"sentenceWordCount": { "min": 6, "max": 10 }');
    expect(prompt).toContain('"targetLanguageWordCount": { "min": 80, "max": 120 }');
    expect(prompt).toContain('"schemaVersion": "1.0"');
  });

  it("omits blank optional requirement lines but uses JSON null values", () => {
    const prompt = buildStoryReaderPrompt(completeSetup);
    const requirementSection = prompt.slice(
      prompt.indexOf("Create a story using these requirements:"),
      prompt.indexOf("Return only valid JSON."),
    );

    expect(requirementSection).not.toContain("- Avoid topics:");
    expect(requirementSection).not.toContain("- Vocabulary focus:");
    expect(requirementSection).not.toContain("- Tone:");
    expect(requirementSection).not.toContain("- Extra instructions:");
    expect(prompt).toContain('"avoidTopics": null');
    expect(prompt).toContain('"vocabularyFocus": null');
    expect(prompt).toContain('"tone": null');
    expect(prompt).toContain('"extraInstructions": null');
  });

  it("includes populated optional requirement lines and JSON string values", () => {
    const prompt = buildStoryReaderPrompt({
      ...completeSetup,
      avoidTopics: "violence",
      vocabularyFocus: "train station verbs",
      tone: "light mystery",
      extraInstructions: "Use simple dialogue.",
    });

    expect(prompt).toContain("- Avoid topics: violence");
    expect(prompt).toContain("- Vocabulary focus: train station verbs");
    expect(prompt).toContain("- Tone: light mystery");
    expect(prompt).toContain("- Extra instructions: Use simple dialogue.");
    expect(prompt).toContain('"avoidTopics": "violence"');
    expect(prompt).toContain('"vocabularyFocus": "train station verbs"');
  });

  it("expands medium, B2, and literal translation rules", () => {
    const prompt = buildStoryReaderPrompt({
      ...completeSetup,
      length: "Medium",
      level: "B2",
      translationStyle: "Literal",
    });

    expect(prompt).toContain("- Length constraints: 3-4 paragraphs, 8-12 sentences");
    expect(prompt).toContain('"targetLanguageWordCount": { "min": 180, "max": 260 }');
    expect(prompt).toContain('"sentenceWordCount": { "min": 12, "max": 24 }');
    expect(prompt).toContain("The UI will show literal translation first.");
    expect(prompt).toContain('"translationStyle": "literal"');
  });

  it("is deterministic for the same setup state", () => {
    expect(buildStoryReaderPrompt(completeSetup)).toBe(buildStoryReaderPrompt(completeSetup));
  });
});

