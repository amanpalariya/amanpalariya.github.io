export interface AppSemanticTokenDefinition {
  value:
    | string
    | {
        base: string;
        _dark: string;
      };
  description?: string;
}

const semanticColor = (
  base: string,
  dark: string,
  description?: string,
): AppSemanticTokenDefinition => ({
  value: { base, _dark: dark },
  ...(description ? { description } : {}),
});

export const APP_SEMANTIC_COLOR_TOKENS = {
  app: {
    bg: {
      canvas: semanticColor("{colors.gray.100}", "{colors.gray.900}"),
      surface: semanticColor("{colors.gray.200}", "{colors.gray.800}"),
      card: semanticColor("{colors.white}", "{colors.black}"),
      cardHeader: semanticColor("{colors.gray.50}", "{colors.gray.950}"),
      overlay: semanticColor("{colors.gray.100}", "{colors.gray.900}"),
    },
    fg: {
      default: semanticColor("{colors.gray.800}", "{colors.gray.200}"),
      muted: semanticColor("{colors.gray.700}", "{colors.gray.300}"),
      subtle: semanticColor("{colors.gray.600}", "{colors.gray.400}"),
      link: semanticColor("{colors.teal.600}", "{colors.teal.400}"),
      linkHover: semanticColor("{colors.teal.700}", "{colors.teal.300}"),
      icon: semanticColor("{colors.gray.500}", "{colors.gray.500}"),
      inverse: semanticColor("{colors.gray.100}", "{colors.gray.900}"),
    },
    border: {
      default: semanticColor("{colors.gray.300}", "{colors.gray.700}"),
      muted: semanticColor("{colors.gray.200}", "{colors.gray.800}"),
      strong: semanticColor("{colors.gray.400}", "{colors.gray.500}"),
      accent: semanticColor("{colors.blue.300}", "{colors.blue.700}"),
    },
    status: {
      info: {
        bg: semanticColor("{colors.blue.100}", "{colors.blue.900}"),
        fg: semanticColor("{colors.blue.600}", "{colors.blue.400}"),
      },
      success: {
        bg: semanticColor("{colors.green.100}", "{colors.green.900}"),
        fg: semanticColor("{colors.green.600}", "{colors.green.400}"),
      },
      warning: {
        bg: semanticColor("{colors.orange.100}", "{colors.orange.900}"),
        fg: semanticColor("{colors.orange.600}", "{colors.orange.400}"),
      },
      danger: {
        bg: semanticColor("{colors.red.100}", "{colors.red.900}"),
        fg: semanticColor("{colors.red.600}", "{colors.red.400}"),
      },
      neutral: {
        bg: semanticColor("{colors.gray.200}", "{colors.gray.800}"),
        fg: semanticColor("{colors.gray.600}", "{colors.gray.400}"),
      },
    },
    prose: {
      heading: semanticColor("{colors.gray.800}", "{colors.gray.200}"),
      body: semanticColor("{colors.gray.700}", "{colors.gray.300}"),
      subtle: semanticColor("{colors.gray.600}", "{colors.gray.400}"),
      link: semanticColor("{colors.teal.600}", "{colors.teal.400}"),
      linkHover: semanticColor("{colors.teal.700}", "{colors.teal.300}"),
      codeBg: semanticColor("{colors.gray.100}", "{colors.gray.900}"),
      preBg: semanticColor("{colors.gray.50}", "{colors.gray.950}"),
      inlineCodeBg: semanticColor(
        "{colors.gray.100}",
        "{colors.whiteAlpha.200}",
      ),
      inlineCodeFg: semanticColor("{colors.gray.800}", "{colors.gray.200}"),
      border: semanticColor("{colors.gray.300}", "{colors.gray.700}"),
    },
    brand: {
      linkedin: {
        solid: semanticColor("#0077B5", "#60B0DC"),
        soft: semanticColor("{colors.blue.100}", "{colors.blue.900}"),
        contrast: semanticColor("{colors.gray.100}", "{colors.gray.900}"),
      },
      twitter: {
        solid: semanticColor("#1DA1F2", "#60C2F7"),
        soft: semanticColor("{colors.blue.100}", "{colors.blue.900}"),
        contrast: semanticColor("{colors.gray.100}", "{colors.gray.900}"),
      },
      instagram: {
        solid: semanticColor("#E1306C", "#EE6F98"),
        soft: semanticColor("{colors.pink.100}", "{colors.pink.900}"),
        contrast: semanticColor("{colors.gray.100}", "{colors.gray.900}"),
      },
      github: {
        solid: semanticColor("{colors.gray.800}", "{colors.gray.200}"),
        soft: semanticColor("{colors.gray.200}", "{colors.gray.800}"),
        contrast: semanticColor("{colors.gray.100}", "{colors.gray.900}"),
      },
    },
    syntax: {
      comment: semanticColor("{colors.gray.500}", "{colors.gray.500}"),
      keyword: semanticColor("{colors.purple.600}", "{colors.purple.400}"),
      string: semanticColor("{colors.green.600}", "{colors.green.400}"),
      number: semanticColor("{colors.orange.500}", "{colors.orange.500}"),
      function: semanticColor("{colors.blue.600}", "{colors.blue.400}"),
    },
  },
} as const;
