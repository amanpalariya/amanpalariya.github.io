import { createSystem, defaultConfig } from "@chakra-ui/react";
import "@fontsource/lexend";
import { APP_SEMANTIC_COLOR_TOKENS } from "theme/colors";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Lexend', serif` },
        body: { value: `'Lexend', sans-serif` },
      },
    },
    semanticTokens: {
      colors: APP_SEMANTIC_COLOR_TOKENS,
    },
  },
});
