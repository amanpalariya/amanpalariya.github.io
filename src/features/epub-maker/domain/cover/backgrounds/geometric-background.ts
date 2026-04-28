import type {
  CoverBackgroundCanvasContext,
  CoverBackgroundRenderer,
  CoverBackgroundSvgContext,
} from "../core-types";
import {
  drawRoundedRectPath,
  drawFramedGradientBackgroundCanvas,
  renderFramedGradientBackgroundSvg,
} from "./background-utils";

export const GEOMETRIC_BACKGROUND_ID = "geometric" as const;
export const GEOMETRIC_BACKGROUND_LABEL = "Geometric" as const;

const geometricBackgroundTheme = {
  gradientStart: "#fffef8",
  gradientEnd: "#f0ede4",
  frameStroke: "rgba(0,0,0,0.24)",
} as const;

export class GeometricBackgroundRenderer implements CoverBackgroundRenderer {
  readonly id = GEOMETRIC_BACKGROUND_ID;

  resolveAdaptiveTextSeed() {
    return {
      startColor: geometricBackgroundTheme.gradientStart,
      endColor: geometricBackgroundTheme.gradientEnd,
    };
  }

  private shadeForTriangle(row: number, col: number, pointsUp: boolean): number {
    const phase = row * 91.7 + col * 47.3 + (pointsUp ? 13.1 : 29.9);
    const random = Math.sin(phase) * 43758.5453123;
    return random - Math.floor(random);
  }

  private parseHexColor(color: string): { red: number; green: number; blue: number } {
    const normalized = color.replace("#", "").trim();
    const expanded =
      normalized.length === 3
        ? normalized
            .split("")
            .map((chunk) => `${chunk}${chunk}`)
            .join("")
        : normalized;
    return {
      red: Number.parseInt(expanded.slice(0, 2), 16),
      green: Number.parseInt(expanded.slice(2, 4), 16),
      blue: Number.parseInt(expanded.slice(4, 6), 16),
    };
  }

  private resolveTriangleColor(
    row: number,
    col: number,
    pointsUp: boolean,
    y: number,
    frameY: number,
    frameHeight: number,
    startColor: { red: number; green: number; blue: number },
    endColor: { red: number; green: number; blue: number },
  ): string {
    const noise = this.shadeForTriangle(row, col, pointsUp);
    const baseBlend = Math.max(0, Math.min(1, (y - frameY) / Math.max(1, frameHeight)));
    const blendWithNoise = Math.max(0, Math.min(1, baseBlend + (noise - 0.5) * 0.62));
    const contrastBlend = Math.max(0, Math.min(1, (blendWithNoise - 0.5) * 1.35 + 0.5));
    const red = Math.round(startColor.red + (endColor.red - startColor.red) * contrastBlend);
    const green = Math.round(startColor.green + (endColor.green - startColor.green) * contrastBlend);
    const blue = Math.round(startColor.blue + (endColor.blue - startColor.blue) * contrastBlend);
    return `rgb(${red},${green},${blue})`;
  }

  private triangleVertices(
    x: number,
    y: number,
    side: number,
    triangleHeight: number,
    pointsUp: boolean,
  ): [number, number, number, number, number, number] {
    if (pointsUp) {
      return [x, y + triangleHeight, x + side / 2, y, x + side, y + triangleHeight];
    }
    return [x, y, x + side, y, x + side / 2, y + triangleHeight];
  }

  private resolveFrameGeometry(
    metrics: CoverBackgroundSvgContext["metrics"] | CoverBackgroundCanvasContext["metrics"],
    width: number,
    height: number,
  ) {
    const frameInset = 76 * metrics.unitScale;
    const frameRadius = 40 * metrics.unitScale;
    return {
      frameX: frameInset,
      frameY: frameInset,
      frameWidth: Math.max(0, width - frameInset * 2),
      frameHeight: Math.max(0, height - frameInset * 2),
      frameRadius,
    };
  }

  private renderSvgDecoration(
    metrics: CoverBackgroundSvgContext["metrics"],
    width: number,
    height: number,
  ): string {
    const { frameX, frameY, frameWidth, frameHeight, frameRadius } = this.resolveFrameGeometry(
      metrics,
      width,
      height,
    );
    const side = Math.max(36, 74 * metrics.unitScale);
    const triangleHeight = side * (Math.sqrt(3) / 2);
    const startRow = Math.floor((frameY - triangleHeight * 2) / triangleHeight);
    const endRow = Math.ceil((frameY + frameHeight + triangleHeight * 2) / triangleHeight);
    const startCol = Math.floor((frameX - side * 2) / (side / 2));
    const endCol = Math.ceil((frameX + frameWidth + side * 2) / (side / 2));
    const clipPathId = "coverGeometricClipPath";
    const startColor = this.parseHexColor(geometricBackgroundTheme.gradientStart);
    const endColor = this.parseHexColor(geometricBackgroundTheme.gradientEnd);

    let triangles = "";
    for (let row = startRow; row <= endRow; row += 1) {
      const y = row * triangleHeight;
      for (let col = startCol; col <= endCol; col += 1) {
        const x = (col * side) / 2;
        const pointsUp = (row + col) % 2 === 0;
        const [x1, y1, x2, y2, x3, y3] = this.triangleVertices(
          x,
          y,
          side,
          triangleHeight,
          pointsUp,
        );
        const triangleColor = this.resolveTriangleColor(
          row,
          col,
          pointsUp,
          y,
          frameY,
          frameHeight,
          startColor,
          endColor,
        );
        triangles += `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} Z" fill="${triangleColor}"/>`;
      }
    }

    return `<defs><clipPath id="${clipPathId}"><rect x="${frameX.toFixed(2)}" y="${frameY.toFixed(2)}" width="${frameWidth.toFixed(2)}" height="${frameHeight.toFixed(2)}" rx="${frameRadius.toFixed(2)}"/></clipPath></defs><g clip-path="url(#${clipPathId})">${triangles}</g>`;
  }

  renderSvgBackground({ metrics, width, height }: CoverBackgroundSvgContext): string {
    return renderFramedGradientBackgroundSvg({
      width,
      height,
      metrics,
      gradientStart: geometricBackgroundTheme.gradientStart,
      gradientEnd: geometricBackgroundTheme.gradientEnd,
      frameStroke: geometricBackgroundTheme.frameStroke,
      decorationSvg: this.renderSvgDecoration(metrics, width, height),
    });
  }

  private drawCanvasDecoration(
    context: CoverBackgroundCanvasContext["context"],
    metrics: CoverBackgroundCanvasContext["metrics"],
    width: number,
    height: number,
  ): void {
    const { frameX, frameY, frameWidth, frameHeight, frameRadius } = this.resolveFrameGeometry(
      metrics,
      width,
      height,
    );
    const side = Math.max(36, 74 * metrics.unitScale);
    const triangleHeight = side * (Math.sqrt(3) / 2);
    const startRow = Math.floor((frameY - triangleHeight * 2) / triangleHeight);
    const endRow = Math.ceil((frameY + frameHeight + triangleHeight * 2) / triangleHeight);
    const startCol = Math.floor((frameX - side * 2) / (side / 2));
    const endCol = Math.ceil((frameX + frameWidth + side * 2) / (side / 2));
    const startColor = this.parseHexColor(geometricBackgroundTheme.gradientStart);
    const endColor = this.parseHexColor(geometricBackgroundTheme.gradientEnd);

    context.save();
    drawRoundedRectPath(context, frameX, frameY, frameWidth, frameHeight, frameRadius);
    context.clip();

    for (let row = startRow; row <= endRow; row += 1) {
      const y = row * triangleHeight;
      for (let col = startCol; col <= endCol; col += 1) {
        const x = (col * side) / 2;
        const pointsUp = (row + col) % 2 === 0;
        const [x1, y1, x2, y2, x3, y3] = this.triangleVertices(
          x,
          y,
          side,
          triangleHeight,
          pointsUp,
        );
        context.fillStyle = this.resolveTriangleColor(
          row,
          col,
          pointsUp,
          y,
          frameY,
          frameHeight,
          startColor,
          endColor,
        );
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.closePath();
        context.fill();
      }
    }
    context.restore();
  }

  drawCanvasBackground({ context, metrics, width, height }: CoverBackgroundCanvasContext): void {
    drawFramedGradientBackgroundCanvas({
      context,
      width,
      height,
      metrics,
      gradientStart: geometricBackgroundTheme.gradientStart,
      gradientEnd: geometricBackgroundTheme.gradientEnd,
      frameStroke: geometricBackgroundTheme.frameStroke,
      drawDecoration: () => this.drawCanvasDecoration(context, metrics, width, height),
    });
  }
}
