import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { APP_SEMANTIC_COLOR_TOKENS } from "./semantic-tokens";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Lexend', sans-serif` },
        body: { value: `'Lexend', sans-serif` },
      },
    },
    semanticTokens: {
      colors: APP_SEMANTIC_COLOR_TOKENS,
    },
  },
});

export const system = createSystem(defaultConfig, config);
