import type {
  BaseCoverBackgroundId,
  CoverSizePresetId,
  CoverTextColorMode,
  CoverTextPosition,
} from "../../types";

export type AutoCoverRendererId = "raster-png" | "svg";

export interface AutoCoverInput {
  title: string;
  author: string;
  backgroundId: BaseCoverBackgroundId;
  size: {
    width: number;
    height: number;
  };
  textScalePercent: number;
  textPosition: CoverTextPosition;
  textColorMode: CoverTextColorMode;
  hideText?: boolean;
}

export interface AutoCoverOptions {
  backgroundId: BaseCoverBackgroundId;
  sizePresetId: CoverSizePresetId;
  textScalePercent: number;
  textPosition: CoverTextPosition;
  textColorMode: CoverTextColorMode;
}

export interface CoverHtmlOptions extends AutoCoverOptions {
  customCoverHtml?: string | null;
  hideCoverText?: boolean;
}

export type CoverTextLayout = {
  align: "center" | "left" | "right";
  x: number;
  baseY: number;
  fontSize: number;
  lineHeight: number;
  maxCharsPerLine: number;
};

export type CoverAuthorLayout = {
  align: "center" | "left" | "right";
  x: number;
  mode: "after-title" | "fixed";
  baseY: number;
  fontSize: number;
  lineHeight: number;
  maxCharsPerLine: number;
};

export type CoverBackgroundSpec = {
  id: BaseCoverBackgroundId;
  label: string;
};

export type CoverCanvasMetrics = {
  scaleX: number;
  scaleY: number;
  unitScale: number;
};

export type CoverBackgroundSvgContext = {
  metrics: CoverCanvasMetrics;
  width: number;
  height: number;
};

export type CoverBackgroundCanvasContext = {
  context: CanvasRenderingContext2D;
  metrics: CoverCanvasMetrics;
  width: number;
  height: number;
};

export interface CoverBackgroundRenderer {
  id: BaseCoverBackgroundId;
  renderSvgBackground(context: CoverBackgroundSvgContext): string;
  drawCanvasBackground(context: CoverBackgroundCanvasContext): void;
  resolveAdaptiveTextSeed(): { startColor: string; endColor: string };
}
