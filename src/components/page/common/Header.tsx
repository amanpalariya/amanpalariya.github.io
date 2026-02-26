import {
  Button,
  Box,
  HStack,
  Icon,
  IconButton,
  Show,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiBookOpen,
  FiChevronLeft,
  FiFileText,
  FiGrid,
  FiHome,
  FiMoon,
  FiSun,
  FiUser,
} from "react-icons/fi";
import { HeaderCard } from "../../core/Cards";
import { usePathname } from "next/navigation";
import { getHomepageTabByPathname, homepageTabs } from "app/route-info";
import { Heading2, Heading6 } from "@components/core/Texts";
import * as pathnameUtil from "utils/pathname";
import LinkedInButton, { LinkedInButtonSmall } from "./LinkedInPrimaryButton";
import HeaderNavIconButton from "./header/HeaderNavIconButton";
import HeaderMobileTrigger from "./header/HeaderMobileTrigger";
import { useColorMode, useColorModeValue } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import NextLink from "next/link";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import { useEffect, useMemo, useRef, useState } from "react";

export const HEADER_OFFSET_HEIGHT = { base: 20, sm: 24 };

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

export default function Header() {
  const showActionButton = useBreakpointValue({ base: false, sm: true });
  const isMobile = useBreakpointValue({ base: true, sm: false }) ?? false;
  const currentPathname = usePathname() ?? "";
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuContainerRef = useRef<HTMLDivElement>(null);
  const [, isBlogsFeatureEnabled, ,] = useFeatureFlag(
    FeatureFlagsData.featuresIds.BLOGS,
  );

  function isSelectedBasedOnUrl(relativeUrl: string) {
    return pathnameUtil.doPathnamesMatch(relativeUrl, currentPathname);
  }

  const isPathnameDeep = pathnameUtil.getPathnameDepth(currentPathname) > 1;

  const parentTabPathname = pathnameUtil.trimPathnameToDepth(
    currentPathname,
    1,
  );

  const topLevelPathname = pathnameUtil.trimPathnameToDepth(currentPathname, 1);

  const topLevelTabIcon =
    {
      [homepageTabs.home.pathname]: FiHome,
      [homepageTabs.about.pathname]: FiUser,
      [homepageTabs.projects.pathname]: FiGrid,
      [homepageTabs.cv.pathname]: FiFileText,
      [homepageTabs.blogs.pathname]: FiBookOpen,
    }[topLevelPathname] ?? FiHome;

  const mobileNavItems = useMemo(
    () => [
      {
        icon: FiHome,
        label: homepageTabs.home.name,
        url: homepageTabs.home.pathname,
      },
      {
        icon: FiUser,
        label: homepageTabs.about.name,
        url: homepageTabs.about.pathname,
      },
      {
        icon: FiGrid,
        label: homepageTabs.projects.name,
        url: homepageTabs.projects.pathname,
      },
      ...(isBlogsFeatureEnabled
        ? [
            {
              icon: FiBookOpen,
              label: homepageTabs.blogs.name,
              url: homepageTabs.blogs.pathname,
            },
          ]
        : []),
    ],
    [isBlogsFeatureEnabled],
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!mobileMenuContainerRef.current?.contains(target)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isMobileMenuOpen]);

  const menuDividerColor = useColorModeValue("gray.300", "gray.600");
  const selectedMobileNavColor = useColorModeValue("gray.900", "gray.50");
  const unselectedMobileNavColor = useColorModeValue("gray.600", "gray.300");
  return (
    <Box
      position={"fixed"}
      width={"100%"}
      maxW={"3xl"}
      left={"50%"}
      transform={"translateX(-50%)"}
      zIndex={10}
    >
      <Box p={[2, 4]} ref={mobileMenuContainerRef}>
        <HeaderCard>
          <HStack justify={"space-between"}>
            {isPathnameDeep ? (
              <HStack gap={4}>
                <HeaderNavIconButton
                  icon={FiChevronLeft}
                  label="Back"
                  isSelected={false}
                  url={parentTabPathname}
                />
                <Heading2>
                  {getHomepageTabByPathname(parentTabPathname)?.name ?? ""}
                </Heading2>
              </HStack>
            ) : isMobile ? (
              <HStack gap={1}>
                <HeaderMobileTrigger
                  isOpen={isMobileMenuOpen}
                  onToggle={() => setMobileMenuOpen(!isMobileMenuOpen)}
                  tabIcon={topLevelTabIcon}
                />
              </HStack>
            ) : (
              <HStack gap={4}>
                <HeaderNavIconButton
                  icon={FiHome}
                  label={homepageTabs.home.name}
                  isSelected={isSelectedBasedOnUrl(homepageTabs.home.pathname)}
                  url={homepageTabs.home.pathname}
                />
                <HeaderNavIconButton
                  icon={FiUser}
                  label={homepageTabs.about.name}
                  isSelected={isSelectedBasedOnUrl(homepageTabs.about.pathname)}
                  url={homepageTabs.about.pathname}
                />
                <HeaderNavIconButton
                  icon={FiGrid}
                  label={homepageTabs.projects.name}
                  isSelected={isSelectedBasedOnUrl(
                    homepageTabs.projects.pathname,
                  )}
                  url={homepageTabs.projects.pathname}
                />
                <Show when={isBlogsFeatureEnabled}>
                  <HeaderNavIconButton
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

            <HStack as={"nav"} aria-label={"Primary actions"} gap={4}>
              <ColorModeToggleIconButton />
              {showActionButton ? <LinkedInButton /> : <LinkedInButtonSmall />}
            </HStack>
          </HStack>

          {isMobile && !isPathnameDeep && isMobileMenuOpen ? (
            <Stack
              as={"nav"}
              aria-label={"Mobile navigation menu"}
              borderTopWidth={2}
              borderColor={menuDividerColor}
              mt={4}
              pt={4}
              gap={2}
            >
              {mobileNavItems.map((item) => {
                const isSelected = isSelectedBasedOnUrl(item.url);

                return (
                  <Button
                    key={item.url}
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                    justifyContent={"flex-start"}
                    borderRadius={"xl"}
                    variant={isSelected ? "surface" : "ghost"}
                    color={
                      isSelected
                        ? selectedMobileNavColor
                        : unselectedMobileNavColor
                    }
                  >
                    <NextLink href={item.url}>
                      <HStack gap={2}>
                        <Icon as={item.icon} boxSize={6} />
                        <Heading6>{item.label}</Heading6>
                      </HStack>
                    </NextLink>
                  </Button>
                );
              })}
            </Stack>
          ) : undefined}
        </HeaderCard>
      </Box>
    </Box>
  );
}
