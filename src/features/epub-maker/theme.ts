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
    preview: semanticColor("{colors.gray.100}", "{colors.gray.950}"),
  },
  fg: {
    default: semanticColor("{colors.gray.800}", "{colors.gray.200}"),
    muted: semanticColor("{colors.gray.600}", "{colors.gray.400}"),
    subtle: semanticColor("{colors.gray.500}", "{colors.gray.300}"),
    accent: semanticColor("{colors.blue.500}", "{colors.blue.400}"),
    danger: semanticColor("{colors.red.600}", "{colors.red.300}"),
  },
  border: {
    default: semanticColor("{colors.gray.300}", "{colors.gray.700}"),
    muted: semanticColor("{colors.gray.200}", "{colors.gray.800}"),
    accent: semanticColor("{colors.blue.400}", "{colors.blue.500}"),
  },
  button: {
    primary: {
      bg: semanticColor("{colors.blue.600}", "{colors.blue.400}"),
      hoverBg: semanticColor("{colors.blue.700}", "{colors.blue.500}"),
      fg: semanticColor("{colors.white}", "{colors.gray.900}"),
    },
    success: {
      bg: semanticColor("{colors.green.600}", "{colors.green.600}"),
      hoverBg: semanticColor("{colors.green.600}", "{colors.green.600}"),
      fg: semanticColor("{colors.white}", "{colors.gray.900}"),
    },
    subtle: {
      bg: semanticColor("{colors.blue.50}", "{colors.blue.900}"),
      hoverBg: semanticColor("{colors.blue.100}", "{colors.blue.800}"),
      fg: semanticColor("{colors.blue.700}", "{colors.blue.200}"),
    },
  },
} as const;
