import type {
  CoverSizePresetId,
  CoverSizePresetOption,
  CoverBackgroundOption,
} from "../../types";
import { COVER_BASE_BACKGROUND_SPECS } from "./templates";

const COVER_SIZE_PRESET_CATALOG: CoverSizePresetOption[] = [
  {
    id: "ratio_9_16",
    label: "Portrait 9:16",
    description: "1440 × 2560 (9:16)",
    width: 1440,
    height: 2560,
  },
  {
    id: "ratio_1_1_6",
    label: "Standard EPUB 1:1.6",
    description: "1600 × 2560 (1:1.6)",
    width: 1600,
    height: 2560,
  },
  {
    id: "ratio_2_3",
    label: "Portrait 2:3",
    description: "1800 × 2700 (2:3)",
    width: 1800,
    height: 2700,
  },
  {
    id: "ratio_3_4",
    label: "Portrait 3:4",
    description: "1200 × 1600 (3:4) · Kindle/Kobo screen size",
    width: 1200,
    height: 1600,
  },
  {
    id: "ratio_1_1",
    label: "Square 1:1",
    description: "1800 × 1800 (1:1)",
    width: 1800,
    height: 1800,
  },
];

const COVER_SIZE_PRESETS: Record<CoverSizePresetId, CoverSizePresetOption> =
  COVER_SIZE_PRESET_CATALOG.reduce<Record<CoverSizePresetId, CoverSizePresetOption>>(
    (accumulator, preset) => {
      accumulator[preset.id] = preset;
      return accumulator;
    },
    {},
  );

export const COVER_BACKGROUND_OPTIONS: CoverBackgroundOption[] = [
  ...COVER_BASE_BACKGROUND_SPECS,
  {
    id: "custom",
    label: "Custom",
  },
];

export const COVER_SIZE_PRESET_OPTIONS: CoverSizePresetOption[] = [
  ...COVER_SIZE_PRESET_CATALOG,
];

export function resolveCoverSizePreset(
  presetId: CoverSizePresetId,
): CoverSizePresetOption {
  return COVER_SIZE_PRESETS[presetId] ?? COVER_SIZE_PRESETS.ratio_1_1_6;
}
