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
import { resolveBackgroundRenderer } from "./backgrounds";
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
import { createAutoCoverSvgDataUrl } from "./auto-cover-svg";

function toCanvasTextAlign(align: "center" | "left" | "right"): CanvasTextAlign {
  if (align === "center") return "center";
  return align === "right" ? "right" : "left";
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

export function createAutoCoverRasterDataUrl(input: AutoCoverInput): string {
  if (typeof document === "undefined") return createAutoCoverSvgDataUrl(input);

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

  const canvas = document.createElement("canvas");
  canvas.width = coverWidth;
  canvas.height = coverHeight;
  const context = canvas.getContext("2d");

  if (!context) return createAutoCoverSvgDataUrl(input);

  backgroundRenderer.drawCanvasBackground({
    context,
    metrics,
    width: coverWidth,
    height: coverHeight,
  });

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

  if (!input.hideText) {
    const titleStartY = computeTitleStartY(titleLayout, titleLines.length);
    context.textAlign = toCanvasTextAlign(titleLayout.align);
    context.textBaseline = "middle";
    context.fillStyle = textPalette.titleColor;
    context.strokeStyle = textPalette.strokeColor;
    context.lineWidth = COVER_TEXT_STROKE_WIDTH * metrics.unitScale;
    context.lineJoin = "round";
    context.font = `700 ${titleLayout.fontSize}px Inter, Segoe UI, Roboto, Arial, sans-serif`;

    for (let index = 0; index < titleLines.length; index += 1) {
      context.strokeText(
        titleLines[index],
        titleLayout.x,
        titleStartY + index * titleLayout.lineHeight,
      );
      context.fillText(
        titleLines[index],
        titleLayout.x,
        titleStartY + index * titleLayout.lineHeight,
      );
    }

    if (authorLines.length > 0) {
      const authorStartY = computeAuthorStartY(
        authorLayout,
        titleLayout,
        titleStartY,
        titleLines.length,
      );
      context.textAlign = toCanvasTextAlign(authorLayout.align);
      context.fillStyle = textPalette.authorColor;
      context.font = `500 ${authorLayout.fontSize}px Inter, Segoe UI, Roboto, Arial, sans-serif`;

      for (let index = 0; index < authorLines.length; index += 1) {
        context.strokeText(
          authorLines[index],
          authorLayout.x,
          authorStartY + index * authorLayout.lineHeight,
        );
        context.fillText(
          authorLines[index],
          authorLayout.x,
          authorStartY + index * authorLayout.lineHeight,
        );
      }
    }
  }

  return canvas.toDataURL("image/png");
}
