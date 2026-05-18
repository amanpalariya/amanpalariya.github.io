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
  accent: {
    solid: semanticColor("#2f5f88", "#284f72"),
    solidHover: semanticColor("#284f72", "#21425f"),
    solidDivider: semanticColor("#6f96b6", "#5f82a0"),
    soft: semanticColor("#e7eef5", "#24384a"),
    softHover: semanticColor("#d8e5f0", "#2b445a"),
    softDivider: semanticColor("#b7cadb", "#4a657c"),
    fg: semanticColor("#315f87", "#9dbbd5"),
    contrastFg: semanticColor("{colors.white}", "{colors.white}"),
  },
  bg: {
    card: semanticColor("{colors.white}", "{colors.gray.800}"),
    control: semanticColor("{colors.white}", "{colors.gray.900}"),
    popover: semanticColor("{colors.white}", "{colors.gray.800}"),
    subtle: semanticColor("{colors.gray.50}", "{colors.gray.900}"),
    activeSentence: semanticColor("#e7eef5", "#24384a"),
  },
  fg: {
    default: semanticColor("{colors.gray.800}", "{colors.gray.200}"),
    muted: semanticColor("{colors.gray.600}", "{colors.gray.400}"),
    subtle: semanticColor("{colors.gray.500}", "{colors.gray.500}"),
    accent: semanticColor("#315f87", "#9dbbd5"),
    warning: semanticColor("{colors.orange.600}", "{colors.orange.300}"),
  },
  border: {
    default: semanticColor("{colors.gray.300}", "{colors.gray.600}"),
    muted: semanticColor("{colors.gray.200}", "{colors.gray.700}"),
    activeSentence: semanticColor("#6f96b6", "#5f82a0"),
    warning: semanticColor("{colors.orange.300}", "{colors.orange.600}"),
  },
  button: {
    primary: {
      bg: semanticColor("{colors.app.bilingualStoryReader.accent.solid}", "{colors.app.bilingualStoryReader.accent.solid}"),
      hoverBg: semanticColor("{colors.app.bilingualStoryReader.accent.solidHover}", "{colors.app.bilingualStoryReader.accent.solidHover}"),
      fg: semanticColor("{colors.app.bilingualStoryReader.accent.contrastFg}", "{colors.app.bilingualStoryReader.accent.contrastFg}"),
      divider: semanticColor("{colors.app.bilingualStoryReader.accent.solidDivider}", "{colors.app.bilingualStoryReader.accent.solidDivider}"),
    },
    subtle: {
      bg: semanticColor("{colors.app.bilingualStoryReader.accent.soft}", "{colors.app.bilingualStoryReader.accent.soft}"),
      hoverBg: semanticColor("{colors.app.bilingualStoryReader.accent.softHover}", "{colors.app.bilingualStoryReader.accent.softHover}"),
      fg: semanticColor("{colors.app.bilingualStoryReader.accent.fg}", "{colors.app.bilingualStoryReader.accent.fg}"),
      divider: semanticColor("{colors.app.bilingualStoryReader.accent.softDivider}", "{colors.app.bilingualStoryReader.accent.softDivider}"),
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
