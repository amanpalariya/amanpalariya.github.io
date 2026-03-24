"use client";

import { ThemeProvider } from "next-themes";
import { system } from "@config/chakra";
import { ChakraProvider, ClientOnly } from "@chakra-ui/react";
import { Global, css } from "@emotion/react";
import { useProseStyles } from "@components/article/proseStyles";
import { getAppGlobalStyles } from "./globalStyles";

export function Providers({ children }: { children: React.ReactNode }) {
  const proseStyles = useProseStyles();
  const globalStyles = getAppGlobalStyles(proseStyles);
  return (
    <ChakraProvider value={system}>
      <Global styles={css(globalStyles)} />
      <ClientOnly>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </ClientOnly>
    </ChakraProvider>
  );
}
