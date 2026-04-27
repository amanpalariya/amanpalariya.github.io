import { DEFAULT_BOOK_TITLE } from "../constants";
import type {
  BaseCoverTemplateId,
  CoverSizePresetId,
  CoverSizePresetOption,
  CoverTextColorMode,
  CoverTextPosition,
  CoverTemplateId,
  CoverTemplateOption,
} from "../types";

export type AutoCoverRendererId = "raster-png" | "svg";

export interface AutoCoverInput {
  title: string;
  author: string;
  templateId: BaseCoverTemplateId;
  size: {
    width: number;
    height: number;
  };
  textScalePercent: number;
  textPosition: CoverTextPosition;
  textColorMode: CoverTextColorMode;
}

export interface AutoCoverOptions {
  templateId: BaseCoverTemplateId;
  sizePresetId: CoverSizePresetId;
  textScalePercent: number;
  textPosition: CoverTextPosition;
  textColorMode: CoverTextColorMode;
}

export interface CoverHtmlOptions extends AutoCoverOptions {
  customCoverHtml?: string | null;
  includeTextOnCustomCover?: boolean;
}

type AutoCoverRenderer = (input: AutoCoverInput) => string;

type CoverTextLayout = {
  align: "center" | "left" | "right";
  x: number;
  baseY: number;
  fontSize: number;
  lineHeight: number;
  maxCharsPerLine: number;
};

type CoverAuthorLayout = {
  align: "center" | "left" | "right";
  x: number;
  mode: "after-title" | "fixed";
  baseY: number;
  fontSize: number;
  lineHeight: number;
  maxCharsPerLine: number;
};

type CoverTemplateSpec = {
  id: BaseCoverTemplateId;
  label: string;
  description: string;
  gradientStart: string;
  gradientEnd: string;
  titleColor: string;
  authorColor: string;
  frameStroke: string;
  accentColor: string;
  titleLayout: CoverTextLayout;
  authorLayout: CoverAuthorLayout;
};

const DEFAULT_AUTO_COVER_RENDERER: AutoCoverRendererId = "raster-png";
const AUTO_COVER_LAYOUT_WIDTH = 1200;
const AUTO_COVER_LAYOUT_HEIGHT = 1800;
const BASE_TEXT_SCALE_MULTIPLIER = 1.35;
const TITLE_FONT_SIZE_BOOST = 1.04;
const AUTHOR_FONT_SIZE_BOOST = 1.22;
const COVER_TEXT_BOUND_LEFT = 130;
const COVER_TEXT_BOUND_RIGHT = 1070;
const COVER_FRAME_INSET = 76;
const COVER_FRAME_RADIUS = 40;
const COVER_TEXT_TITLE_COLOR = "#f5f5f5";
const COVER_TEXT_AUTHOR_COLOR = "#e4e4e4";
const COVER_TEXT_STROKE_COLOR = "rgba(0,0,0,0.42)";
const COVER_TEXT_STROKE_WIDTH = 1.6;
const COVER_TEXT_DARK_TITLE_COLOR = "#171717";
const COVER_TEXT_DARK_AUTHOR_COLOR = "#3f3f3f";
const COVER_TEXT_LIGHT_STROKE_COLOR = "rgba(255,255,255,0.34)";
const COVER_TEXT_STYLE_ORDER: CoverTextPosition[] = [
  "style_1",
  "style_2",
  "style_3",
  "style_4",
  "style_5",
  "style_6",
];
const DEFAULT_TEXT_LAYOUT: CoverTextLayout = {
  align: "center",
  x: 600,
  baseY: 760,
  fontSize: 92,
  lineHeight: 116,
  maxCharsPerLine: 18,
};
const DEFAULT_AUTHOR_LAYOUT: CoverAuthorLayout = {
  align: "center",
  x: 600,
  mode: "after-title",
  baseY: 64,
  fontSize: 48,
  lineHeight: 64,
  maxCharsPerLine: 26,
};

const COVER_SIZE_PRESETS: Record<CoverSizePresetId, CoverSizePresetOption> = {
  kindle_portrait: {
    id: "kindle_portrait",
    label: "Kindle Portrait",
    description: "1600 × 2560 (1:1.6)",
    width: 1600,
    height: 2560,
  },
  trade_portrait: {
    id: "trade_portrait",
    label: "Trade Portrait",
    description: "1536 × 2304 (1:1.5)",
    width: 1536,
    height: 2304,
  },
  square: {
    id: "square",
    label: "Square",
    description: "1800 × 1800 (1:1)",
    width: 1800,
    height: 1800,
  },
  paperback_6x9: {
    id: "paperback_6x9",
    label: "Paperback 6×9",
    description: "1800 × 2700 (2:3)",
    width: 1800,
    height: 2700,
  },
};

const COVER_TEMPLATE_SPECS: Record<BaseCoverTemplateId, CoverTemplateSpec> = {
  classic: {
    id: "classic",
    label: "Monochrome",
    description: "Basic black-on-white with clean editorial balance.",
    gradientStart: "#ffffff",
    gradientEnd: "#f4f4f4",
    titleColor: "#0f0f0f",
    authorColor: "#4f4f4f",
    frameStroke: "rgba(0,0,0,0.28)",
    accentColor: "rgba(0,0,0,0.08)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 620,
      fontSize: 88,
      lineHeight: 108,
      maxCharsPerLine: 20,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 72,
      fontSize: 44,
      lineHeight: 60,
      maxCharsPerLine: 30,
    },
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    description: "Soft glows and cool gradients.",
    gradientStart: "#1b1b3a",
    gradientEnd: "#5a4fcf",
    titleColor: "#f7f7ff",
    authorColor: "#d9d6ff",
    frameStroke: "rgba(230,224,255,0.36)",
    accentColor: "rgba(164,244,255,0.26)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 700,
      fontSize: 92,
      lineHeight: 116,
      maxCharsPerLine: 18,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 60,
      fontSize: 54,
      lineHeight: 72,
      maxCharsPerLine: 24,
    },
  },
  ember: {
    id: "ember",
    label: "Ember",
    description: "Warm contrast with energetic highlights.",
    gradientStart: "#4a1d12",
    gradientEnd: "#b23a24",
    titleColor: "#fff4e8",
    authorColor: "#ffd6b3",
    frameStroke: "rgba(255,228,204,0.34)",
    accentColor: "rgba(255,211,153,0.22)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 760,
      fontSize: 92,
      lineHeight: 116,
      maxCharsPerLine: 18,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 56,
      fontSize: 52,
      lineHeight: 68,
      maxCharsPerLine: 24,
    },
  },
  midnight: {
    id: "midnight",
    label: "Noir",
    description: "White-on-black style with cinematic rings.",
    gradientStart: "#080808",
    gradientEnd: "#1a1a1a",
    titleColor: "#f8f8f8",
    authorColor: "#d2d2d2",
    frameStroke: "rgba(255,255,255,0.24)",
    accentColor: "rgba(255,255,255,0.16)",
    titleLayout: {
      align: "left",
      x: 130,
      baseY: 600,
      fontSize: 96,
      lineHeight: 114,
      maxCharsPerLine: 14,
    },
    authorLayout: {
      align: "left",
      x: 130,
      mode: "fixed",
      baseY: 1510,
      fontSize: 42,
      lineHeight: 56,
      maxCharsPerLine: 26,
    },
  },
  sage: {
    id: "sage",
    label: "Geometric",
    description: "Black-on-ivory with geometric border patterns.",
    gradientStart: "#fffef8",
    gradientEnd: "#f0ede4",
    titleColor: "#141414",
    authorColor: "#4a4a4a",
    frameStroke: "rgba(0,0,0,0.24)",
    accentColor: "rgba(0,0,0,0.14)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 900,
      fontSize: 86,
      lineHeight: 104,
      maxCharsPerLine: 19,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "fixed",
      baseY: 280,
      fontSize: 40,
      lineHeight: 52,
      maxCharsPerLine: 28,
    },
  },
  sunset: {
    id: "sunset",
    label: "Floral",
    description: "Botanical motifs with title in the lower half.",
    gradientStart: "#fcfaf4",
    gradientEnd: "#efe7d8",
    titleColor: "#212121",
    authorColor: "#505050",
    frameStroke: "rgba(0,0,0,0.24)",
    accentColor: "rgba(37,69,53,0.2)",
    titleLayout: {
      align: "left",
      x: 130,
      baseY: 1110,
      fontSize: 84,
      lineHeight: 100,
      maxCharsPerLine: 16,
    },
    authorLayout: {
      align: "left",
      x: 130,
      mode: "fixed",
      baseY: 305,
      fontSize: 40,
      lineHeight: 52,
      maxCharsPerLine: 28,
    },
  },
};

const COVER_TEMPLATE_DEFAULTS: Record<
  BaseCoverTemplateId,
  Pick<AutoCoverOptions, "textScalePercent" | "textColorMode">
> = {
  classic: { textScalePercent: 100, textColorMode: "dark" },
  aurora: { textScalePercent: 100, textColorMode: "light" },
  ember: { textScalePercent: 100, textColorMode: "light" },
  midnight: { textScalePercent: 100, textColorMode: "light" },
  sage: { textScalePercent: 95, textColorMode: "dark" },
  sunset: { textScalePercent: 95, textColorMode: "dark" },
};

export const COVER_TEMPLATE_OPTIONS: CoverTemplateOption[] = Object.values(
  COVER_TEMPLATE_SPECS,
).map((template) => ({
  id: template.id,
  label: template.label,
  description: template.description,
}));

COVER_TEMPLATE_OPTIONS.push({
  id: "custom",
  label: "Custom",
  description: "Created by editing size/text after choosing a template.",
});

export function resolveCoverTemplateDefaults(
  templateId: BaseCoverTemplateId,
): Pick<AutoCoverOptions, "textScalePercent" | "textColorMode"> {
  return COVER_TEMPLATE_DEFAULTS[templateId] ?? COVER_TEMPLATE_DEFAULTS.classic;
}

export const COVER_SIZE_PRESET_OPTIONS: CoverSizePresetOption[] = Object.values(
  COVER_SIZE_PRESETS,
);

export function resolveCoverSizePreset(
  presetId: CoverSizePresetId,
): CoverSizePresetOption {
  return COVER_SIZE_PRESETS[presetId] ?? COVER_SIZE_PRESETS.kindle_portrait;
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapTextLines(
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

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

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

function resolveAvailableTextWidth(
  align: "center" | "left" | "right",
  x: number,
  leftBound: number,
  rightBound: number,
): number {
  if (align === "center") {
    const halfWidth = Math.max(
      0,
      Math.min(x - leftBound, rightBound - x),
    );
    return halfWidth * 2;
  }

  if (align === "right") {
    return Math.max(0, x - leftBound);
  }

  return Math.max(0, rightBound - x);
}

function resolveWrapCharLimit(
  maxCharsPerLine: number,
  fontSize: number,
  availableWidth: number,
): number {
  const averageCharWidth = Math.max(1, fontSize * 0.58);
  const visualMaxChars = Math.max(4, Math.floor(availableWidth / averageCharWidth));
  return Math.max(4, Math.min(maxCharsPerLine, visualMaxChars));
}

function resolveTemplate(templateId: BaseCoverTemplateId): CoverTemplateSpec {
  return COVER_TEMPLATE_SPECS[templateId] ?? COVER_TEMPLATE_SPECS.classic;
}

function resolveTextScalePercent(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.max(70, Math.min(180, Math.round(value)));
}

function scaleTextLayout(layout: CoverTextLayout, textScalePercent: number): CoverTextLayout {
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

function scaleAuthorLayout(
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

type CoverCanvasMetrics = {
  scaleX: number;
  scaleY: number;
  unitScale: number;
};

type CoverResolvedTextPalette = {
  titleColor: string;
  authorColor: string;
  strokeColor: string;
};

function applyTextStyle(
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

  if (styleId === "style_1") {
    return { titleLayout, authorLayout };
  }

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

function scaleTextLayoutToCanvas(
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

function scaleAuthorLayoutToCanvas(
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

function computeTitleStartY(layout: CoverTextLayout, lineCount: number): number {
  return layout.baseY - Math.max(0, lineCount - 1) * (layout.lineHeight / 2);
}

function computeAuthorStartY(
  layout: CoverAuthorLayout,
  titleLayout: CoverTextLayout,
  titleStartY: number,
  titleLineCount: number,
): number {
  if (layout.mode === "fixed") return layout.baseY;
  return titleStartY + titleLineCount * titleLayout.lineHeight + layout.baseY;
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

function clampColorChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map((channel) => clampColorChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function parseHexColor(color: string): { red: number; green: number; blue: number } | null {
  const normalized = color.trim().replace(/^#/, "");
  if (!/^[\da-f]{3}$|^[\da-f]{6}$/i.test(normalized)) return null;
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((chunk) => `${chunk}${chunk}`)
          .join("")
      : normalized;
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  return { red, green, blue };
}

function mixRgb(
  source: { red: number; green: number; blue: number },
  target: { red: number; green: number; blue: number },
  weight: number,
): { red: number; green: number; blue: number } {
  const clampedWeight = Math.max(0, Math.min(1, weight));
  const sourceWeight = 1 - clampedWeight;
  return {
    red: source.red * sourceWeight + target.red * clampedWeight,
    green: source.green * sourceWeight + target.green * clampedWeight,
    blue: source.blue * sourceWeight + target.blue * clampedWeight,
  };
}

function relativeLuminance(color: { red: number; green: number; blue: number }): number {
  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const red = toLinear(color.red);
  const green = toLinear(color.green);
  const blue = toLinear(color.blue);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function resolveAdaptivePalette(
  gradientStart: string,
  gradientEnd: string,
): CoverResolvedTextPalette {
  const start = parseHexColor(gradientStart);
  const end = parseHexColor(gradientEnd);
  if (!start || !end) {
    return {
      titleColor: COVER_TEXT_TITLE_COLOR,
      authorColor: COVER_TEXT_AUTHOR_COLOR,
      strokeColor: COVER_TEXT_STROKE_COLOR,
    };
  }

  const midpoint = mixRgb(start, end, 0.5);
  const isLightBackground = relativeLuminance(midpoint) >= 0.58;
  if (isLightBackground) {
    const title = mixRgb(midpoint, { red: 0, green: 0, blue: 0 }, 0.88);
    const author = mixRgb(midpoint, { red: 0, green: 0, blue: 0 }, 0.72);
    return {
      titleColor: rgbToHex(title.red, title.green, title.blue),
      authorColor: rgbToHex(author.red, author.green, author.blue),
      strokeColor: COVER_TEXT_LIGHT_STROKE_COLOR,
    };
  }

  const title = mixRgb(midpoint, { red: 255, green: 255, blue: 255 }, 0.9);
  const author = mixRgb(midpoint, { red: 255, green: 255, blue: 255 }, 0.76);
  return {
    titleColor: rgbToHex(title.red, title.green, title.blue),
    authorColor: rgbToHex(author.red, author.green, author.blue),
    strokeColor: COVER_TEXT_STROKE_COLOR,
  };
}

function resolveTextPalette(
  textColorMode: CoverTextColorMode,
  gradientStart: string,
  gradientEnd: string,
): CoverResolvedTextPalette {
  if (textColorMode === "light") {
    return {
      titleColor: COVER_TEXT_TITLE_COLOR,
      authorColor: COVER_TEXT_AUTHOR_COLOR,
      strokeColor: COVER_TEXT_STROKE_COLOR,
    };
  }

  if (textColorMode === "dark") {
    return {
      titleColor: COVER_TEXT_DARK_TITLE_COLOR,
      authorColor: COVER_TEXT_DARK_AUTHOR_COLOR,
      strokeColor: COVER_TEXT_LIGHT_STROKE_COLOR,
    };
  }

  return resolveAdaptivePalette(gradientStart, gradientEnd);
}

function createSageSvgDecoration(
  coverWidth: number,
  coverHeight: number,
  unitScale: number,
  accentColor: string,
): string {
  const left = coverWidth * 0.12;
  const right = coverWidth * 0.88;
  const top = coverHeight * 0.1;
  const bottom = coverHeight * 0.9;
  const stepX = Math.max(16, 34 * unitScale);
  const stepY = Math.max(14, 28 * unitScale);
  const centerX = (left + right) / 2;
  const halfWidth = Math.max(1, (right - left) / 2);
  let dots = "";

  for (let row = 0, y = top; y <= bottom; row += 1, y += stepY) {
    const rowOffset = row % 2 === 0 ? 0 : stepX / 2;
    for (let x = left + rowOffset; x <= right; x += stepX) {
      const normY = (y - top) / Math.max(1, bottom - top);
      const normX = Math.abs((x - centerX) / halfWidth);
      const alpha = Math.max(0.075, (1 - normY * 0.68) * (1 - normX * 0.58) * 0.44);
      const radius = Math.max(1.6, 2.6 * unitScale + (1 - normY) * 1.2 * unitScale);
      dots += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(2)}" fill="${accentColor}" opacity="${alpha.toFixed(3)}"/>`;
    }
  }

  return `<g>${dots}</g>`;
}

function createSvgDecoration(template: CoverTemplateSpec): string {
  switch (template.id) {
    case "classic":
      return `<line x1="180" y1="220" x2="1020" y2="220" stroke="${template.accentColor}" stroke-width="2"/><line x1="180" y1="1580" x2="1020" y2="1580" stroke="${template.accentColor}" stroke-width="2"/>`;
    case "aurora":
      return `<circle cx="190" cy="230" r="260" fill="${template.accentColor}"/><circle cx="1030" cy="1500" r="320" fill="${template.accentColor}"/><circle cx="950" cy="330" r="180" fill="rgba(214,173,255,0.18)"/>`;
    case "ember":
      return `<path d="M0,1560 L1200,1180 L1200,1800 L0,1800 Z" fill="${template.accentColor}"/><path d="M0,0 L760,0 L0,760 Z" fill="rgba(255,166,107,0.14)"/>`;
    case "midnight":
      return `<circle cx="980" cy="260" r="148" fill="${template.accentColor}"/><circle cx="1040" cy="228" r="118" fill="rgba(8,8,8,0.9)"/><circle cx="980" cy="260" r="205" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/><circle cx="980" cy="260" r="270" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/><circle cx="240" cy="260" r="8" fill="rgba(255,255,255,0.45)"/><circle cx="350" cy="420" r="5" fill="rgba(255,255,255,0.4)"/><circle cx="860" cy="340" r="6" fill="rgba(255,255,255,0.36)"/><circle cx="1080" cy="470" r="4" fill="rgba(255,255,255,0.42)"/><path d="M0,1460 C220,1360 430,1520 620,1450 C820,1375 980,1470 1200,1380 L1200,1800 L0,1800 Z" fill="rgba(24,24,24,0.3)"/>`;
    case "sage":
      return "";
    case "sunset":
      return `<g stroke="${template.accentColor}" stroke-width="3" fill="none"><path d="M130,230 C230,360 220,560 140,760"/><path d="M1030,1570 C950,1410 950,1190 1060,1030"/></g><g fill="${template.accentColor}"><circle cx="150" cy="250" r="24"/><circle cx="185" cy="220" r="20"/><circle cx="185" cy="280" r="20"/><circle cx="112" cy="220" r="20"/><circle cx="112" cy="280" r="20"/><circle cx="1038" cy="1560" r="22"/><circle cx="1070" cy="1530" r="18"/><circle cx="1070" cy="1590" r="18"/><circle cx="1006" cy="1530" r="18"/><circle cx="1006" cy="1590" r="18"/></g><ellipse cx="220" cy="500" rx="52" ry="24" fill="rgba(37,69,53,0.16)" transform="rotate(-26 220 500)"/><ellipse cx="960" cy="1280" rx="56" ry="25" fill="rgba(37,69,53,0.16)" transform="rotate(28 960 1280)"/>`;
    default:
      return "";
  }
}

function createAutoCoverSvgDataUrl(input: AutoCoverInput): string {
  const template = resolveTemplate(input.templateId);
  const textPalette = resolveTextPalette(
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
  const titleLines = wrapTextLines(
    input.title || DEFAULT_BOOK_TITLE,
    titleWrapLimit,
    4,
  );
  const authorLines = wrapTextLines(
    input.author || "",
    authorWrapLimit,
    3,
  );

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
  const decorationSvg =
    template.id === "sage"
      ? createSageSvgDecoration(
          coverWidth,
          coverHeight,
          metrics.unitScale,
          template.accentColor,
        )
      : `<g transform="scale(${metrics.scaleX} ${metrics.scaleY})">${createSvgDecoration(template)}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${coverWidth}" height="${coverHeight}" viewBox="0 0 ${coverWidth} ${coverHeight}" role="img" aria-label="Book cover"><defs><linearGradient id="coverGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${template.gradientStart}"/><stop offset="100%" stop-color="${template.gradientEnd}"/></linearGradient></defs><rect width="${coverWidth}" height="${coverHeight}" fill="url(#coverGradient)"/>${decorationSvg}<rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="${frameHeight}" rx="${frameRadius}" fill="none" stroke="${template.frameStroke}" stroke-width="${4 * metrics.unitScale}"/><text fill="${textPalette.titleColor}" stroke="${textPalette.strokeColor}" stroke-width="${textStrokeWidth}" paint-order="stroke fill" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${titleLayout.fontSize}" font-weight="700" text-anchor="${titleAnchor}">${titleTspans}</text>${authorTspans ? `<text fill="${textPalette.authorColor}" stroke="${textPalette.strokeColor}" stroke-width="${textStrokeWidth}" paint-order="stroke fill" font-family="Inter, Segoe UI, Roboto, Arial, sans-serif" font-size="${authorLayout.fontSize}" font-weight="500" text-anchor="${authorAnchor}">${authorTspans}</text>` : ""}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function drawRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const clampedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + clampedRadius, y);
  context.lineTo(x + width - clampedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  context.lineTo(x + width, y + height - clampedRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - clampedRadius,
    y + height,
  );
  context.lineTo(x + clampedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  context.lineTo(x, y + clampedRadius);
  context.quadraticCurveTo(x, y, x + clampedRadius, y);
  context.closePath();
}

function drawCanvasDecoration(
  context: CanvasRenderingContext2D,
  template: CoverTemplateSpec,
  metrics: CoverCanvasMetrics,
  width: number,
  height: number,
) {
  context.save();
  const sx = (value: number) => value * metrics.scaleX;
  const sy = (value: number) => value * metrics.scaleY;
  const su = (value: number) => value * metrics.unitScale;

  switch (template.id) {
    case "classic": {
      context.strokeStyle = template.accentColor;
      context.lineWidth = su(2);
      context.beginPath();
      context.moveTo(sx(180), sy(220));
      context.lineTo(sx(1020), sy(220));
      context.moveTo(sx(180), sy(1580));
      context.lineTo(sx(1020), sy(1580));
      context.stroke();

      context.restore();
      return;
    }
    case "aurora": {
      context.fillStyle = template.accentColor;
      context.beginPath();
      context.arc(sx(190), sy(230), su(260), 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(sx(1030), sy(1500), su(320), 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(214,173,255,0.18)";
      context.beginPath();
      context.arc(sx(950), sy(330), su(180), 0, Math.PI * 2);
      context.fill();
      context.restore();
      return;
    }
    case "ember": {
      context.fillStyle = template.accentColor;
      context.beginPath();
      context.moveTo(sx(0), sy(1560));
      context.lineTo(width, sy(1180));
      context.lineTo(width, height);
      context.lineTo(sx(0), height);
      context.closePath();
      context.fill();

      context.fillStyle = "rgba(255,166,107,0.14)";
      context.beginPath();
      context.moveTo(sx(0), sy(0));
      context.lineTo(sx(760), sy(0));
      context.lineTo(sx(0), sy(760));
      context.closePath();
      context.fill();
      context.restore();
      return;
    }
    case "midnight": {
      context.fillStyle = template.accentColor;
      context.beginPath();
      context.arc(sx(980), sy(260), su(148), 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(8,8,8,0.9)";
      context.beginPath();
      context.arc(sx(1040), sy(228), su(118), 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "rgba(255,255,255,0.14)";
      context.lineWidth = su(2);
      context.beginPath();
      context.arc(sx(980), sy(260), su(205), 0, Math.PI * 2);
      context.stroke();

      context.strokeStyle = "rgba(255,255,255,0.08)";
      context.lineWidth = su(1.5);
      context.beginPath();
      context.arc(sx(980), sy(260), su(270), 0, Math.PI * 2);
      context.stroke();

      context.fillStyle = "rgba(255,255,255,0.42)";
      for (const [x, y, r] of [
        [240, 260, 8],
        [350, 420, 5],
        [860, 340, 6],
        [1080, 470, 4],
      ] as const) {
        context.beginPath();
        context.arc(sx(x), sy(y), su(r), 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(24,24,24,0.3)";
      context.beginPath();
      context.moveTo(sx(0), sy(1460));
      context.bezierCurveTo(sx(220), sy(1360), sx(430), sy(1520), sx(620), sy(1450));
      context.bezierCurveTo(sx(820), sy(1375), sx(980), sy(1470), width, sy(1380));
      context.lineTo(width, height);
      context.lineTo(sx(0), height);
      context.closePath();
      context.fill();
      context.restore();
      return;
    }
    case "sage": {
      const left = width * 0.12;
      const right = width * 0.88;
      const top = height * 0.1;
      const bottom = height * 0.9;
      const stepX = Math.max(16, 34 * metrics.unitScale);
      const stepY = Math.max(14, 28 * metrics.unitScale);
      const centerX = (left + right) / 2;
      const halfWidth = Math.max(1, (right - left) / 2);

      context.fillStyle = template.accentColor;
      for (let row = 0, y = top; y <= bottom; row += 1, y += stepY) {
        const rowOffset = row % 2 === 0 ? 0 : stepX / 2;
        for (let x = left + rowOffset; x <= right; x += stepX) {
          const normY = (y - top) / Math.max(1, bottom - top);
          const normX = Math.abs((x - centerX) / halfWidth);
          const alpha = Math.max(
            0.075,
            (1 - normY * 0.68) * (1 - normX * 0.58) * 0.44,
          );
          const radius = Math.max(
            1.6,
            2.6 * metrics.unitScale + (1 - normY) * 1.2 * metrics.unitScale,
          );
          context.globalAlpha = alpha;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.globalAlpha = 1;

      context.globalAlpha = 1;

      context.restore();
      return;
    }
    case "sunset": {
      context.strokeStyle = template.accentColor;
      context.lineWidth = su(3);
      context.beginPath();
      context.moveTo(sx(130), sy(230));
      context.bezierCurveTo(sx(230), sy(360), sx(220), sy(560), sx(140), sy(760));
      context.moveTo(sx(1030), sy(1570));
      context.bezierCurveTo(sx(950), sy(1410), sx(950), sy(1190), sx(1060), sy(1030));
      context.stroke();

      context.fillStyle = template.accentColor;
      const drawFlowerCluster = (
        centerX: number,
        centerY: number,
        centerRadius: number,
        petalOffset: number,
        petalRadius: number,
      ) => {
        const clusterCircles: Array<[number, number, number]> = [
          [centerX, centerY, centerRadius],
          [centerX + petalOffset, centerY - petalOffset, petalRadius],
          [centerX + petalOffset, centerY + petalOffset, petalRadius],
          [centerX - petalOffset, centerY - petalOffset, petalRadius],
          [centerX - petalOffset, centerY + petalOffset, petalRadius],
        ];
        for (const [x, y, r] of clusterCircles) {
          context.beginPath();
          context.arc(x, y, r, 0, Math.PI * 2);
          context.fill();
        }
      };

      drawFlowerCluster(sx(150), sy(250), su(24), su(35), su(20));
      drawFlowerCluster(sx(1038), sy(1560), su(22), su(32), su(18));

      context.fillStyle = "rgba(37,69,53,0.16)";
      context.save();
      context.translate(sx(220), sy(500));
      context.rotate((-26 * Math.PI) / 180);
      context.beginPath();
      context.ellipse(0, 0, su(52), su(24), 0, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.save();
      context.translate(sx(960), sy(1280));
      context.rotate((28 * Math.PI) / 180);
      context.beginPath();
      context.ellipse(0, 0, su(56), su(25), 0, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.restore();
      return;
    }
    default:
      context.restore();
  }
}

function createAutoCoverRasterDataUrl(input: AutoCoverInput): string {
  if (typeof document === "undefined") {
    return createAutoCoverSvgDataUrl(input);
  }

  const template = resolveTemplate(input.templateId);
  const textPalette = resolveTextPalette(
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

  if (!context) {
    return createAutoCoverSvgDataUrl(input);
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, template.gradientStart);
  gradient.addColorStop(1, template.gradientEnd);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawCanvasDecoration(context, template, metrics, coverWidth, coverHeight);

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
  const titleLines = wrapTextLines(
    input.title || DEFAULT_BOOK_TITLE,
    titleWrapLimit,
    4,
  );
  const authorLines = wrapTextLines(
    input.author || "",
    authorWrapLimit,
    3,
  );

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

const autoCoverRenderers: Record<AutoCoverRendererId, AutoCoverRenderer> = {
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

function createCustomCoverSvgDataUrl(
  input: AutoCoverInput,
  customImageSrc: string,
): string {
  const textPalette = resolveTextPalette(input.textColorMode, "#2b2b2b", "#171717");
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

  const titleLines = wrapTextLines(
    input.title || DEFAULT_BOOK_TITLE,
    titleWrapLimit,
    4,
  );
  const authorLines = wrapTextLines(
    input.author || "",
    authorWrapLimit,
    3,
  );
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
