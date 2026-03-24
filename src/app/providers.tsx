"use client";

import { ThemeProvider } from "next-themes";
import { system } from "@config/chakra";
import { ChakraProvider, ClientOnly } from "@chakra-ui/react";
import { Global, css } from "@emotion/react";
import { useProseStyles } from "@components/article/proseStyles";

export function Providers({ children }: { children: React.ReactNode }) {
  const proseStyles = useProseStyles();
  return (
    <ChakraProvider value={system}>
      <Global
        styles={css({
          ".prose-content": proseStyles,
          ".handwritten": {
            fontFamily: "'Caveat', cursive",
            fontWeight: 500,
            letterSpacing: "0.01em",
          },
          ".prose-content p .handwritten, .prose-content li .handwritten, .prose-content blockquote .handwritten, .prose-content td .handwritten, .prose-content th .handwritten":
            {
              fontSize: "1.08em",
              lineHeight: 1,
            },
          ".prose-content h1 .handwritten, .prose-content h2 .handwritten, .prose-content h3 .handwritten, .prose-content h4 .handwritten, .prose-content h5 .handwritten, .prose-content h6 .handwritten":
            {
              fontSize: "1.16em",
              lineHeight: 1,
            },
          ".prose-content h4 .handwritten, .prose-content h5 .handwritten, .prose-content h6 .handwritten":
            {
              fontWeight: 600,
            },
          ".prose-content h1 .handwritten, .prose-content h2 .handwritten, .prose-content h3 .handwritten":
            {
              fontWeight: 700,
            },
          ".handwritten-squiggle": {
            textDecorationLine: "underline",
            textDecorationStyle: "wavy",
            textDecorationThickness: "0.09em",
            textUnderlineOffset: "0.11em",
            textDecorationSkipInk: "none",
            textDecorationColor:
              "var(--handwritten-squiggle-color, currentColor)",
          },
          ".squiggle-teal": {
            "--handwritten-squiggle-color": "var(--chakra-colors-teal-500)",
          },
          ".squiggle-blue": {
            "--handwritten-squiggle-color": "var(--chakra-colors-blue-500)",
          },
          ".squiggle-orange": {
            "--handwritten-squiggle-color": "var(--chakra-colors-orange-500)",
          },
          ".squiggle-pink": {
            "--handwritten-squiggle-color": "var(--chakra-colors-pink-500)",
          },
          ".squiggle-gray": {
            "--handwritten-squiggle-color": "var(--chakra-colors-gray-500)",
          },
        })}
      />
      <ClientOnly>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </ClientOnly>
    </ChakraProvider>
  );
}
