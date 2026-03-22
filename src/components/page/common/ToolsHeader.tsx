"use client";

import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { HeaderCard } from "@components/core/Cards";
import { Heading4 } from "@components/core/Texts";
import { useColorMode } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import NextLink from "next/link";
import { FiHome, FiMoon, FiSun, FiTool } from "react-icons/fi";

export const TOOLS_HEADER_OFFSET_HEIGHT = { base: 20, sm: 24 };

function ColorModeToggleIconButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Tooltip content={"Toggle theme"} closeOnScroll>
      <IconButton
        onClick={toggleColorMode}
        borderRadius={"full"}
        variant={"surface"}
        aria-label={"Change color mode (dark/light)"}
      >
        <Icon boxSize={6}>{isDark ? <FiSun /> : <FiMoon />}</Icon>
      </IconButton>
    </Tooltip>
  );
}

export default function ToolsHeader() {
  return (
    <Box
      position={"fixed"}
      width={"100%"}
      maxW={"3xl"}
      left={"50%"}
      transform={"translateX(-50%)"}
      zIndex={10}
    >
      <Box p={[2, 4]}>
        <HeaderCard>
          <HStack justify={"space-between"} align={"center"} gap={4}>
            <Stack gap={0}>
              <HStack gap={2}>
                <Icon color={"app.fg.subtle"}>
                  <FiTool />
                </Icon>
                <Heading4>Tools</Heading4>
              </HStack>
              <Text color={"app.fg.subtle"} fontSize={"sm"}>
                Utility pages and experiments
              </Text>
            </Stack>

            <HStack gap={2}>
              <Button asChild variant={"surface"} size={"sm"} borderRadius={"full"}>
                <NextLink href="/">
                  <Icon>
                    <FiHome />
                  </Icon>
                  Home
                </NextLink>
              </Button>
              <ColorModeToggleIconButton />
            </HStack>
          </HStack>
        </HeaderCard>
      </Box>
    </Box>
  );
}