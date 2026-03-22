"use client";

import { Box, Button, HStack, Icon, IconButton, Stack, Text } from "@chakra-ui/react";
import { HeaderCard } from "@components/core/Cards";
import { Heading4 } from "@components/core/Texts";
import { useColorMode } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { FiChevronLeft, FiHome, FiMoon, FiSun, FiTool } from "react-icons/fi";
import * as pathnameUtil from "utils/pathname";
import { getToolHeaderConfig } from "../data/content";

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

export function ToolsProductHeader() {
  const config = getToolHeaderConfig();
  const pathname = usePathname() ?? "/tools/";
  const isPathnameDeep = pathnameUtil.getPathnameDepth(pathname) > 1;
  const parentPathname = pathnameUtil.trimPathnameToDepth(pathname, 1);

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
            {isPathnameDeep ? (
              <HStack gap={3}>
                <Button asChild variant={"surface"} size={"sm"} borderRadius={"full"}>
                  <NextLink href={parentPathname}>
                    <Icon>
                      <FiChevronLeft />
                    </Icon>
                    Back
                  </NextLink>
                </Button>
                <Heading4>{config.productName}</Heading4>
              </HStack>
            ) : (
              <Stack gap={0}>
                <HStack gap={2}>
                  <Icon color={"app.fg.subtle"}>
                    <FiTool />
                  </Icon>
                  <Heading4>{config.productName}</Heading4>
                </HStack>
                <Text color={"app.fg.subtle"} fontSize={"sm"}>
                  {config.productTagline}
                </Text>
              </Stack>
            )}

            <HStack gap={2}>
              <Button asChild variant={"surface"} size={"sm"} borderRadius={"full"}>
                <NextLink href={config.homeHref}>
                  <Icon>
                    <FiHome />
                  </Icon>
                  Home
                </NextLink>
              </Button>
              {isPathnameDeep ? null : (
                <Button asChild variant={"surface"} size={"sm"} borderRadius={"full"}>
                  <NextLink href="/tools/">All tools</NextLink>
                </Button>
              )}
              {config.showThemeToggle ? <ColorModeToggleIconButton /> : null}
            </HStack>
          </HStack>
        </HeaderCard>
      </Box>
    </Box>
  );
}
