import type { CoverCanvasMetrics } from "../core-types";

export function createScaleHelpers(metrics: CoverCanvasMetrics) {
  return {
    sx: (value: number) => value * metrics.scaleX,
    sy: (value: number) => value * metrics.scaleY,
    su: (value: number) => value * metrics.unitScale,
  };
}

export function drawRoundedRectPath(
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

export function renderFramedGradientBackgroundSvg({
  width,
  height,
  metrics,
  gradientStart,
  gradientEnd,
  frameStroke,
  decorationSvg,
}: {
  width: number;
  height: number;
  metrics: CoverCanvasMetrics;
  gradientStart: string;
  gradientEnd: string;
  frameStroke: string;
  decorationSvg: string;
}): string {
  const frameInset = Math.round(76 * metrics.unitScale);
  const frameRadius = Math.round(40 * metrics.unitScale);
  const frameX = frameInset;
  const frameY = frameInset;
  const frameWidth = Math.max(0, width - frameInset * 2);
  const frameHeight = Math.max(0, height - frameInset * 2);
  return `<defs><linearGradient id="coverGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${gradientStart}"/><stop offset="100%" stop-color="${gradientEnd}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#coverGradient)"/>${decorationSvg}<rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="${frameHeight}" rx="${frameRadius}" fill="none" stroke="${frameStroke}" stroke-width="${4 * metrics.unitScale}"/>`;
}

export function drawFramedGradientBackgroundCanvas({
  context,
  width,
  height,
  metrics,
  gradientStart,
  gradientEnd,
  frameStroke,
  drawDecoration,
}: {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  metrics: CoverCanvasMetrics;
  gradientStart: string;
  gradientEnd: string;
  frameStroke: string;
  drawDecoration: () => void;
}): void {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, gradientStart);
  gradient.addColorStop(1, gradientEnd);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  drawDecoration();

  const frameInset = 76 * metrics.unitScale;
  const frameRadius = 40 * metrics.unitScale;
  context.strokeStyle = frameStroke;
  context.lineWidth = 4 * metrics.unitScale;
  drawRoundedRectPath(
    context,
    frameInset,
    frameInset,
    Math.max(0, width - frameInset * 2),
    Math.max(0, height - frameInset * 2),
    frameRadius,
  );
  context.stroke();
}
