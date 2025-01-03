"use client";

import { Box, Center, Code } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";

export function CodeBlock({ children }: { children: any }) {
  return (
    <Center>
      <Box
        p={[2, 4]}
        maxW={"5xl"}
        w="full"
        borderWidth={"thin"}
        rounded={"3xl"}
        borderColor={useColorModeValue("gray.200", "gray.600")}
        background={useColorModeValue("gray.100", "gray.900")}
      >
        <Code fontFamily={"monospace"}>{children}</Code>
      </Box>
    </Center>
  );
}
