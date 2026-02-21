"use client";

import { Box, Center, Code } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";

export function CodeBlock({ children }: { children: any }) {
  return (
    <Center>
      <Box
        p={[3, 5]}
        maxW={"5xl"}
        w="full"
        borderWidth={"1px"}
        rounded={"2xl"}
        borderColor={useColorModeValue("gray.200", "gray.700")}
        background={useColorModeValue("gray.50", "gray.900")}
        overflowX="auto"
      >
        <Code
          fontFamily={"mono"}
          fontSize={{ base: "sm", md: "md" }}
          lineHeight="tall"
          color={useColorModeValue("gray.800", "whiteAlpha.900")}
          whiteSpace="pre"
          display="block"
        >
          {children}
        </Code>
      </Box>
    </Center>
  );
}
