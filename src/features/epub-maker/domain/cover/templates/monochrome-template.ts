import type {
  CoverTemplateCanvasContext,
  CoverTemplateRenderer,
  CoverTemplateSvgContext,
} from "../core-types";
import { createScaleHelpers } from "./template-utils";

export class MonochromeTemplateRenderer implements CoverTemplateRenderer {
  readonly id = "classic" as const;

  renderSvgDecoration({ template, metrics }: CoverTemplateSvgContext): string {
    return `<line x1="${180 * metrics.scaleX}" y1="${220 * metrics.scaleY}" x2="${1020 * metrics.scaleX}" y2="${220 * metrics.scaleY}" stroke="${template.accentColor}" stroke-width="${2 * metrics.unitScale}"/><line x1="${180 * metrics.scaleX}" y1="${1580 * metrics.scaleY}" x2="${1020 * metrics.scaleX}" y2="${1580 * metrics.scaleY}" stroke="${template.accentColor}" stroke-width="${2 * metrics.unitScale}"/>`;
  }

  drawCanvasDecoration({ context, template, metrics }: CoverTemplateCanvasContext): void {
    const { sx, sy, su } = createScaleHelpers(metrics);
    context.strokeStyle = template.accentColor;
    context.lineWidth = su(2);
    context.beginPath();
    context.moveTo(sx(180), sy(220));
    context.lineTo(sx(1020), sy(220));
    context.moveTo(sx(180), sy(1580));
    context.lineTo(sx(1020), sy(1580));
    context.stroke();
  }
}
