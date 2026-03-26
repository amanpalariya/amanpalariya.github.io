import { Icon, IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import type { IconType } from "react-icons";
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
      <IconButton
        asChild
        borderRadius={"full"}
        borderWidth={isSelected ? "thin" : 0}
        borderColor={"app.border.default"}
        variant={isSelected ? "surface" : "ghost"}
        color={isSelected ? "app.fg.default" : "app.fg.subtle"}
      >
        <NextLink
          href={url ?? ""}
          onClick={onClick}
          aria-label={label}
          aria-current={isSelected ? "page" : undefined}
        >
          <Icon boxSize={6} as={icon} />
        </NextLink>
      </IconButton>
    </Tooltip>
  );
}
