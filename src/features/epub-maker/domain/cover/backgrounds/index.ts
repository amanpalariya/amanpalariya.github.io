import type { BaseCoverBackgroundId } from "../../../types";
import type { CoverBackgroundRenderer, CoverBackgroundSpec } from "../core-types";
import {
  AURORA_BACKGROUND_ID,
  AURORA_BACKGROUND_LABEL,
  AuroraBackgroundRenderer,
} from "./aurora-background";
import {
  EMBER_BACKGROUND_ID,
  EMBER_BACKGROUND_LABEL,
  EmberBackgroundRenderer,
} from "./ember-background";
import {
  FLORAL_BACKGROUND_ID,
  FLORAL_BACKGROUND_LABEL,
  FloralBackgroundRenderer,
} from "./floral-background";
import {
  GEOMETRIC_BACKGROUND_ID,
  GEOMETRIC_BACKGROUND_LABEL,
  GeometricBackgroundRenderer,
} from "./geometric-background";
import {
  MONOCHROME_BACKGROUND_ID,
  MONOCHROME_BACKGROUND_LABEL,
  MonochromeBackgroundRenderer,
} from "./monochrome-background";
import {
  NOIR_BACKGROUND_ID,
  NOIR_BACKGROUND_LABEL,
  NoirBackgroundRenderer,
} from "./noir-background";

const backgroundRenderers: CoverBackgroundRenderer[] = [
  new MonochromeBackgroundRenderer(),
  new AuroraBackgroundRenderer(),
  new EmberBackgroundRenderer(),
  new NoirBackgroundRenderer(),
  new GeometricBackgroundRenderer(),
  new FloralBackgroundRenderer(),
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
