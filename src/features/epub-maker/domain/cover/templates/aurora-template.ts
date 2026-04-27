import type {
  CoverTemplateCanvasContext,
  CoverTemplateRenderer,
  CoverTemplateSvgContext,
} from "../core-types";
import { createScaleHelpers } from "./template-utils";

export class AuroraTemplateRenderer implements CoverTemplateRenderer {
  readonly id = "aurora" as const;

  renderSvgDecoration({ template, metrics }: CoverTemplateSvgContext): string {
    const sx = (value: number) => value * metrics.scaleX;
    const sy = (value: number) => value * metrics.scaleY;
    const su = (value: number) => value * metrics.unitScale;
    return `<circle cx="${sx(190)}" cy="${sy(230)}" r="${su(260)}" fill="${template.accentColor}"/><circle cx="${sx(1030)}" cy="${sy(1500)}" r="${su(320)}" fill="${template.accentColor}"/><circle cx="${sx(950)}" cy="${sy(330)}" r="${su(180)}" fill="rgba(214,173,255,0.18)"/>`;
  }

  drawCanvasDecoration({ context, template, metrics }: CoverTemplateCanvasContext): void {
    const { sx, sy, su } = createScaleHelpers(metrics);
    context.fillStyle = template.accentColor;
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
}
