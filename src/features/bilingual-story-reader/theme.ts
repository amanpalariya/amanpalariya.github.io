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
      bg: semanticColor("{colors.blue.700}", "{colors.blue.300}"),
      hoverBg: semanticColor("{colors.blue.800}", "{colors.blue.400}"),
      fg: semanticColor("{colors.white}", "{colors.gray.900}"),
      divider: semanticColor("{colors.blue.500}", "{colors.blue.500}"),
    },
    subtle: {
      bg: semanticColor("{colors.teal.50}", "{colors.gray.700}"),
      hoverBg: semanticColor("{colors.teal.100}", "{colors.gray.600}"),
      fg: semanticColor("{colors.teal.700}", "{colors.teal.200}"),
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
