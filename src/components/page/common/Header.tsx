import {
  Box,
  HStack,
  Icon,
  IconButton,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import {
  FiChevronLeft,
  FiGrid,
  FiHome,
  FiMoon,
  FiSun,
  FiUser,
} from "react-icons/fi";
import { PrimaryActionButton } from "../../core/Buttons";
import { HeaderCard } from "../../core/Cards";
import { usePathname } from "next/navigation";
import { getHomepageTabByPathname, homepageTabs } from "app/route-info";
import { Heading2 } from "@components/core/Texts";
import * as pathnameUtil from "utils/pathname";
import LinkedInButton, { LinkedInButtonSmall } from "./LinkedInPrimaryButton";

function ColorModeToggleIconButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Tooltip label={"Toggle theme"} closeOnScroll>
      <IconButton
        onClick={toggleColorMode}
        borderRadius={"50%"}
        variant={"outline"}
        icon={<Icon as={isDark ? FiSun : FiMoon} boxSize={6} />}
        aria-label={"Change color mode (dark/light)"}
      />
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
  const unSelectedColor = useColorModeValue("gray.500", "gray.500");

  return (
    <Tooltip label={label} closeOnScroll>
      <Link href={url ?? ""} rounded={"full"}>
        <IconButton
          as={"a"}
          borderRadius={"full"}
          borderWidth={isSelected ? "thin" : "none"}
          variant={isSelected ? "solid" : "ghost"}
          color={isSelected ? selectedColor : unSelectedColor}
          icon={<Icon as={icon} boxSize={6} />}
          aria-label={label}
        />
      </Link>
    </Tooltip>
  );
}

export default function Header() {
  const showActionButton = useBreakpointValue({ base: false, sm: true });
  const currentPathname = usePathname() ?? "";

  function isSelectedBasedOnUrl(relativeUrl) {
    return pathnameUtil.doPathnamesMatch(relativeUrl, currentPathname);
  }

  const isPathnameDeep = pathnameUtil.getPathnameDepth(currentPathname) > 1;

  const parentTabPathname = pathnameUtil.trimPathnameToDepth(
    currentPathname,
    1,
  );

  return (
    <Box position={"fixed"} width={"full"} maxW={"container.md"} zIndex={10}>
      <Box p={[2, 4]}>
        <HeaderCard>
          <HStack justify={"space-between"}>
            {isPathnameDeep ? (
              <HStack spacing={4}>
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
              <HStack spacing={4}>
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
                  label={homepageTabs.project.name}
                  isSelected={isSelectedBasedOnUrl(
                    homepageTabs.project.pathname,
                  )}
                  url={homepageTabs.project.pathname}
                />
              </HStack>
            )}

            <HStack spacing={4}>
              <ColorModeToggleIconButton />
              {showActionButton ? <LinkedInButton /> : <LinkedInButtonSmall />}
            </HStack>
          </HStack>
        </HeaderCard>
      </Box>
    </Box>
  );
}
