import { DEFAULT_BOOK_TITLE } from "../../constants";
import type { CoverTextColorMode } from "../../types";
import {
  AUTO_COVER_LAYOUT_HEIGHT,
  AUTO_COVER_LAYOUT_WIDTH,
  COVER_FRAME_INSET,
  COVER_FRAME_RADIUS,
  COVER_TEXT_AUTHOR_COLOR,
  COVER_TEXT_BOUND_LEFT,
  COVER_TEXT_BOUND_RIGHT,
  COVER_TEXT_STROKE_COLOR,
  COVER_TEXT_STROKE_WIDTH,
  COVER_TEXT_TITLE_COLOR,
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
  COVER_TEMPLATE_OPTIONS,
  resolveCoverSizePreset,
  resolveCoverTemplateDefaults,
  resolveTemplateSpec,
} from "./template-specs";
import { resolveTemplateRenderer } from "./templates";
import { drawRoundedRectPath } from "./templates/template-utils";
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

export type { AutoCoverInput, AutoCoverOptions, AutoCoverRendererId, CoverHtmlOptions };
export {
  COVER_SIZE_PRESET_OPTIONS,
  COVER_TEMPLATE_OPTIONS,
  resolveCoverSizePreset,
  resolveCoverTemplateDefaults,
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

function createAutoCoverSvgDataUrl(input: AutoCoverInput): string {
  const template = resolveTemplateSpec(input.templateId);
  const textPalette = resolveTextPaletteForInput(
    input.textColorMode,
    template.gradientStart,
    template.gradientEnd,
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

  const titleLines = wrapTextLines(input.title || DEFAULT_BOOK_TITLE, titleWrapLimit, 4);
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

  const frameInset = Math.round(COVER_FRAME_INSET * metrics.unitScale);
  const frameRadius = Math.round(COVER_FRAME_RADIUS * metrics.unitScale);
  const frameX = frameInset;
  const frameY = frameInset;
  const frameWidth = Math.max(0, coverWidth - frameInset * 2);
  const frameHeight = Math.max(0, coverHeight - frameInset * 2);
  const textStrokeWidth = COVER_TEXT_STROKE_WIDTH * metrics.unitScale;

  const templateRenderer = resolveTemplateRenderer(template.id);
  const decorationSvg = templateRenderer.renderSvgDecoration({
    template,
    metrics,
    width: coverWidth,
    height: coverHeight,
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${coverWidth}" height="${coverHeight}" viewBox="0 0 ${coverWidth} ${coverHeight}" role="img" aria-label="Book cover"><defs><linearGradient id="coverGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${template.gradientStart}"/><stop offset="100%" stop-color="${template.gradientEnd}"/></linearGradient></defs><rect width="${coverWidth}" height="${coverHeight}" fill="url(#coverGradient)"/>${decorationSvg}<rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="${frameHeight}" rx="${frameRadius}" fill="none" stroke="${template.frameStroke}" stroke-width="${4 * metrics.unitScale}"/><text fill="${textPalette.titleColor}" stroke="${textPalette.strokeColor}" stroke-width="${textStrokeWidth}" paint-order="stroke fill" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${titleLayout.fontSize}" font-weight="700" text-anchor="${titleAnchor}">${titleTspans}</text>${authorTspans ? `<text fill="${textPalette.authorColor}" stroke="${textPalette.strokeColor}" stroke-width="${textStrokeWidth}" paint-order="stroke fill" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${authorLayout.fontSize}" font-weight="500" text-anchor="${authorAnchor}">${authorTspans}</text>` : ""}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createAutoCoverRasterDataUrl(input: AutoCoverInput): string {
  if (typeof document === "undefined") return createAutoCoverSvgDataUrl(input);

  const template = resolveTemplateSpec(input.templateId);
  const textPalette = resolveTextPaletteForInput(
    input.textColorMode,
    template.gradientStart,
    template.gradientEnd,
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

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, template.gradientStart);
  gradient.addColorStop(1, template.gradientEnd);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  resolveTemplateRenderer(template.id).drawCanvasDecoration({
    context,
    template,
    metrics,
    width: coverWidth,
    height: coverHeight,
  });

  const frameInset = COVER_FRAME_INSET * metrics.unitScale;
  const frameRadius = COVER_FRAME_RADIUS * metrics.unitScale;
  context.strokeStyle = template.frameStroke;
  context.lineWidth = 4 * metrics.unitScale;
  drawRoundedRectPath(
    context,
    frameInset,
    frameInset,
    Math.max(0, coverWidth - frameInset * 2),
    Math.max(0, coverHeight - frameInset * 2),
    frameRadius,
  );
  context.stroke();

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

  const titleLines = wrapTextLines(input.title || DEFAULT_BOOK_TITLE, titleWrapLimit, 4);
  const authorLines = wrapTextLines(input.author || "", authorWrapLimit, 3);

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

  return canvas.toDataURL("image/png");
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
  options: AutoCoverOptions,
  preferredRenderer: AutoCoverRendererId = DEFAULT_AUTO_COVER_RENDERER,
): string {
  const safeTitle = title || DEFAULT_BOOK_TITLE;
  const coverSize = resolveCoverSizePreset(options.sizePresetId);
  const coverSrc = createAutoCoverDataUrl(
    {
      title,
      author,
      templateId: options.templateId,
      size: {
        width: coverSize.width,
        height: coverSize.height,
      },
      textScalePercent: options.textScalePercent,
      textPosition: options.textPosition,
      textColorMode: options.textColorMode,
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

  const titleLines = wrapTextLines(input.title || DEFAULT_BOOK_TITLE, titleWrapLimit, 4);
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
    const finalSrc = options.includeTextOnCustomCover
      ? createCustomCoverSvgDataUrl(
          {
            title,
            author,
            templateId: options.templateId,
            size: { width: coverSize.width, height: coverSize.height },
            textScalePercent: options.textScalePercent,
            textPosition: options.textPosition,
            textColorMode: options.textColorMode,
          },
          customImageSrc,
        )
      : customImageSrc;

    return `<figure><img src="${finalSrc}" alt="Cover for ${escapeXmlText(safeTitle)}" /></figure>`;
  }

  return createAutoCoverHtml(title, author, options, preferredRenderer);
}
