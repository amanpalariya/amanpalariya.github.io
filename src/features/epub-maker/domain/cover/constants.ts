import type { CoverAuthorLayout, CoverTextLayout } from "./core-types";
import type { CoverTextPosition } from "../../types";

export const DEFAULT_AUTO_COVER_RENDERER = "raster-png" as const;

export const AUTO_COVER_LAYOUT_WIDTH = 1200;
export const AUTO_COVER_LAYOUT_HEIGHT = 1800;

export const BASE_TEXT_SCALE_MULTIPLIER = 1.35;
export const TITLE_FONT_SIZE_BOOST = 1.04;
export const AUTHOR_FONT_SIZE_BOOST = 1.22;

export const COVER_TEXT_BOUND_LEFT = 130;
export const COVER_TEXT_BOUND_RIGHT = 1070;

export const COVER_FRAME_INSET = 76;
export const COVER_FRAME_RADIUS = 40;

export const COVER_TEXT_TITLE_COLOR = "#f5f5f5";
export const COVER_TEXT_AUTHOR_COLOR = "#e4e4e4";
export const COVER_TEXT_STROKE_COLOR = "rgba(0,0,0,0.42)";
export const COVER_TEXT_STROKE_WIDTH = 1.6;
export const COVER_TEXT_DARK_TITLE_COLOR = "#171717";
export const COVER_TEXT_DARK_AUTHOR_COLOR = "#3f3f3f";
export const COVER_TEXT_LIGHT_STROKE_COLOR = "rgba(255,255,255,0.34)";

export const COVER_TEXT_STYLE_ORDER: CoverTextPosition[] = [
  "style_1",
  "style_2",
  "style_3",
  "style_4",
  "style_5",
  "style_6",
];

export const DEFAULT_TEXT_LAYOUT: CoverTextLayout = {
  align: "center",
  x: 600,
  baseY: 760,
  fontSize: 92,
  lineHeight: 116,
  maxCharsPerLine: 18,
};

export const DEFAULT_AUTHOR_LAYOUT: CoverAuthorLayout = {
  align: "center",
  x: 600,
  mode: "after-title",
  baseY: 64,
  fontSize: 48,
  lineHeight: 64,
  maxCharsPerLine: 26,
};
