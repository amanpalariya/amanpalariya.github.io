"use client";

import { Box, HStack, Icon, IconButton } from "@chakra-ui/react";
import { HeaderCard } from "@components/core/Cards";
import { Heading3 } from "@components/core/Texts";
import { useColorMode } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { FiChevronLeft, FiHome, FiMoon, FiSun, FiTool } from "react-icons/fi";
import * as pathnameUtil from "utils/pathname";
import { getToolHeaderConfig } from "../data/content";
import { getAllTools } from "../data/tools-registry";

function getToolsHeaderTitle(pathname: string) {
  if (pathnameUtil.getPathnameDepth(pathname) <= 1) {
    return getToolHeaderConfig().productName;
  }

  const canonicalPathname = pathnameUtil.getCanonicalPathname(pathname);
  const tools = getAllTools();
  const activeTool = tools.find((tool) => canonicalPathname.startsWith(tool.path));

  return activeTool?.name ?? getToolHeaderConfig().productName;
}

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
  const headerTitle = getToolsHeaderTitle(pathname);

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
            <HStack gap={3}>
              {isPathnameDeep ? (
                <Tooltip content={"Back"} closeOnScroll>
                  <NextLink href={parentPathname}>
                    <IconButton
                      borderRadius={"full"}
                      variant={"ghost"}
                      color={"app.fg.subtle"}
                      aria-label={"Back"}
                    >
                      <Icon as={FiChevronLeft} boxSize={6} />
                    </IconButton>
                  </NextLink>
                </Tooltip>
              ) : (
                <Icon color={"app.fg.subtle"} boxSize={7}>
                  <FiTool />
                </Icon>
              )}

              <Heading3>{headerTitle}</Heading3>
            </HStack>

            <HStack gap={2}>
              {config.showThemeToggle ? <ColorModeToggleIconButton /> : null}
              <Tooltip content={"Home"} closeOnScroll>
                <NextLink href={config.homeHref}>
                  <IconButton
                    borderRadius={"full"}
                    variant={"surface"}
                    aria-label={"Home"}
                  >
                    <Icon as={FiHome} boxSize={6} />
                  </IconButton>
                </NextLink>
              </Tooltip>
            </HStack>
          </HStack>
        </HeaderCard>
      </Box>
    </Box>
  );
}
