import type {
  CoverBackgroundCanvasContext,
  CoverBackgroundRenderer,
  CoverBackgroundSvgContext,
} from "../core-types";
import {
  drawFramedGradientBackgroundCanvas,
  renderFramedGradientBackgroundSvg,
} from "./template-utils";

export const GEOMETRIC_BACKGROUND_ID = "geometric" as const;
export const GEOMETRIC_BACKGROUND_LABEL = "Geometric" as const;

const geometricTemplateTheme = {
  gradientStart: "#fffef8",
  gradientEnd: "#f0ede4",
  frameStroke: "rgba(0,0,0,0.24)",
  accentColor: "rgba(0,0,0,0.14)",
} as const;

export class GeometricTemplateRenderer implements CoverBackgroundRenderer {
  readonly id = GEOMETRIC_BACKGROUND_ID;

  resolveAdaptiveTextSeed() {
    return {
      startColor: geometricTemplateTheme.gradientStart,
      endColor: geometricTemplateTheme.gradientEnd,
    };
  }

  private createDotField(
    width: number,
    height: number,
    unitScale: number,
    accentColor: string,
  ): string {
    const left = width * 0.12;
    const right = width * 0.88;
    const top = height * 0.1;
    const bottom = height * 0.9;
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
    return dots;
  }

  private renderSvgDecoration(metrics: CoverBackgroundSvgContext["metrics"], width: number, height: number): string {
    return `<g>${this.createDotField(width, height, metrics.unitScale, geometricTemplateTheme.accentColor)}</g>`;
  }

  renderSvgBackground({ metrics, width, height }: CoverBackgroundSvgContext): string {
    return renderFramedGradientBackgroundSvg({
      width,
      height,
      metrics,
      gradientStart: geometricTemplateTheme.gradientStart,
      gradientEnd: geometricTemplateTheme.gradientEnd,
      frameStroke: geometricTemplateTheme.frameStroke,
      decorationSvg: this.renderSvgDecoration(metrics, width, height),
    });
  }

  private drawCanvasDecoration(
    context: CoverBackgroundCanvasContext["context"],
    metrics: CoverBackgroundCanvasContext["metrics"],
    width: number,
    height: number,
  ): void {
    const left = width * 0.12;
    const right = width * 0.88;
    const top = height * 0.1;
    const bottom = height * 0.9;
    const stepX = Math.max(16, 34 * metrics.unitScale);
    const stepY = Math.max(14, 28 * metrics.unitScale);
    const centerX = (left + right) / 2;
    const halfWidth = Math.max(1, (right - left) / 2);

    context.fillStyle = geometricTemplateTheme.accentColor;
    for (let row = 0, y = top; y <= bottom; row += 1, y += stepY) {
      const rowOffset = row % 2 === 0 ? 0 : stepX / 2;
      for (let x = left + rowOffset; x <= right; x += stepX) {
        const normY = (y - top) / Math.max(1, bottom - top);
        const normX = Math.abs((x - centerX) / halfWidth);
        const alpha = Math.max(0.075, (1 - normY * 0.68) * (1 - normX * 0.58) * 0.44);
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
  }

  drawCanvasBackground({ context, metrics, width, height }: CoverBackgroundCanvasContext): void {
    drawFramedGradientBackgroundCanvas({
      context,
      width,
      height,
      metrics,
      gradientStart: geometricTemplateTheme.gradientStart,
      gradientEnd: geometricTemplateTheme.gradientEnd,
      frameStroke: geometricTemplateTheme.frameStroke,
      drawDecoration: () => this.drawCanvasDecoration(context, metrics, width, height),
    });
  }
}
