import type {
  CoverTemplateCanvasContext,
  CoverTemplateRenderer,
  CoverTemplateSvgContext,
} from "../core-types";

export class GeometricTemplateRenderer implements CoverTemplateRenderer {
  readonly id = "sage" as const;

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

  renderSvgDecoration({ template, metrics, width, height }: CoverTemplateSvgContext): string {
    return `<g>${this.createDotField(width, height, metrics.unitScale, template.accentColor)}</g>`;
  }

  drawCanvasDecoration({ context, template, metrics, width, height }: CoverTemplateCanvasContext): void {
    const left = width * 0.12;
    const right = width * 0.88;
    const top = height * 0.1;
    const bottom = height * 0.9;
    const stepX = Math.max(16, 34 * metrics.unitScale);
    const stepY = Math.max(14, 28 * metrics.unitScale);
    const centerX = (left + right) / 2;
    const halfWidth = Math.max(1, (right - left) / 2);

    context.fillStyle = template.accentColor;
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
}
