import { Button, Box, Icon } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";
import { FiMenu, FiX } from "react-icons/fi";
import type { IconType } from "react-icons";

export default function HeaderMobileTrigger({
  isOpen,
  onToggle,
  tabIcon,
}: {
  isOpen: boolean;
  onToggle: () => void;
  tabIcon: IconType;
}) {
  const mobileIconBlendBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Button
      px={2}
      borderRadius={"full"}
      borderWidth={2}
      variant={isOpen ? "surface" : "outline"}
      transition={"width 0.24s ease"}
      aria-label={
        isOpen ? "Close mobile navigation menu" : "Open mobile navigation menu"
      }
      onClick={onToggle}
    >
      <Box
        borderRadius={"full"}
        zIndex={1}
        px={1}
        bg={isOpen ? "transparent" : mobileIconBlendBg}
      >
        <Icon as={tabIcon} boxSize={6} />
      </Box>

      <Box
        marginLeft={isOpen ? 0 : -4}
        borderColor={"transparent"}
        paddingRight={1}
        borderRadius={"full"}
        transition={"margin 0.24s ease, transform 0.24s ease"}
      >
        <Icon boxSize={6}>{isOpen ? <FiX /> : <FiMenu />}</Icon>
      </Box>
    </Button>
  );
}
