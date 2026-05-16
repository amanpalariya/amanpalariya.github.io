import { describe, expect, it } from "vitest";
import { cleanupExternalAiOutput, parseJsonWithCleanup } from "./json-cleanup";

describe("bilingual story reader JSON cleanup", () => {
  it("trims plain JSON without warnings", () => {
    const result = cleanupExternalAiOutput('  { "schemaVersion": "1.0" }  ');

    expect(result.cleanedText).toBe('{ "schemaVersion": "1.0" }');
    expect(result.warnings).toEqual([]);
  });

  it("extracts JSON from Markdown fences", () => {
    const result = cleanupExternalAiOutput('```json\n{ "schemaVersion": "1.0" }\n```');

    expect(result.cleanedText).toBe('{ "schemaVersion": "1.0" }');
    expect(result.warnings).toEqual([
      {
        code: "markdown-fence-removed",
        message: "Removed Markdown code fence around the JSON.",
      },
    ]);
  });

  it("extracts a JSON object surrounded by prose", () => {
    const result = cleanupExternalAiOutput(
      'Here is the story:\n{ "story": { "title": "Hola" } }\nHope this helps.',
    );

    expect(result.cleanedText).toBe('{ "story": { "title": "Hola" } }');
    expect(result.warnings[0]?.code).toBe("surrounding-text-removed");
  });

  it("does not stop scanning when braces appear inside quoted strings", () => {
    const result = cleanupExternalAiOutput(
      'Intro { "text": "A string with { braces } inside", "done": true } outro',
    );

    expect(result.cleanedText).toBe(
      '{ "text": "A string with { braces } inside", "done": true }',
    );
  });

  it("parses cleaned JSON and returns cleanup warnings", () => {
    const result = parseJsonWithCleanup('```json\n{ "schemaVersion": "1.0" }\n```');

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected successful parse");
    expect(result.value).toEqual({ schemaVersion: "1.0" });
    expect(result.warnings[0]?.code).toBe("markdown-fence-removed");
  });

  it("returns a useful empty input error", () => {
    const result = parseJsonWithCleanup(" \n ");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected parse failure");
    expect(result.errors[0]).toEqual({
      message: "Paste a JSON object before rendering the story.",
      line: null,
      column: null,
    });
  });

  it("returns line and column details when the runtime exposes a JSON position", () => {
    const result = parseJsonWithCleanup('{\n  "schemaVersion": "1.0"\n  "story": {}\n}');

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected parse failure");
    expect(result.errors[0]?.message).toContain("JSON");
    expect(result.errors[0]?.line).toBe(3);
    expect(result.errors[0]?.column).toBe(3);
  });
});
