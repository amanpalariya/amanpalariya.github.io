import { createSystem, defaultConfig } from "@chakra-ui/react";
import "@fontsource/lexend";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Lexend', serif` },
        body: { value: `'Lexend', sans-serif` },
      },
    },
  },
});
