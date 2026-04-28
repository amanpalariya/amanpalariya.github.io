import { DEFAULT_BOOK_TITLE } from "../../constants";
import type { CoverTextColorMode } from "../../types";
import {
  AUTO_COVER_LAYOUT_HEIGHT,
  AUTO_COVER_LAYOUT_WIDTH,
  COVER_TEXT_BOUND_LEFT,
  COVER_TEXT_BOUND_RIGHT,
  COVER_TEXT_STROKE_WIDTH,
  DEFAULT_AUTHOR_LAYOUT,
  DEFAULT_TEXT_LAYOUT,
} from "./constants";
import type { AutoCoverInput, CoverCanvasMetrics } from "./core-types";
import { resolveTextPalette } from "./color-utils";
import { resolveBackgroundRenderer } from "./templates";
import {
  applyTextStyle,
  computeAuthorStartY,
  computeTitleStartY,
  resolveAvailableTextWidth,
  resolveWrapCharLimit,
  scaleAuthorLayout,
  scaleAuthorLayoutToCanvas,
  scaleTextLayout,
  scaleTextLayoutToCanvas,
  wrapTextLines,
} from "./text-utils";

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSvgTextAnchor(
  align: "center" | "left" | "right",
): "middle" | "start" | "end" {
  if (align === "center") return "middle";
  return align === "right" ? "end" : "start";
}

function resolveCoverCanvasMetrics(
  coverWidth: number,
  coverHeight: number,
): CoverCanvasMetrics {
  const scaleX = coverWidth / AUTO_COVER_LAYOUT_WIDTH;
  const scaleY = coverHeight / AUTO_COVER_LAYOUT_HEIGHT;
  return {
    scaleX,
    scaleY,
    unitScale: Math.min(scaleX, scaleY),
  };
}

function resolveTextPaletteForInput(
  textColorMode: CoverTextColorMode,
  gradientStart: string,
  gradientEnd: string,
) {
  return resolveTextPalette(textColorMode, gradientStart, gradientEnd);
}

export function createAutoCoverSvgDataUrl(input: AutoCoverInput): string {
  const backgroundRenderer = resolveBackgroundRenderer(input.backgroundId);
  const adaptiveTextSeed = backgroundRenderer.resolveAdaptiveTextSeed();
  const textPalette = resolveTextPaletteForInput(
    input.textColorMode,
    adaptiveTextSeed.startColor,
    adaptiveTextSeed.endColor,
  );

  const coverWidth = Math.max(800, Math.round(input.size.width));
  const coverHeight = Math.max(1000, Math.round(input.size.height));
  const metrics = resolveCoverCanvasMetrics(coverWidth, coverHeight);

  const styledLayouts = applyTextStyle(
    scaleTextLayout(DEFAULT_TEXT_LAYOUT, input.textScalePercent),
    scaleAuthorLayout(DEFAULT_AUTHOR_LAYOUT, input.textScalePercent),
    input.textPosition,
  );

  const titleLayout = scaleTextLayoutToCanvas(styledLayouts.titleLayout, metrics);
  const authorLayout = scaleAuthorLayoutToCanvas(styledLayouts.authorLayout, metrics);

  const textLeftBound = Math.round(COVER_TEXT_BOUND_LEFT * metrics.scaleX);
  const textRightBound = Math.round(COVER_TEXT_BOUND_RIGHT * metrics.scaleX);

  const titleWrapLimit = resolveWrapCharLimit(
    titleLayout.maxCharsPerLine,
    titleLayout.fontSize,
    resolveAvailableTextWidth(
      titleLayout.align,
      titleLayout.x,
      textLeftBound,
      textRightBound,
    ),
  );

  const authorWrapLimit = resolveWrapCharLimit(
    authorLayout.maxCharsPerLine,
    authorLayout.fontSize,
    resolveAvailableTextWidth(
      authorLayout.align,
      authorLayout.x,
      textLeftBound,
      textRightBound,
    ),
  );

  const titleLines = wrapTextLines(input.title || DEFAULT_BOOK_TITLE, titleWrapLimit, 5);
  const authorLines = wrapTextLines(input.author || "", authorWrapLimit, 3);

  const titleStartY = computeTitleStartY(titleLayout, titleLines.length);
  const titleAnchor = toSvgTextAnchor(titleLayout.align);
  const titleTspans = titleLines
    .map(
      (line, index) =>
        `<tspan x="${titleLayout.x}" y="${titleStartY + index * titleLayout.lineHeight}">${escapeXmlText(line)}</tspan>`,
    )
    .join("");

  const authorStartY = computeAuthorStartY(
    authorLayout,
    titleLayout,
    titleStartY,
    titleLines.length,
  );
  const authorAnchor = toSvgTextAnchor(authorLayout.align);
  const authorTspans = authorLines
    .map(
      (line, index) =>
        `<tspan x="${authorLayout.x}" y="${authorStartY + index * authorLayout.lineHeight}">${escapeXmlText(line)}</tspan>`,
    )
    .join("");

  const textStrokeWidth = COVER_TEXT_STROKE_WIDTH * metrics.unitScale;
  const backgroundSvg = backgroundRenderer.renderSvgBackground({
    metrics,
    width: coverWidth,
    height: coverHeight,
  });

  const titleTextSvg = input.hideText
    ? ""
    : `<text fill="${textPalette.titleColor}" stroke="${textPalette.strokeColor}" stroke-width="${textStrokeWidth}" paint-order="stroke fill" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${titleLayout.fontSize}" font-weight="700" text-anchor="${titleAnchor}">${titleTspans}</text>`;
  const authorTextSvg =
    input.hideText || !authorTspans
      ? ""
      : `<text fill="${textPalette.authorColor}" stroke="${textPalette.strokeColor}" stroke-width="${textStrokeWidth}" paint-order="stroke fill" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${authorLayout.fontSize}" font-weight="500" text-anchor="${authorAnchor}">${authorTspans}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${coverWidth}" height="${coverHeight}" viewBox="0 0 ${coverWidth} ${coverHeight}" role="img" aria-label="Book cover">${backgroundSvg}${titleTextSvg}${authorTextSvg}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
