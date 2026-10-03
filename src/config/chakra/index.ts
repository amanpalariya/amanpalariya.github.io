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
        heading: { value: "var(--font-dm-sans), sans-serif" },
        ui: { value: "var(--font-dm-sans), sans-serif" },
        body: { value: "var(--font-dm-sans), sans-serif" },
        handwritten: { value: "var(--font-handwritten), cursive" },
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
