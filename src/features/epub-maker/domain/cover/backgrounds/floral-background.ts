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

export const FLORAL_BACKGROUND_ID = "floral" as const;
export const FLORAL_BACKGROUND_LABEL = "Floral" as const;

const floralBackgroundTheme = {
  gradientStart: "#fcfaf4",
  gradientEnd: "#efe7d8",
  frameStroke: "rgba(0,0,0,0.24)",
  accentColor: "rgba(37,69,53,0.2)",
} as const;

export class FloralBackgroundRenderer implements CoverBackgroundRenderer {
  readonly id = FLORAL_BACKGROUND_ID;

  resolveAdaptiveTextSeed() {
    return {
      startColor: floralBackgroundTheme.gradientStart,
      endColor: floralBackgroundTheme.gradientEnd,
    };
  }

  private renderSvgDecoration(metrics: CoverBackgroundSvgContext["metrics"]): string {
    const sx = (value: number) => value * metrics.scaleX;
    const sy = (value: number) => value * metrics.scaleY;
    const su = (value: number) => value * metrics.unitScale;

    return `<g stroke="${floralBackgroundTheme.accentColor}" stroke-width="${su(3)}" fill="none"><path d="M${sx(130)},${sy(230)} C${sx(230)},${sy(360)} ${sx(220)},${sy(560)} ${sx(140)},${sy(760)}"/><path d="M${sx(1030)},${sy(1570)} C${sx(950)},${sy(1410)} ${sx(950)},${sy(1190)} ${sx(1060)},${sy(1030)}"/></g><g fill="${floralBackgroundTheme.accentColor}"><circle cx="${sx(150)}" cy="${sy(250)}" r="${su(24)}"/><circle cx="${sx(185)}" cy="${sy(220)}" r="${su(20)}"/><circle cx="${sx(185)}" cy="${sy(280)}" r="${su(20)}"/><circle cx="${sx(112)}" cy="${sy(220)}" r="${su(20)}"/><circle cx="${sx(112)}" cy="${sy(280)}" r="${su(20)}"/><circle cx="${sx(1038)}" cy="${sy(1560)}" r="${su(22)}"/><circle cx="${sx(1070)}" cy="${sy(1530)}" r="${su(18)}"/><circle cx="${sx(1070)}" cy="${sy(1590)}" r="${su(18)}"/><circle cx="${sx(1006)}" cy="${sy(1530)}" r="${su(18)}"/><circle cx="${sx(1006)}" cy="${sy(1590)}" r="${su(18)}"/></g><ellipse cx="${sx(220)}" cy="${sy(500)}" rx="${su(52)}" ry="${su(24)}" fill="rgba(37,69,53,0.16)" transform="rotate(-26 ${sx(220)} ${sy(500)})"/><ellipse cx="${sx(960)}" cy="${sy(1280)}" rx="${su(56)}" ry="${su(25)}" fill="rgba(37,69,53,0.16)" transform="rotate(28 ${sx(960)} ${sy(1280)})"/>`;
  }

  renderSvgBackground({ metrics, width, height }: CoverBackgroundSvgContext): string {
    return renderFramedGradientBackgroundSvg({
      width,
      height,
      metrics,
      gradientStart: floralBackgroundTheme.gradientStart,
      gradientEnd: floralBackgroundTheme.gradientEnd,
      frameStroke: floralBackgroundTheme.frameStroke,
      decorationSvg: this.renderSvgDecoration(metrics),
    });
  }

  private drawCanvasDecoration(
    context: CoverBackgroundCanvasContext["context"],
    metrics: CoverBackgroundCanvasContext["metrics"],
  ): void {
    const { sx, sy, su } = createScaleHelpers(metrics);

    context.strokeStyle = floralBackgroundTheme.accentColor;
    context.lineWidth = su(3);
    context.beginPath();
    context.moveTo(sx(130), sy(230));
    context.bezierCurveTo(sx(230), sy(360), sx(220), sy(560), sx(140), sy(760));
    context.moveTo(sx(1030), sy(1570));
    context.bezierCurveTo(sx(950), sy(1410), sx(950), sy(1190), sx(1060), sy(1030));
    context.stroke();

    context.fillStyle = floralBackgroundTheme.accentColor;
    const drawFlowerCluster = (
      centerX: number,
      centerY: number,
      centerRadius: number,
      petalOffset: number,
      petalRadius: number,
    ) => {
      const circles: Array<[number, number, number]> = [
        [centerX, centerY, centerRadius],
        [centerX + petalOffset, centerY - petalOffset, petalRadius],
        [centerX + petalOffset, centerY + petalOffset, petalRadius],
        [centerX - petalOffset, centerY - petalOffset, petalRadius],
        [centerX - petalOffset, centerY + petalOffset, petalRadius],
      ];
      for (const [x, y, r] of circles) {
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2);
        context.fill();
      }
    };

    drawFlowerCluster(sx(150), sy(250), su(24), su(35), su(20));
    drawFlowerCluster(sx(1038), sy(1560), su(22), su(32), su(18));

    context.fillStyle = "rgba(37,69,53,0.16)";
    context.save();
    context.translate(sx(220), sy(500));
    context.rotate((-26 * Math.PI) / 180);
    context.beginPath();
    context.ellipse(0, 0, su(52), su(24), 0, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.save();
    context.translate(sx(960), sy(1280));
    context.rotate((28 * Math.PI) / 180);
    context.beginPath();
    context.ellipse(0, 0, su(56), su(25), 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  drawCanvasBackground({ context, metrics, width, height }: CoverBackgroundCanvasContext): void {
    drawFramedGradientBackgroundCanvas({
      context,
      width,
      height,
      metrics,
      gradientStart: floralBackgroundTheme.gradientStart,
      gradientEnd: floralBackgroundTheme.gradientEnd,
      frameStroke: floralBackgroundTheme.frameStroke,
      drawDecoration: () => this.drawCanvasDecoration(context, metrics),
    });
  }
}
