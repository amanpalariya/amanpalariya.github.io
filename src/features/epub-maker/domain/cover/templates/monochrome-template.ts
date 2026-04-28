import type {
  CoverBackgroundCanvasContext,
  CoverBackgroundRenderer,
  CoverBackgroundSvgContext,
} from "../core-types";
import {
  createScaleHelpers,
  drawFramedGradientBackgroundCanvas,
  renderFramedGradientBackgroundSvg,
} from "./template-utils";

export const MONOCHROME_BACKGROUND_ID = "monochrome" as const;
export const MONOCHROME_BACKGROUND_LABEL = "Monochrome" as const;

const monochromeTemplateTheme = {
  gradientStart: "#ffffff",
  gradientEnd: "#f4f4f4",
  frameStroke: "rgba(0,0,0,0.28)",
  accentColor: "rgba(0,0,0,0.08)",
} as const;

export class MonochromeTemplateRenderer implements CoverBackgroundRenderer {
  readonly id = MONOCHROME_BACKGROUND_ID;

  resolveAdaptiveTextSeed() {
    return {
      startColor: monochromeTemplateTheme.gradientStart,
      endColor: monochromeTemplateTheme.gradientEnd,
    };
  }

  private renderSvgDecoration(metrics: CoverBackgroundSvgContext["metrics"]): string {
    return `<line x1="${180 * metrics.scaleX}" y1="${220 * metrics.scaleY}" x2="${1020 * metrics.scaleX}" y2="${220 * metrics.scaleY}" stroke="${monochromeTemplateTheme.accentColor}" stroke-width="${2 * metrics.unitScale}"/><line x1="${180 * metrics.scaleX}" y1="${1580 * metrics.scaleY}" x2="${1020 * metrics.scaleX}" y2="${1580 * metrics.scaleY}" stroke="${monochromeTemplateTheme.accentColor}" stroke-width="${2 * metrics.unitScale}"/>`;
  }

  renderSvgBackground({ metrics, width, height }: CoverBackgroundSvgContext): string {
    return renderFramedGradientBackgroundSvg({
      width,
      height,
      metrics,
      gradientStart: monochromeTemplateTheme.gradientStart,
      gradientEnd: monochromeTemplateTheme.gradientEnd,
      frameStroke: monochromeTemplateTheme.frameStroke,
      decorationSvg: this.renderSvgDecoration(metrics),
    });
  }

  private drawCanvasDecoration(
    context: CoverBackgroundCanvasContext["context"],
    metrics: CoverBackgroundCanvasContext["metrics"],
  ): void {
    const { sx, sy, su } = createScaleHelpers(metrics);
    context.strokeStyle = monochromeTemplateTheme.accentColor;
    context.lineWidth = su(2);
    context.beginPath();
    context.moveTo(sx(180), sy(220));
    context.lineTo(sx(1020), sy(220));
    context.moveTo(sx(180), sy(1580));
    context.lineTo(sx(1020), sy(1580));
    context.stroke();
  }

  drawCanvasBackground({ context, metrics, width, height }: CoverBackgroundCanvasContext): void {
    drawFramedGradientBackgroundCanvas({
      context,
      width,
      height,
      metrics,
      gradientStart: monochromeTemplateTheme.gradientStart,
      gradientEnd: monochromeTemplateTheme.gradientEnd,
      frameStroke: monochromeTemplateTheme.frameStroke,
      drawDecoration: () => this.drawCanvasDecoration(context, metrics),
    });
  }
}
