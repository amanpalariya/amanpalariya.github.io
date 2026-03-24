import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { APP_SEMANTIC_COLOR_TOKENS } from "./semantic-tokens";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-lexend), sans-serif" },
        ui: { value: "var(--font-lexend), sans-serif" },
        body: { value: "var(--font-noto-sans), sans-serif" },
      },
    },
    semanticTokens: {
      colors: APP_SEMANTIC_COLOR_TOKENS,
    },
  },
});

export const system = createSystem(defaultConfig, config);
