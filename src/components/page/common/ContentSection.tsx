import { Box, type BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

/** Flat sections reach across the main column's 16px content inset. */
export default function ContentSection({
  children,
  ...props
}: Omit<BoxProps, "children"> & { children: ReactNode }) {
  return (
    <Box
      as="section"
      borderTop="1px solid var(--site-line)"
      background="app.bg.canvas"
      color="app.prose.body"
      mx={-4}
      px={4}
      py={4}
      {...props}
    >
      {children}
    </Box>
  );
}
