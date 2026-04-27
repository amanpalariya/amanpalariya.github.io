import type {
  CoverTemplateCanvasContext,
  CoverTemplateRenderer,
  CoverTemplateSvgContext,
} from "../core-types";
import { createScaleHelpers } from "./template-utils";

export class NoirTemplateRenderer implements CoverTemplateRenderer {
  readonly id = "midnight" as const;

  renderSvgDecoration({ template, metrics, width, height }: CoverTemplateSvgContext): string {
    const sx = (value: number) => value * metrics.scaleX;
    const sy = (value: number) => value * metrics.scaleY;
    const su = (value: number) => value * metrics.unitScale;
    return `<circle cx="${sx(980)}" cy="${sy(260)}" r="${su(148)}" fill="${template.accentColor}"/><circle cx="${sx(1040)}" cy="${sy(228)}" r="${su(118)}" fill="rgba(8,8,8,0.9)"/><circle cx="${sx(980)}" cy="${sy(260)}" r="${su(205)}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="${su(2)}"/><circle cx="${sx(980)}" cy="${sy(260)}" r="${su(270)}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${su(1.5)}"/><circle cx="${sx(240)}" cy="${sy(260)}" r="${su(8)}" fill="rgba(255,255,255,0.45)"/><circle cx="${sx(350)}" cy="${sy(420)}" r="${su(5)}" fill="rgba(255,255,255,0.4)"/><circle cx="${sx(860)}" cy="${sy(340)}" r="${su(6)}" fill="rgba(255,255,255,0.36)"/><circle cx="${sx(1080)}" cy="${sy(470)}" r="${su(4)}" fill="rgba(255,255,255,0.42)"/><path d="M${sx(0)},${sy(1460)} C${sx(220)},${sy(1360)} ${sx(430)},${sy(1520)} ${sx(620)},${sy(1450)} C${sx(820)},${sy(1375)} ${sx(980)},${sy(1470)} ${width},${sy(1380)} L${width},${height} L${sx(0)},${height} Z" fill="rgba(24,24,24,0.3)"/>`;
  }

  drawCanvasDecoration({ context, template, metrics, width, height }: CoverTemplateCanvasContext): void {
    const { sx, sy, su } = createScaleHelpers(metrics);

    context.fillStyle = template.accentColor;
    context.beginPath();
    context.arc(sx(980), sy(260), su(148), 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "rgba(8,8,8,0.9)";
    context.beginPath();
    context.arc(sx(1040), sy(228), su(118), 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(255,255,255,0.14)";
    context.lineWidth = su(2);
    context.beginPath();
    context.arc(sx(980), sy(260), su(205), 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = "rgba(255,255,255,0.08)";
    context.lineWidth = su(1.5);
    context.beginPath();
    context.arc(sx(980), sy(260), su(270), 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "rgba(255,255,255,0.42)";
    for (const [x, y, r] of [
      [240, 260, 8],
      [350, 420, 5],
      [860, 340, 6],
      [1080, 470, 4],
    ] as const) {
      context.beginPath();
      context.arc(sx(x), sy(y), su(r), 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = "rgba(24,24,24,0.3)";
    context.beginPath();
    context.moveTo(sx(0), sy(1460));
    context.bezierCurveTo(sx(220), sy(1360), sx(430), sy(1520), sx(620), sy(1450));
    context.bezierCurveTo(sx(820), sy(1375), sx(980), sy(1470), width, sy(1380));
    context.lineTo(width, height);
    context.lineTo(sx(0), height);
    context.closePath();
    context.fill();
  }
}
