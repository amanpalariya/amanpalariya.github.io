import type { BaseCoverTemplateId } from "../../../types";
import type { CoverTemplateRenderer } from "../core-types";
import { AuroraTemplateRenderer } from "./aurora-template";
import { EmberTemplateRenderer } from "./ember-template";
import { FloralTemplateRenderer } from "./floral-template";
import { GeometricTemplateRenderer } from "./geometric-template";
import { MonochromeTemplateRenderer } from "./monochrome-template";
import { NoirTemplateRenderer } from "./noir-template";

const templateRenderers: CoverTemplateRenderer[] = [
  new MonochromeTemplateRenderer(),
  new AuroraTemplateRenderer(),
  new EmberTemplateRenderer(),
  new NoirTemplateRenderer(),
  new GeometricTemplateRenderer(),
  new FloralTemplateRenderer(),
];

const rendererById = new Map<BaseCoverTemplateId, CoverTemplateRenderer>(
  templateRenderers.map((renderer) => [renderer.id, renderer]),
);

export function resolveTemplateRenderer(templateId: BaseCoverTemplateId): CoverTemplateRenderer {
  return rendererById.get(templateId) ?? rendererById.get("classic")!;
}
