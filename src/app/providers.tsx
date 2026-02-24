"use client";

import { ThemeProvider } from "next-themes";
import { system } from "../chakra-config";
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
        })}
      />
      <ClientOnly>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </ClientOnly>
    </ChakraProvider>
  );
}
