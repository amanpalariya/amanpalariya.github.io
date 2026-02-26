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
  return (
    <Tooltip content={label} closeOnScroll>
      <NextLink href={url ?? ""} onClick={onClick}>
        <IconButton
          borderRadius={"full"}
          borderWidth={isSelected ? "thin" : 0}
          borderColor={"app.border.default"}
          variant={isSelected ? "surface" : "ghost"}
          color={isSelected ? "app.fg.default" : "app.fg.subtle"}
          aria-label={label}
        >
          <Icon boxSize={6} as={icon} />
        </IconButton>
      </NextLink>
    </Tooltip>
  );
}
