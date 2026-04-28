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

export const EMBER_BACKGROUND_ID = "ember" as const;
export const EMBER_BACKGROUND_LABEL = "Ember" as const;

const emberBackgroundTheme = {
  gradientStart: "#4a1d12",
  gradientEnd: "#b23a24",
  frameStroke: "rgba(255,228,204,0.34)",
  accentColor: "rgba(255,211,153,0.22)",
} as const;

export class EmberBackgroundRenderer implements CoverBackgroundRenderer {
  readonly id = EMBER_BACKGROUND_ID;

  resolveAdaptiveTextSeed() {
    return {
      startColor: emberBackgroundTheme.gradientStart,
      endColor: emberBackgroundTheme.gradientEnd,
    };
  }

  private renderSvgDecoration(
    metrics: CoverBackgroundSvgContext["metrics"],
    width: number,
    height: number,
  ): string {
    const sx = (value: number) => value * metrics.scaleX;
    const sy = (value: number) => value * metrics.scaleY;
    return `<path d="M${sx(0)},${sy(1560)} L${width},${sy(1180)} L${width},${height} L${sx(0)},${height} Z" fill="${emberBackgroundTheme.accentColor}"/><path d="M${sx(0)},${sy(0)} L${sx(760)},${sy(0)} L${sx(0)},${sy(760)} Z" fill="rgba(255,166,107,0.14)"/>`;
  }

  renderSvgBackground({ metrics, width, height }: CoverBackgroundSvgContext): string {
    return renderFramedGradientBackgroundSvg({
      width,
      height,
      metrics,
      gradientStart: emberBackgroundTheme.gradientStart,
      gradientEnd: emberBackgroundTheme.gradientEnd,
      frameStroke: emberBackgroundTheme.frameStroke,
      decorationSvg: this.renderSvgDecoration(metrics, width, height),
    });
  }

  private drawCanvasDecoration(
    context: CoverBackgroundCanvasContext["context"],
    metrics: CoverBackgroundCanvasContext["metrics"],
    width: number,
    height: number,
  ): void {
    const { sx, sy } = createScaleHelpers(metrics);
    context.fillStyle = emberBackgroundTheme.accentColor;
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
  }

  drawCanvasBackground({ context, metrics, width, height }: CoverBackgroundCanvasContext): void {
    drawFramedGradientBackgroundCanvas({
      context,
      width,
      height,
      metrics,
      gradientStart: emberBackgroundTheme.gradientStart,
      gradientEnd: emberBackgroundTheme.gradientEnd,
      frameStroke: emberBackgroundTheme.frameStroke,
      drawDecoration: () => this.drawCanvasDecoration(context, metrics, width, height),
    });
  }
}
