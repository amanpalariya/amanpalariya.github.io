import type { SemanticColorTokenKey } from "./types";

export interface AppSemanticTokenDefinition {
  value: {
    _light: string;
    _dark: string;
  };
}

export type AppSemanticTokens = Record<
  SemanticColorTokenKey,
  AppSemanticTokenDefinition
>;

export const APP_SEMANTIC_COLOR_TOKENS: AppSemanticTokens = {
  "app.bg.canvas": { value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" } },
  "app.bg.surface": { value: { _light: "{colors.white}", _dark: "{colors.gray.800}" } },
  "app.bg.surfaceMuted": { value: { _light: "{colors.gray.50}", _dark: "{colors.gray.700}" } },
  "app.bg.card": { value: { _light: "{colors.white}", _dark: "{colors.gray.800}" } },
  "app.bg.cardHeader": { value: { _light: "{colors.gray.50}", _dark: "{colors.gray.700}" } },
  "app.bg.overlay": { value: { _light: "{colors.white}", _dark: "{colors.gray.900}" } },

  "app.fg.default": { value: { _light: "{colors.gray.800}", _dark: "{colors.whiteAlpha.900}" } },
  "app.fg.muted": { value: { _light: "{colors.gray.700}", _dark: "{colors.gray.200}" } },
  "app.fg.subtle": { value: { _light: "{colors.gray.600}", _dark: "{colors.gray.400}" } },
  "app.fg.link": { value: { _light: "{colors.teal.600}", _dark: "{colors.teal.300}" } },
  "app.fg.linkHover": { value: { _light: "{colors.teal.700}", _dark: "{colors.teal.200}" } },
  "app.fg.icon": { value: { _light: "{colors.gray.500}", _dark: "{colors.gray.300}" } },
  "app.fg.inverse": { value: { _light: "{colors.white}", _dark: "{colors.gray.900}" } },

  "app.border.default": { value: { _light: "{colors.gray.300}", _dark: "{colors.gray.600}" } },
  "app.border.muted": { value: { _light: "{colors.gray.200}", _dark: "{colors.gray.700}" } },
  "app.border.strong": { value: { _light: "{colors.gray.400}", _dark: "{colors.gray.500}" } },
  "app.border.accent": { value: { _light: "{colors.blue.300}", _dark: "{colors.blue.500}" } },

  "app.status.info.bg": { value: { _light: "{colors.blue.100}", _dark: "{colors.blue.800}" } },
  "app.status.info.fg": { value: { _light: "{colors.blue.600}", _dark: "{colors.blue.200}" } },
  "app.status.success.bg": { value: { _light: "{colors.green.100}", _dark: "{colors.green.800}" } },
  "app.status.success.fg": { value: { _light: "{colors.green.600}", _dark: "{colors.green.200}" } },
  "app.status.warning.bg": { value: { _light: "{colors.orange.100}", _dark: "{colors.orange.800}" } },
  "app.status.warning.fg": { value: { _light: "{colors.orange.600}", _dark: "{colors.orange.200}" } },
  "app.status.danger.bg": { value: { _light: "{colors.red.100}", _dark: "{colors.red.800}" } },
  "app.status.danger.fg": { value: { _light: "{colors.red.600}", _dark: "{colors.red.200}" } },
  "app.status.neutral.bg": { value: { _light: "{colors.gray.100}", _dark: "{colors.gray.800}" } },
  "app.status.neutral.fg": { value: { _light: "{colors.gray.600}", _dark: "{colors.gray.200}" } },

  "app.prose.heading": { value: { _light: "{colors.gray.800}", _dark: "{colors.whiteAlpha.900}" } },
  "app.prose.body": { value: { _light: "{colors.gray.700}", _dark: "{colors.gray.200}" } },
  "app.prose.subtle": { value: { _light: "{colors.gray.600}", _dark: "{colors.gray.400}" } },
  "app.prose.link": { value: { _light: "{colors.teal.600}", _dark: "{colors.teal.300}" } },
  "app.prose.linkHover": { value: { _light: "{colors.teal.700}", _dark: "{colors.teal.200}" } },
  "app.prose.codeBg": { value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" } },
  "app.prose.preBg": { value: { _light: "{colors.gray.50}", _dark: "{colors.gray.900}" } },
  "app.prose.inlineCodeBg": { value: { _light: "{colors.gray.100}", _dark: "{colors.whiteAlpha.200}" } },
  "app.prose.inlineCodeFg": { value: { _light: "{colors.gray.800}", _dark: "{colors.whiteAlpha.900}" } },
  "app.prose.border": { value: { _light: "{colors.gray.200}", _dark: "{colors.gray.700}" } },

  "app.brand.linkedin.solid": { value: { _light: "#0077B5", _dark: "#70C0EC" } },
  "app.brand.linkedin.soft": { value: { _light: "{colors.blue.100}", _dark: "{colors.blue.800}" } },
  "app.brand.linkedin.contrast": { value: { _light: "{colors.white}", _dark: "{colors.gray.900}" } },

  "app.syntax.comment": { value: { _light: "{colors.gray.500}", _dark: "{colors.gray.400}" } },
  "app.syntax.keyword": { value: { _light: "{colors.purple.600}", _dark: "{colors.purple.300}" } },
  "app.syntax.string": { value: { _light: "{colors.green.600}", _dark: "{colors.green.300}" } },
  "app.syntax.number": { value: { _light: "{colors.orange.500}", _dark: "{colors.orange.300}" } },
  "app.syntax.function": { value: { _light: "{colors.blue.600}", _dark: "{colors.blue.300}" } },
};

export function getSemanticColor(path: SemanticColorTokenKey): SemanticColorTokenKey {
  return path;
}
