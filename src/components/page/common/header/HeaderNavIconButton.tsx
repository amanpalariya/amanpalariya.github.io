import { Icon, IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import type { IconType } from "react-icons";
import { useColorModeValue } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";

export default function HeaderNavIconButton({
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
