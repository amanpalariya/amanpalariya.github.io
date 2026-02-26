import { Badge, HStack, Icon, Text } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";

export function StatusBadge({
  children,
  compact = false,
  color = "gray",
}: {
  children?: string;
  color?: "red" | "blue" | "yellow" | "green" | "gray" | "purple" | "orange";
  compact?: boolean;
}) {
  compact = compact || !children;

  return (
    <Badge
      colorPalette={color}
      background={"colorPalette.subtle"}
      color={"colorPalette.fg"}
      px={2}
      py={compact ? 2 : 1}
      rounded={"full"}
    >
      <HStack gap={1.5}>
        <Icon boxSize={1.5}>
          <FaCircle />
        </Icon>
        {compact ? null : (
          <Text as={"pre"} fontWeight={"bold"}>
            {children?.toUpperCase()}
          </Text>
        )}
      </HStack>
    </Badge>
  );
}

export function CategoryBadge({
  children,
  color = "gray",
}: {
  children?: string;
  color?: "red" | "blue" | "yellow" | "green" | "gray" | "purple" | "orange";
}) {
  return (
    <Badge
      colorPalette={color}
      background={"colorPalette.muted"}
      color={"colorPalette.fg"}
      px={2}
      py={0.5}
      rounded={"full"}
    >
      <Text as={"pre"} fontSize={"xs"} letterSpacing={"wide"}>
        {children?.toUpperCase()}
      </Text>
    </Badge>
  );
}
