import type {
  CoverAuthorLayout,
  CoverCanvasMetrics,
  CoverTextLayout,
} from "./core-types";
import {
  AUTHOR_FONT_SIZE_BOOST,
  BASE_TEXT_SCALE_MULTIPLIER,
  COVER_TEXT_BOUND_LEFT,
  COVER_TEXT_BOUND_RIGHT,
  COVER_TEXT_STYLE_ORDER,
  TITLE_FONT_SIZE_BOOST,
} from "./constants";
import type { CoverTextPosition } from "../../types";

export function wrapTextLines(
  value: string,
  maxCharsPerLine: number,
  maxLines: number,
): string[] {
  const trimmed = value.trim();
  if (!trimmed || maxLines <= 0) return [];

  const limit = Math.max(4, maxCharsPerLine);
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const splitWord = (word: string): string[] => {
    const chars = Array.from(word);
    const chunks: string[] = [];
    for (let index = 0; index < chars.length; index += limit) {
      chunks.push(chars.slice(index, index + limit).join(""));
    }
    return chunks.length > 0 ? chunks : [word];
  };

  const segments = words.flatMap((word) => {
    const parts = splitWord(word);
    return parts.map((part, index) => ({ text: part, withSpace: index === 0 }));
  });

  const lines: string[] = [];
  let currentLine = "";
  let consumedSegments = 0;

  const pushLine = () => {
    if (!currentLine) return;
    lines.push(currentLine);
    currentLine = "";
  };

  for (const segment of segments) {
    const candidate = currentLine
      ? `${currentLine}${segment.withSpace ? " " : ""}${segment.text}`
      : segment.text;

    if (candidate.length <= limit) {
      currentLine = candidate;
      consumedSegments += 1;
      continue;
    }

    pushLine();
    if (lines.length >= maxLines) break;

    currentLine = segment.text;
    consumedSegments += 1;
  }

  if (currentLine && lines.length < maxLines) lines.push(currentLine);
  if (lines.length > maxLines) lines.length = maxLines;

  if (consumedSegments < segments.length && lines.length > 0) {
    const lastLineIndex = lines.length - 1;
    let truncated = lines[lastLineIndex].replace(/[\s.]+$/g, "");
    while (truncated.length > 1 && `${truncated}…`.length > limit) {
      truncated = truncated.slice(0, -1).replace(/[\s.]+$/g, "");
    }
    lines[lastLineIndex] = `${truncated}…`;
  }

  return lines;
}

export function resolveTextScalePercent(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.max(70, Math.min(180, Math.round(value)));
}

export function scaleTextLayout(layout: CoverTextLayout, textScalePercent: number): CoverTextLayout {
  const textScale =
    (resolveTextScalePercent(textScalePercent) / 100) * BASE_TEXT_SCALE_MULTIPLIER;
  const finalScale = textScale * TITLE_FONT_SIZE_BOOST;
  return {
    ...layout,
    fontSize: Math.max(18, Math.round(layout.fontSize * finalScale)),
    lineHeight: Math.max(24, Math.round(layout.lineHeight * finalScale)),
    maxCharsPerLine: Math.max(
      8,
      Math.round(layout.maxCharsPerLine / Math.max(1, finalScale * 0.92)),
    ),
  };
}

export function scaleAuthorLayout(
  layout: CoverAuthorLayout,
  textScalePercent: number,
): CoverAuthorLayout {
  const textScale =
    (resolveTextScalePercent(textScalePercent) / 100) * BASE_TEXT_SCALE_MULTIPLIER;
  const finalScale = textScale * AUTHOR_FONT_SIZE_BOOST;
  return {
    ...layout,
    fontSize: Math.max(14, Math.round(layout.fontSize * finalScale)),
    lineHeight: Math.max(20, Math.round(layout.lineHeight * finalScale)),
    maxCharsPerLine: Math.max(
      10,
      Math.round(layout.maxCharsPerLine / Math.max(1, finalScale * 0.9)),
    ),
  };
}

export function applyTextStyle(
  titleLayout: CoverTextLayout,
  authorLayout: CoverAuthorLayout,
  textPosition: CoverTextPosition,
): { titleLayout: CoverTextLayout; authorLayout: CoverAuthorLayout } {
  const styleId = COVER_TEXT_STYLE_ORDER.includes(textPosition)
    ? textPosition
    : "style_1";
  const rightX = COVER_TEXT_BOUND_RIGHT;
  const leftX = COVER_TEXT_BOUND_LEFT;
  const centerX = 600;

  if (styleId === "style_1") return { titleLayout, authorLayout };

  if (styleId === "style_2") {
    return {
      titleLayout: { ...titleLayout, align: "left", x: leftX },
      authorLayout: { ...authorLayout, align: "left", x: leftX, mode: "after-title" },
    };
  }

  if (styleId === "style_3") {
    return {
      titleLayout: { ...titleLayout, align: "right", x: rightX },
      authorLayout: { ...authorLayout, align: "right", x: rightX, mode: "after-title" },
    };
  }

  if (styleId === "style_4") {
    return {
      titleLayout: { ...titleLayout, align: "center", x: centerX, baseY: titleLayout.baseY + 240 },
      authorLayout: {
        ...authorLayout,
        align: "center",
        x: centerX,
        mode: "fixed",
        baseY: Math.max(200, titleLayout.baseY - titleLayout.lineHeight * 2.2),
      },
    };
  }

  if (styleId === "style_5") {
    return {
      titleLayout: { ...titleLayout, align: "left", x: leftX, baseY: titleLayout.baseY + 260 },
      authorLayout: {
        ...authorLayout,
        align: "left",
        x: leftX,
        mode: "fixed",
        baseY: Math.max(190, titleLayout.baseY - titleLayout.lineHeight * 2.2),
      },
    };
  }

  return {
    titleLayout: { ...titleLayout, align: "center", x: centerX, baseY: 1180 },
    authorLayout: { ...authorLayout, align: "center", x: centerX, mode: "after-title", baseY: 62 },
  };
}

export function resolveAvailableTextWidth(
  align: "center" | "left" | "right",
  x: number,
  leftBound: number,
  rightBound: number,
): number {
  if (align === "center") {
    const halfWidth = Math.max(0, Math.min(x - leftBound, rightBound - x));
    return halfWidth * 2;
  }

  if (align === "right") return Math.max(0, x - leftBound);
  return Math.max(0, rightBound - x);
}

export function resolveWrapCharLimit(
  maxCharsPerLine: number,
  fontSize: number,
  availableWidth: number,
): number {
  const averageCharWidth = Math.max(1, fontSize * 0.46);
  const visualMaxChars = Math.max(
    4,
    Math.round((availableWidth / averageCharWidth) * 1.15),
  );
  return Math.max(4, Math.min(maxCharsPerLine, visualMaxChars));
}

export function scaleTextLayoutToCanvas(
  layout: CoverTextLayout,
  metrics: CoverCanvasMetrics,
): CoverTextLayout {
  const textScale = metrics.unitScale;
  return {
    ...layout,
    x: Math.round(layout.x * metrics.scaleX),
    baseY: Math.round(layout.baseY * metrics.scaleY),
    fontSize: Math.max(14, Math.round(layout.fontSize * textScale)),
    lineHeight: Math.max(18, Math.round(layout.lineHeight * textScale)),
  };
}

export function scaleAuthorLayoutToCanvas(
  layout: CoverAuthorLayout,
  metrics: CoverCanvasMetrics,
): CoverAuthorLayout {
  const textScale = metrics.unitScale;
  return {
    ...layout,
    x: Math.round(layout.x * metrics.scaleX),
    baseY: Math.round(layout.baseY * metrics.scaleY),
    fontSize: Math.max(12, Math.round(layout.fontSize * textScale)),
    lineHeight: Math.max(16, Math.round(layout.lineHeight * textScale)),
  };
}

export function computeTitleStartY(layout: CoverTextLayout, lineCount: number): number {
  return layout.baseY - Math.max(0, lineCount - 1) * (layout.lineHeight / 2);
}

export function computeAuthorStartY(
  layout: CoverAuthorLayout,
  titleLayout: CoverTextLayout,
  titleStartY: number,
  titleLineCount: number,
): number {
  if (layout.mode === "fixed") return layout.baseY;
  return titleStartY + titleLineCount * titleLayout.lineHeight + layout.baseY;
}
