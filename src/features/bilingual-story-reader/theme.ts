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
    card: semanticColor("{colors.white}", "{colors.gray.800}"),
    control: semanticColor("{colors.white}", "{colors.gray.900}"),
    popover: semanticColor("{colors.white}", "{colors.gray.800}"),
    subtle: semanticColor("{colors.gray.50}", "{colors.gray.900}"),
    activeSentence: semanticColor("{colors.teal.50}", "{colors.teal.950}"),
  },
  fg: {
    default: semanticColor("{colors.gray.800}", "{colors.gray.200}"),
    muted: semanticColor("{colors.gray.600}", "{colors.gray.400}"),
    subtle: semanticColor("{colors.gray.500}", "{colors.gray.500}"),
    accent: semanticColor("{colors.teal.700}", "{colors.teal.300}"),
    warning: semanticColor("{colors.orange.600}", "{colors.orange.300}"),
  },
  border: {
    default: semanticColor("{colors.gray.300}", "{colors.gray.600}"),
    muted: semanticColor("{colors.gray.200}", "{colors.gray.700}"),
    activeSentence: semanticColor("{colors.teal.500}", "{colors.teal.300}"),
    warning: semanticColor("{colors.orange.300}", "{colors.orange.600}"),
  },
  button: {
    primary: {
      bg: semanticColor("#2f5f88", "#284f72"),
      hoverBg: semanticColor("#284f72", "#21425f"),
      fg: semanticColor("{colors.white}", "{colors.white}"),
      divider: semanticColor("#6f96b6", "#5f82a0"),
    },
    subtle: {
      bg: semanticColor("#e7eef5", "#24384a"),
      hoverBg: semanticColor("#d8e5f0", "#2b445a"),
      fg: semanticColor("#315f87", "#9dbbd5"),
      divider: semanticColor("#b7cadb", "#4a657c"),
    },
  },
  metadata: {
    bg: semanticColor("{colors.white}", "{colors.gray.900}"),
    border: semanticColor("{colors.gray.300}", "{colors.gray.600}"),
    fg: semanticColor("{colors.gray.600}", "{colors.gray.300}"),
    warningBorder: semanticColor("{colors.orange.300}", "{colors.orange.600}"),
    warningFg: semanticColor("{colors.orange.600}", "{colors.orange.300}"),
  },
} as const;
