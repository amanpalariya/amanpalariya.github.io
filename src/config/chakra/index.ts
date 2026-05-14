import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from "@chakra-ui/react";
import { APP_SEMANTIC_COLOR_TOKENS } from "./semantic-tokens";

const separatorRecipe = defineRecipe({
  base: {
    borderColor: "app.border.muted",
  },
});

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Lexend', sans-serif" },
        ui: { value: "'Lexend', sans-serif" },
        body: { value: "'Noto Sans', sans-serif" },
        handwritten: { value: "'Caveat', cursive" },
      },
    },
    semanticTokens: {
      colors: APP_SEMANTIC_COLOR_TOKENS,
    },
    recipes: {
      separator: separatorRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
