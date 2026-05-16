export type JsonCleanupWarningCode =
  | "markdown-fence-removed"
  | "surrounding-text-removed";

export interface JsonCleanupWarning {
  code: JsonCleanupWarningCode;
  message: string;
}

export interface JsonCleanupResult {
  cleanedText: string;
  warnings: JsonCleanupWarning[];
}

export interface JsonSyntaxErrorDetail {
  message: string;
  line: number | null;
  column: number | null;
}

export type JsonParseResult =
  | {
      ok: true;
      value: unknown;
      cleanedText: string;
      warnings: JsonCleanupWarning[];
    }
  | {
      ok: false;
      errors: JsonSyntaxErrorDetail[];
      cleanedText: string;
      warnings: JsonCleanupWarning[];
    };

function stripMarkdownFence(text: string): JsonCleanupResult {
  const fencedJsonMatch = text.match(/^```(?:json|JSON)?\s*([\s\S]*?)\s*```$/);

  if (!fencedJsonMatch) {
    return { cleanedText: text, warnings: [] };
  }

  return {
    cleanedText: fencedJsonMatch[1].trim(),
    warnings: [
      {
        code: "markdown-fence-removed",
        message: "Removed Markdown code fence around the JSON.",
      },
    ],
  };
}

function findFirstJsonObjectBounds(text: string): { start: number; end: number } | null {
  const start = text.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let isInsideString = false;
  let isEscaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (isInsideString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === '"') {
        isInsideString = false;
      }
      continue;
    }

    if (char === '"') {
      isInsideString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return { start, end: index + 1 };
      }
    }
  }

  return null;
}

function trimSurroundingText(text: string): JsonCleanupResult {
  const bounds = findFirstJsonObjectBounds(text);
  if (!bounds) return { cleanedText: text, warnings: [] };

  const before = text.slice(0, bounds.start).trim();
  const after = text.slice(bounds.end).trim();
  if (!before && !after) return { cleanedText: text, warnings: [] };

  return {
    cleanedText: text.slice(bounds.start, bounds.end).trim(),
    warnings: [
      {
        code: "surrounding-text-removed",
        message: "Removed surrounding text and kept the first JSON object.",
      },
    ],
  };
}

export function cleanupExternalAiOutput(rawText: string): JsonCleanupResult {
  const warnings: JsonCleanupWarning[] = [];
  let cleanedText = rawText.trim();

  const fencedResult = stripMarkdownFence(cleanedText);
  cleanedText = fencedResult.cleanedText;
  warnings.push(...fencedResult.warnings);

  const objectResult = trimSurroundingText(cleanedText);
  cleanedText = objectResult.cleanedText;
  warnings.push(...objectResult.warnings);

  return { cleanedText, warnings };
}

function getLineColumnForIndex(text: string, index: number): Pick<
  JsonSyntaxErrorDetail,
  "line" | "column"
> {
  let line = 1;
  let column = 1;

  for (let cursor = 0; cursor < index && cursor < text.length; cursor += 1) {
    if (text[cursor] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function parseSyntaxError(error: unknown, text: string): JsonSyntaxErrorDetail {
  const fallbackMessage = error instanceof Error ? error.message : "Invalid JSON.";
  const positionMatch = fallbackMessage.match(/position (\d+)/i);
  if (!positionMatch) {
    return { message: fallbackMessage, line: null, column: null };
  }

  const position = Number.parseInt(positionMatch[1], 10);
  return {
    message: fallbackMessage,
    ...getLineColumnForIndex(text, position),
  };
}

export function parseJsonWithCleanup(rawText: string): JsonParseResult {
  const cleanupResult = cleanupExternalAiOutput(rawText);

  if (!cleanupResult.cleanedText) {
    return {
      ok: false,
      cleanedText: cleanupResult.cleanedText,
      warnings: cleanupResult.warnings,
      errors: [
        {
          message: "Paste a JSON object before rendering the story.",
          line: null,
          column: null,
        },
      ],
    };
  }

  try {
    return {
      ok: true,
      value: JSON.parse(cleanupResult.cleanedText) as unknown,
      cleanedText: cleanupResult.cleanedText,
      warnings: cleanupResult.warnings,
    };
  } catch (error) {
    return {
      ok: false,
      cleanedText: cleanupResult.cleanedText,
      warnings: cleanupResult.warnings,
      errors: [parseSyntaxError(error, cleanupResult.cleanedText)],
    };
  }
}

