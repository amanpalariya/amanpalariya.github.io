import type {
  BaseCoverTemplateId,
  CoverSizePresetId,
  CoverSizePresetOption,
  CoverTemplateOption,
} from "../../types";
import type { AutoCoverOptions, CoverTemplateSpec } from "./core-types";

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

export const COVER_TEMPLATE_SPECS: Record<BaseCoverTemplateId, CoverTemplateSpec> = {
  classic: {
    id: "classic",
    label: "Monochrome",
    description: "Basic black-on-white with clean editorial balance.",
    gradientStart: "#ffffff",
    gradientEnd: "#f4f4f4",
    titleColor: "#0f0f0f",
    authorColor: "#4f4f4f",
    frameStroke: "rgba(0,0,0,0.28)",
    accentColor: "rgba(0,0,0,0.08)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 620,
      fontSize: 88,
      lineHeight: 108,
      maxCharsPerLine: 20,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 72,
      fontSize: 44,
      lineHeight: 60,
      maxCharsPerLine: 30,
    },
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    description: "Soft glows and cool gradients.",
    gradientStart: "#1b1b3a",
    gradientEnd: "#5a4fcf",
    titleColor: "#f7f7ff",
    authorColor: "#d9d6ff",
    frameStroke: "rgba(230,224,255,0.36)",
    accentColor: "rgba(164,244,255,0.26)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 700,
      fontSize: 92,
      lineHeight: 116,
      maxCharsPerLine: 18,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 60,
      fontSize: 54,
      lineHeight: 72,
      maxCharsPerLine: 24,
    },
  },
  ember: {
    id: "ember",
    label: "Ember",
    description: "Warm contrast with energetic highlights.",
    gradientStart: "#4a1d12",
    gradientEnd: "#b23a24",
    titleColor: "#fff4e8",
    authorColor: "#ffd6b3",
    frameStroke: "rgba(255,228,204,0.34)",
    accentColor: "rgba(255,211,153,0.22)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 760,
      fontSize: 92,
      lineHeight: 116,
      maxCharsPerLine: 18,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "after-title",
      baseY: 56,
      fontSize: 52,
      lineHeight: 68,
      maxCharsPerLine: 24,
    },
  },
  midnight: {
    id: "midnight",
    label: "Noir",
    description: "White-on-black style with cinematic rings.",
    gradientStart: "#080808",
    gradientEnd: "#1a1a1a",
    titleColor: "#f8f8f8",
    authorColor: "#d2d2d2",
    frameStroke: "rgba(255,255,255,0.24)",
    accentColor: "rgba(255,255,255,0.16)",
    titleLayout: {
      align: "left",
      x: 130,
      baseY: 600,
      fontSize: 96,
      lineHeight: 114,
      maxCharsPerLine: 14,
    },
    authorLayout: {
      align: "left",
      x: 130,
      mode: "fixed",
      baseY: 1510,
      fontSize: 42,
      lineHeight: 56,
      maxCharsPerLine: 26,
    },
  },
  sage: {
    id: "sage",
    label: "Geometric",
    description: "Black-on-ivory with geometric border patterns.",
    gradientStart: "#fffef8",
    gradientEnd: "#f0ede4",
    titleColor: "#141414",
    authorColor: "#4a4a4a",
    frameStroke: "rgba(0,0,0,0.24)",
    accentColor: "rgba(0,0,0,0.14)",
    titleLayout: {
      align: "center",
      x: 600,
      baseY: 900,
      fontSize: 86,
      lineHeight: 104,
      maxCharsPerLine: 19,
    },
    authorLayout: {
      align: "center",
      x: 600,
      mode: "fixed",
      baseY: 280,
      fontSize: 40,
      lineHeight: 52,
      maxCharsPerLine: 28,
    },
  },
  sunset: {
    id: "sunset",
    label: "Floral",
    description: "Botanical motifs with title in the lower half.",
    gradientStart: "#fcfaf4",
    gradientEnd: "#efe7d8",
    titleColor: "#212121",
    authorColor: "#505050",
    frameStroke: "rgba(0,0,0,0.24)",
    accentColor: "rgba(37,69,53,0.2)",
    titleLayout: {
      align: "left",
      x: 130,
      baseY: 1110,
      fontSize: 84,
      lineHeight: 100,
      maxCharsPerLine: 16,
    },
    authorLayout: {
      align: "left",
      x: 130,
      mode: "fixed",
      baseY: 305,
      fontSize: 40,
      lineHeight: 52,
      maxCharsPerLine: 28,
    },
  },
};

const COVER_TEMPLATE_DEFAULTS: Record<
  BaseCoverTemplateId,
  Pick<AutoCoverOptions, "textScalePercent" | "textColorMode">
> = {
  classic: { textScalePercent: 100, textColorMode: "dark" },
  aurora: { textScalePercent: 100, textColorMode: "light" },
  ember: { textScalePercent: 100, textColorMode: "light" },
  midnight: { textScalePercent: 100, textColorMode: "light" },
  sage: { textScalePercent: 95, textColorMode: "dark" },
  sunset: { textScalePercent: 95, textColorMode: "dark" },
};

export const COVER_TEMPLATE_OPTIONS: CoverTemplateOption[] = Object.values(
  COVER_TEMPLATE_SPECS,
).map((template) => ({
  id: template.id,
  label: template.label,
  description: template.description,
}));

COVER_TEMPLATE_OPTIONS.push({
  id: "custom",
  label: "Custom",
  description: "Created by editing size/text after choosing a template.",
});

export function resolveCoverTemplateDefaults(
  templateId: BaseCoverTemplateId,
): Pick<AutoCoverOptions, "textScalePercent" | "textColorMode"> {
  return COVER_TEMPLATE_DEFAULTS[templateId] ?? COVER_TEMPLATE_DEFAULTS.classic;
}

export const COVER_SIZE_PRESET_OPTIONS: CoverSizePresetOption[] = [
  ...COVER_SIZE_PRESET_CATALOG,
];

export function resolveCoverSizePreset(
  presetId: CoverSizePresetId,
): CoverSizePresetOption {
  return COVER_SIZE_PRESETS[presetId] ?? COVER_SIZE_PRESETS.ratio_1_1_6;
}

export function resolveTemplateSpec(templateId: BaseCoverTemplateId): CoverTemplateSpec {
  return COVER_TEMPLATE_SPECS[templateId] ?? COVER_TEMPLATE_SPECS.classic;
}
