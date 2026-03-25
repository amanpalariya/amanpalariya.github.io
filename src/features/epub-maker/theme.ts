import type { AppSemanticTokenDefinition } from "@config/chakra/semantic-tokens";

const semanticColor = (
  base: string,
  dark: string,
  description?: string,
): AppSemanticTokenDefinition => ({
  value: { base, _dark: dark },
  ...(description ? { description } : {}),
});

export const SEMANTIC_TOKENS = {
  bg: {
    surface: semanticColor("{colors.gray.50}", "{colors.gray.900}"),
    card: semanticColor("{colors.white}", "{colors.gray.800}"),
    popover: semanticColor("{colors.white}", "{colors.gray.800}"),
    preview: semanticColor("{colors.gray.50}", "{colors.gray.900}"),
  },
  fg: {
    default: semanticColor("{colors.gray.800}", "{colors.gray.200}"),
    muted: semanticColor("{colors.gray.600}", "{colors.gray.400}"),
    subtle: semanticColor("{colors.gray.500}", "{colors.gray.300}"),
    accent: semanticColor("#687f96", "#94abc1"),
    danger: semanticColor("{colors.red.600}", "{colors.red.300}"),
    status: {
      completed: semanticColor("{colors.green.600}", "{colors.green.300}"),
      processing: semanticColor("{colors.blue.600}", "{colors.blue.300}"),
      pending: semanticColor("{colors.orange.600}", "{colors.orange.300}"),
    },
  },
  border: {
    default: semanticColor("{colors.gray.300}", "{colors.gray.600}"),
    muted: semanticColor("{colors.gray.200}", "{colors.gray.700}"),
    accent: semanticColor("#c2cfda", "#506276"),
  },
  button: {
    primary: {
      bg: semanticColor("#004e98", "#003f7a"),
      hoverBg: semanticColor("#004281", "#003565"),
      fg: semanticColor("{colors.white}", "{colors.white}"),
      divider: semanticColor("#4f82b2", "#4f82b2"),
    },
    success: {
      bg: semanticColor("#4a7c59", "#3b6347"),
      hoverBg: semanticColor("#3f6b4d", "#32553d"),
      fg: semanticColor("{colors.white}", "{colors.white}"),
    },
    subtle: {
      bg: semanticColor("#eaf1f8", "#233548"),
      hoverBg: semanticColor("#dde9f4", "#2a4159"),
      fg: semanticColor("#3a6ea5", "#9fc0e2"),
    },
  },
  switch: {
    track: {
      off: semanticColor("#d6dee7", "#485564"),
      on: semanticColor("#3a6ea5", "#2d5885"),
    },
    thumb: semanticColor("{colors.white}", "#f3f6f9"),
    label: semanticColor("{colors.gray.700}", "{colors.gray.200}"),
  },
  overlay: {
    section: semanticColor("{colors.blackAlpha.300}", "{colors.blackAlpha.450}"),
    preview: semanticColor("{colors.blackAlpha.250}", "{colors.blackAlpha.400}"),
  },
} as const;
