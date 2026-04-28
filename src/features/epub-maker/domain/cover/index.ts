import { DEFAULT_BOOK_TITLE } from "../../constants";
import type { CoverTextColorMode } from "../../types";
import {
  AUTO_COVER_LAYOUT_HEIGHT,
  AUTO_COVER_LAYOUT_WIDTH,
  COVER_TEXT_BOUND_LEFT,
  COVER_TEXT_BOUND_RIGHT,
  COVER_TEXT_STROKE_WIDTH,
  DEFAULT_AUTHOR_LAYOUT,
  DEFAULT_AUTO_COVER_RENDERER,
  DEFAULT_TEXT_LAYOUT,
} from "./constants";
import type {
  AutoCoverInput,
  AutoCoverOptions,
  AutoCoverRendererId,
  CoverCanvasMetrics,
  CoverHtmlOptions,
} from "./core-types";
import { resolveTextPalette } from "./color-utils";
import {
  COVER_SIZE_PRESET_OPTIONS,
  COVER_BACKGROUND_OPTIONS,
  resolveCoverSizePreset,
} from "./background-specs";
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
import { createAutoCoverRasterDataUrl } from "./auto-cover-raster";

export type { AutoCoverInput, AutoCoverOptions, AutoCoverRendererId, CoverHtmlOptions };
export {
  COVER_SIZE_PRESET_OPTIONS,
  COVER_BACKGROUND_OPTIONS,
  resolveCoverSizePreset,
};

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSvgTextAnchor(align: "center" | "left" | "right"): "middle" | "start" | "end" {
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

const autoCoverRenderers: Record<AutoCoverRendererId, (input: AutoCoverInput) => string> = {
  "raster-png": createAutoCoverRasterDataUrl,
  svg: createAutoCoverSvgDataUrl,
};

function resolveRendererOrder(preferredRenderer: AutoCoverRendererId): AutoCoverRendererId[] {
  return preferredRenderer === "svg" ? ["svg", "raster-png"] : ["raster-png", "svg"];
}

export function createAutoCoverDataUrl(
  input: AutoCoverInput,
  preferredRenderer: AutoCoverRendererId = DEFAULT_AUTO_COVER_RENDERER,
): string {
  const rendererOrder = resolveRendererOrder(preferredRenderer);

  for (const rendererId of rendererOrder) {
    const renderer = autoCoverRenderers[rendererId];
    try {
      return renderer(input);
    } catch {
      // try next renderer strategy
    }
  }

  return createAutoCoverSvgDataUrl(input);
}

export function createAutoCoverHtml(
  title: string,
  author: string,
  options: AutoCoverOptions & { hideCoverText?: boolean },
  preferredRenderer: AutoCoverRendererId = DEFAULT_AUTO_COVER_RENDERER,
): string {
  const safeTitle = title || DEFAULT_BOOK_TITLE;
  const coverSize = resolveCoverSizePreset(options.sizePresetId);
  const coverSrc = createAutoCoverDataUrl(
    {
      title,
      author,
      backgroundId: options.backgroundId,
      size: {
        width: coverSize.width,
        height: coverSize.height,
      },
      textScalePercent: options.textScalePercent,
      textPosition: options.textPosition,
      textColorMode: options.textColorMode,
      hideText: options.hideCoverText,
    },
    preferredRenderer,
  );

  return `<figure><img src="${coverSrc}" alt="Cover for ${escapeXmlText(safeTitle)}" /></figure>`;
}

function extractFirstImageSrc(html: string): string | null {
  const match = html.match(/<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  return match?.[1] ?? null;
}

function createCustomCoverSvgDataUrl(input: AutoCoverInput, customImageSrc: string): string {
  const textPalette = resolveTextPaletteForInput(input.textColorMode, "#2b2b2b", "#171717");
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
    resolveAvailableTextWidth(titleLayout.align, titleLayout.x, textLeftBound, textRightBound),
  );
  const authorWrapLimit = resolveWrapCharLimit(
    authorLayout.maxCharsPerLine,
    authorLayout.fontSize,
    resolveAvailableTextWidth(authorLayout.align, authorLayout.x, textLeftBound, textRightBound),
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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${coverWidth}" height="${coverHeight}" viewBox="0 0 ${coverWidth} ${coverHeight}" role="img" aria-label="Book cover"><image href="${escapeXmlText(customImageSrc)}" x="0" y="0" width="${coverWidth}" height="${coverHeight}" preserveAspectRatio="xMidYMid slice"/><rect width="${coverWidth}" height="${coverHeight}" fill="rgba(0,0,0,0.2)"/><text fill="${textPalette.titleColor}" stroke="${textPalette.strokeColor}" stroke-width="${textStrokeWidth}" paint-order="stroke fill" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${titleLayout.fontSize}" font-weight="700" text-anchor="${titleAnchor}">${titleTspans}</text>${authorTspans ? `<text fill="${textPalette.authorColor}" stroke="${textPalette.strokeColor}" stroke-width="${textStrokeWidth}" paint-order="stroke fill" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${authorLayout.fontSize}" font-weight="500" text-anchor="${authorAnchor}">${authorTspans}</text>` : ""}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createCoverHtml(
  title: string,
  author: string,
  options: CoverHtmlOptions,
  preferredRenderer: AutoCoverRendererId = DEFAULT_AUTO_COVER_RENDERER,
): string {
  const safeTitle = title || DEFAULT_BOOK_TITLE;
  const coverSize = resolveCoverSizePreset(options.sizePresetId);
  const customImageSrc = options.customCoverHtml
    ? extractFirstImageSrc(options.customCoverHtml)
    : null;

  if (customImageSrc) {
    const finalSrc = options.hideCoverText
      ? customImageSrc
      : createCustomCoverSvgDataUrl(
          {
            title,
            author,
            backgroundId: options.backgroundId,
            size: { width: coverSize.width, height: coverSize.height },
            textScalePercent: options.textScalePercent,
            textPosition: options.textPosition,
            textColorMode: options.textColorMode,
            hideText: options.hideCoverText,
          },
          customImageSrc,
        );

    return `<figure><img src="${finalSrc}" alt="Cover for ${escapeXmlText(safeTitle)}" /></figure>`;
  }

  return createAutoCoverHtml(title, author, options, preferredRenderer);
}
