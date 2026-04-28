import type { BaseCoverBackgroundId } from "../../../types";
import type { CoverBackgroundRenderer, CoverBackgroundSpec } from "../core-types";
import {
  AURORA_BACKGROUND_ID,
  AURORA_BACKGROUND_LABEL,
  AuroraTemplateRenderer,
} from "./aurora-template";
import {
  EMBER_BACKGROUND_ID,
  EMBER_BACKGROUND_LABEL,
  EmberTemplateRenderer,
} from "./ember-template";
import {
  FLORAL_BACKGROUND_ID,
  FLORAL_BACKGROUND_LABEL,
  FloralTemplateRenderer,
} from "./floral-template";
import {
  GEOMETRIC_BACKGROUND_ID,
  GEOMETRIC_BACKGROUND_LABEL,
  GeometricTemplateRenderer,
} from "./geometric-template";
import {
  MONOCHROME_BACKGROUND_ID,
  MONOCHROME_BACKGROUND_LABEL,
  MonochromeTemplateRenderer,
} from "./monochrome-template";
import {
  NOIR_BACKGROUND_ID,
  NOIR_BACKGROUND_LABEL,
  NoirTemplateRenderer,
} from "./noir-template";

const backgroundRenderers: CoverBackgroundRenderer[] = [
  new MonochromeTemplateRenderer(),
  new AuroraTemplateRenderer(),
  new EmberTemplateRenderer(),
  new NoirTemplateRenderer(),
  new GeometricTemplateRenderer(),
  new FloralTemplateRenderer(),
];

const rendererById = new Map<BaseCoverBackgroundId, CoverBackgroundRenderer>(
  backgroundRenderers.map((renderer) => [renderer.id, renderer]),
);

export function resolveBackgroundRenderer(
  backgroundId: BaseCoverBackgroundId,
): CoverBackgroundRenderer {
  return rendererById.get(backgroundId) ?? rendererById.get("monochrome")!;
}

const backgroundSpecById: Record<BaseCoverBackgroundId, CoverBackgroundSpec> = {
  [MONOCHROME_BACKGROUND_ID]: {
    id: MONOCHROME_BACKGROUND_ID,
    label: MONOCHROME_BACKGROUND_LABEL,
  },
  [AURORA_BACKGROUND_ID]: { id: AURORA_BACKGROUND_ID, label: AURORA_BACKGROUND_LABEL },
  [EMBER_BACKGROUND_ID]: { id: EMBER_BACKGROUND_ID, label: EMBER_BACKGROUND_LABEL },
  [NOIR_BACKGROUND_ID]: { id: NOIR_BACKGROUND_ID, label: NOIR_BACKGROUND_LABEL },
  [GEOMETRIC_BACKGROUND_ID]: {
    id: GEOMETRIC_BACKGROUND_ID,
    label: GEOMETRIC_BACKGROUND_LABEL,
  },
  [FLORAL_BACKGROUND_ID]: { id: FLORAL_BACKGROUND_ID, label: FLORAL_BACKGROUND_LABEL },
};

export function resolveBackgroundSpec(backgroundId: BaseCoverBackgroundId): CoverBackgroundSpec {
  return backgroundSpecById[backgroundId] ?? backgroundSpecById.monochrome;
}

export const COVER_BASE_BACKGROUND_SPECS: CoverBackgroundSpec[] = Object.values(
  backgroundSpecById,
);
