import type {
  CoverTemplateCanvasContext,
  CoverTemplateRenderer,
  CoverTemplateSvgContext,
} from "../core-types";
import { createScaleHelpers } from "./template-utils";

export class EmberTemplateRenderer implements CoverTemplateRenderer {
  readonly id = "ember" as const;

  renderSvgDecoration({ template, metrics, width, height }: CoverTemplateSvgContext): string {
    const sx = (value: number) => value * metrics.scaleX;
    const sy = (value: number) => value * metrics.scaleY;
    return `<path d="M${sx(0)},${sy(1560)} L${width},${sy(1180)} L${width},${height} L${sx(0)},${height} Z" fill="${template.accentColor}"/><path d="M${sx(0)},${sy(0)} L${sx(760)},${sy(0)} L${sx(0)},${sy(760)} Z" fill="rgba(255,166,107,0.14)"/>`;
  }

  drawCanvasDecoration({ context, template, metrics, width, height }: CoverTemplateCanvasContext): void {
    const { sx, sy } = createScaleHelpers(metrics);
    context.fillStyle = template.accentColor;
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
}
