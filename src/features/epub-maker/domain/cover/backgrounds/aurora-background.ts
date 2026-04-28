import type {
  CoverBackgroundCanvasContext,
  CoverBackgroundRenderer,
  CoverBackgroundSvgContext,
} from "../core-types";
import {
  createScaleHelpers,
  drawFramedGradientBackgroundCanvas,
  renderFramedGradientBackgroundSvg,
} from "./background-utils";

export const AURORA_BACKGROUND_ID = "aurora" as const;
export const AURORA_BACKGROUND_LABEL = "Aurora" as const;

const auroraBackgroundTheme = {
  gradientStart: "#1b1b3a",
  gradientEnd: "#5a4fcf",
  frameStroke: "rgba(230,224,255,0.36)",
  accentColor: "rgba(164,244,255,0.26)",
} as const;

export class AuroraBackgroundRenderer implements CoverBackgroundRenderer {
  readonly id = AURORA_BACKGROUND_ID;

  resolveAdaptiveTextSeed() {
    return {
      startColor: auroraBackgroundTheme.gradientStart,
      endColor: auroraBackgroundTheme.gradientEnd,
    };
  }

  private renderSvgDecoration(metrics: CoverBackgroundSvgContext["metrics"]): string {
    const sx = (value: number) => value * metrics.scaleX;
    const sy = (value: number) => value * metrics.scaleY;
    const su = (value: number) => value * metrics.unitScale;
    return `<circle cx="${sx(190)}" cy="${sy(230)}" r="${su(260)}" fill="${auroraBackgroundTheme.accentColor}"/><circle cx="${sx(1030)}" cy="${sy(1500)}" r="${su(320)}" fill="${auroraBackgroundTheme.accentColor}"/><circle cx="${sx(950)}" cy="${sy(330)}" r="${su(180)}" fill="rgba(214,173,255,0.18)"/>`;
  }

  renderSvgBackground({ metrics, width, height }: CoverBackgroundSvgContext): string {
    return renderFramedGradientBackgroundSvg({
      width,
      height,
      metrics,
      gradientStart: auroraBackgroundTheme.gradientStart,
      gradientEnd: auroraBackgroundTheme.gradientEnd,
      frameStroke: auroraBackgroundTheme.frameStroke,
      decorationSvg: this.renderSvgDecoration(metrics),
    });
  }

  private drawCanvasDecoration(
    context: CoverBackgroundCanvasContext["context"],
    metrics: CoverBackgroundCanvasContext["metrics"],
  ): void {
    const { sx, sy, su } = createScaleHelpers(metrics);
    context.fillStyle = auroraBackgroundTheme.accentColor;
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
  }

  drawCanvasBackground({ context, metrics, width, height }: CoverBackgroundCanvasContext): void {
    drawFramedGradientBackgroundCanvas({
      context,
      width,
      height,
      metrics,
      gradientStart: auroraBackgroundTheme.gradientStart,
      gradientEnd: auroraBackgroundTheme.gradientEnd,
      frameStroke: auroraBackgroundTheme.frameStroke,
      drawDecoration: () => this.drawCanvasDecoration(context, metrics),
    });
  }
}
