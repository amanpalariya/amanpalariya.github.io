"use client";

import { ThemeProvider } from "next-themes";
import { system } from "@config/chakra";
import { ChakraProvider } from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { useProseStyles } from "@components/article/proseStyles";
import { getAppGlobalStyles } from "./globalStyles";

export function Providers({ children }: { children: React.ReactNode }) {
  const proseStyles = useProseStyles();
  const globalStyles = getAppGlobalStyles(proseStyles);
  return (
    <ChakraProvider value={system}>
      <Global styles={globalStyles} />
      <ThemeProvider attribute="class">{children}</ThemeProvider>
    </ChakraProvider>
  );
}
