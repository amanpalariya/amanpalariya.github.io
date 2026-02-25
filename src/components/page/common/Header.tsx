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
  FiGrid,
  FiHome,
  FiMenu,
  FiMoon,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi";
import { HeaderCard } from "../../core/Cards";
import { usePathname } from "next/navigation";
import { getHomepageTabByPathname, homepageTabs } from "app/route-info";
import { Heading2, Heading6 } from "@components/core/Texts";
import * as pathnameUtil from "utils/pathname";
import LinkedInButton, { LinkedInButtonSmall } from "./LinkedInPrimaryButton";
import { useColorMode, useColorModeValue } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import NextLink from "next/link";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import type { IconType } from "react-icons";
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

function HeaderIconButton({
  icon,
  label,
  url,
  isSelected = false,
  onClick,
}: {
  icon: IconType;
  label: string;
  url?: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const selectedColor = useColorModeValue("gray.900", "gray.50");
  const unSelectedColor = useColorModeValue("gray.500", "gray.300");

  return (
    <Tooltip content={label} closeOnScroll>
      <IconButton
        as={NextLink}
        href={url ?? ""}
        borderRadius={"full"}
        borderWidth={"thick"}
        variant={isSelected ? "surface" : "ghost"}
        color={isSelected ? selectedColor : unSelectedColor}
        aria-label={label}
        onClick={onClick}
      >
        <Icon boxSize={6} as={icon} />
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
            ) : isMobile ? (
              <HStack gap={1}>
                <Button
                  px={3}
                  borderRadius={"full"}
                  variant={isMobileMenuOpen ? "surface" : "outline"}
                  aria-label={
                    isMobileMenuOpen
                      ? "Close mobile navigation menu"
                      : "Open mobile navigation menu"
                  }
                  onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <HStack gap={2}>
                    <Icon boxSize={6}>
                      {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                    </Icon>
                    <Icon as={topLevelTabIcon} boxSize={6} />
                  </HStack>
                </Button>
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

            <HStack as={"nav"} aria-label={"Primary actions"} gap={4}>
              <ColorModeToggleIconButton />
              {showActionButton ? <LinkedInButton /> : <LinkedInButtonSmall />}
            </HStack>
          </HStack>

          {isMobile && !isPathnameDeep && isMobileMenuOpen ? (
            <Stack
              as={"nav"}
              aria-label={"Mobile navigation menu"}
              borderTopWidth={1}
              borderColor={menuDividerColor}
              mt={4}
              pt={4}
              gap={3}
            >
              {mobileNavItems.map((item) => {
                const isSelected = isSelectedBasedOnUrl(item.url);

                return (
                  <Button
                    key={item.url}
                    as={NextLink}
                    href={item.url}
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
                    <HStack gap={2}>
                      <Icon as={item.icon} boxSize={6} />
                      <Heading6>{item.label}</Heading6>
                    </HStack>
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
