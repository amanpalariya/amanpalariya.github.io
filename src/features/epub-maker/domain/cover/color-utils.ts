import type { CoverTextColorMode } from "../../types";
import {
  COVER_TEXT_AUTHOR_COLOR,
  COVER_TEXT_DARK_AUTHOR_COLOR,
  COVER_TEXT_DARK_TITLE_COLOR,
  COVER_TEXT_LIGHT_STROKE_COLOR,
  COVER_TEXT_STROKE_COLOR,
  COVER_TEXT_TITLE_COLOR,
} from "./constants";

export type CoverResolvedTextPalette = {
  titleColor: string;
  authorColor: string;
  strokeColor: string;
};

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

function contrastRatio(
  foreground: { red: number; green: number; blue: number },
  background: { red: number; green: number; blue: number },
): number {
  const foregroundLum = relativeLuminance(foreground);
  const backgroundLum = relativeLuminance(background);
  const lighter = Math.max(foregroundLum, backgroundLum);
  const darker = Math.min(foregroundLum, backgroundLum);
  return (lighter + 0.05) / (darker + 0.05);
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
  const black = { red: 0, green: 0, blue: 0 };
  const white = { red: 255, green: 255, blue: 255 };
  const contrastAgainstBlack = contrastRatio(black, midpoint);
  const contrastAgainstWhite = contrastRatio(white, midpoint);
  const useDarkText = contrastAgainstBlack >= contrastAgainstWhite;

  const contrastGap = Math.abs(contrastAgainstBlack - contrastAgainstWhite);
  const blendBoost = Math.max(0, Math.min(1, contrastGap / 4));

  const darkTitleTarget = { red: 28, green: 32, blue: 38 };
  const darkAuthorTarget = { red: 62, green: 68, blue: 78 };
  const lightTitleTarget = { red: 247, green: 247, blue: 247 };
  const lightAuthorTarget = { red: 222, green: 226, blue: 232 };

  const titleTarget = useDarkText ? darkTitleTarget : lightTitleTarget;
  const authorTarget = useDarkText ? darkAuthorTarget : lightAuthorTarget;
  const titleBlend = useDarkText
    ? Math.min(0.9, 0.62 + blendBoost * 0.18)
    : Math.min(0.92, 0.64 + blendBoost * 0.18);
  const authorBlend = useDarkText
    ? Math.min(0.82, 0.5 + blendBoost * 0.14)
    : Math.min(0.84, 0.54 + blendBoost * 0.14);
  const title = mixRgb(midpoint, titleTarget, titleBlend);
  const author = mixRgb(midpoint, authorTarget, authorBlend);

  return {
    titleColor: rgbToHex(title.red, title.green, title.blue),
    authorColor: rgbToHex(author.red, author.green, author.blue),
    strokeColor: useDarkText ? COVER_TEXT_LIGHT_STROKE_COLOR : COVER_TEXT_STROKE_COLOR,
  };
}

export function resolveTextPalette(
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
