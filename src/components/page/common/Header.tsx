import {
  Box,
  HStack,
  Icon,
  IconButton,
  Link,
  Show,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiBookOpen,
  FiChevronLeft,
  FiGrid,
  FiHome,
  FiMoon,
  FiSun,
  FiUser,
} from "react-icons/fi";
import { HeaderCard } from "../../core/Cards";
import { usePathname } from "next/navigation";
import { getHomepageTabByPathname, homepageTabs } from "app/route-info";
import { Heading2 } from "@components/core/Texts";
import * as pathnameUtil from "utils/pathname";
import LinkedInButton, { LinkedInButtonSmall } from "./LinkedInPrimaryButton";
import { useColorMode, useColorModeValue } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import React from "react";
import NextLink from "next/link";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";

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

function HeaderIconButton({
  icon,
  label,
  url,
  isSelected = false,
}: {
  icon: any;
  label: string;
  url?: string;
  isSelected?: boolean;
}) {
  const selectedColor = useColorModeValue("gray.900", "gray.50");
  const unSelectedColor = useColorModeValue("gray.500", "gray.300");

  return (
    <Tooltip content={label} closeOnScroll>
      <Link rounded={"full"} as={NextLink} href={url ?? ""}>
        <IconButton
          borderRadius={"full"}
          borderWidth={"thick"}
          variant={isSelected ? "surface" : "ghost"}
          color={isSelected ? selectedColor : unSelectedColor}
          aria-label={label}
        >
          <Icon boxSize={6}>{React.createElement(icon)}</Icon>
        </IconButton>
      </Link>
    </Tooltip>
  );
}

export default function Header() {
  const showActionButton = useBreakpointValue({ base: false, sm: true });
  const currentPathname = usePathname() ?? "";
  const [, isBlogsFeatureEnabled, ,] = useFeatureFlag(
    FeatureFlagsData.featuresIds.BLOGS,
  );

  function isSelectedBasedOnUrl(relativeUrl) {
    return pathnameUtil.doPathnamesMatch(relativeUrl, currentPathname);
  }

  const isPathnameDeep = pathnameUtil.getPathnameDepth(currentPathname) > 1;

  const parentTabPathname = pathnameUtil.trimPathnameToDepth(
    currentPathname,
    1,
  );

  return (
    <Box position={"fixed"} width={"100%"} maxW={"3xl"} zIndex={10}>
      <Box p={[2, 4]}>
        <HeaderCard>
          <HStack justify={"space-between"}>
            {isPathnameDeep ? (
              <HStack gap={4}>
                <HeaderIconButton
                  icon={FiChevronLeft}
                  label="Back"
                  isSelected={false}
                  url={parentTabPathname}
                />
                <Heading2>
                  {getHomepageTabByPathname(parentTabPathname)?.name ?? ""}
                </Heading2>
              </HStack>
            ) : (
              <HStack gap={4}>
                <HeaderIconButton
                  icon={FiHome}
                  label={homepageTabs.home.name}
                  isSelected={isSelectedBasedOnUrl(homepageTabs.home.pathname)}
                  url={homepageTabs.home.pathname}
                />
                <HeaderIconButton
                  icon={FiUser}
                  label={homepageTabs.about.name}
                  isSelected={isSelectedBasedOnUrl(homepageTabs.about.pathname)}
                  url={homepageTabs.about.pathname}
                />
                <HeaderIconButton
                  icon={FiGrid}
                  label={homepageTabs.projects.name}
                  isSelected={isSelectedBasedOnUrl(
                    homepageTabs.projects.pathname,
                  )}
                  url={homepageTabs.projects.pathname}
                />
                <Show when={isBlogsFeatureEnabled}>
                  <HeaderIconButton
                    icon={FiBookOpen}
                    label={homepageTabs.blogs.name}
                    isSelected={isSelectedBasedOnUrl(
                      homepageTabs.blogs.pathname,
                    )}
                    url={homepageTabs.blogs.pathname}
                  />
                </Show>
              </HStack>
            )}

            <HStack gap={4}>
              <ColorModeToggleIconButton />
              {showActionButton ? <LinkedInButton /> : <LinkedInButtonSmall />}
            </HStack>
          </HStack>
        </HeaderCard>
      </Box>
    </Box>
  );
}
