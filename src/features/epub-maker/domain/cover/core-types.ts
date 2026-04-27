import type {
  BaseCoverTemplateId,
  CoverSizePresetId,
  CoverTextColorMode,
  CoverTextPosition,
} from "../../types";

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
  hideText?: boolean;
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

export type CoverTemplateSpec = {
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

export type CoverCanvasMetrics = {
  scaleX: number;
  scaleY: number;
  unitScale: number;
};

export type CoverTemplateSvgContext = {
  template: CoverTemplateSpec;
  metrics: CoverCanvasMetrics;
  width: number;
  height: number;
};

export type CoverTemplateCanvasContext = {
  context: CanvasRenderingContext2D;
  template: CoverTemplateSpec;
  metrics: CoverCanvasMetrics;
  width: number;
  height: number;
};

export interface CoverTemplateRenderer {
  id: BaseCoverTemplateId;
  renderSvgDecoration(context: CoverTemplateSvgContext): string;
  drawCanvasDecoration(context: CoverTemplateCanvasContext): void;
}
