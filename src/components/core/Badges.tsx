import { Badge, HStack, Icon, Text } from "@chakra-ui/react";
import { Tooltip } from "@components/ui/tooltip";
import { FaCircle } from "react-icons/fa";
import { FiStar } from "react-icons/fi";

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
          <Text as={"pre"} fontFamily={"ui"} fontWeight={"bold"}>
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
      <Text
        as={"pre"}
        fontFamily={"mono"}
        fontSize={"xs"}
        letterSpacing={"wide"}
      >
        {children?.toUpperCase()}
      </Text>
    </Badge>
  );
}

export function FeaturedIndicator({
  label = "Featured",
  colorPalette = "orange",
}: {
  label?: string;
  colorPalette?:
    | "red"
    | "blue"
    | "yellow"
    | "green"
    | "gray"
    | "purple"
    | "orange";
}) {
  return (
    <Tooltip content={label}>
      <Badge
        colorPalette={colorPalette}
        background={"transparent"}
        color={"colorPalette.fg"}
        px={1}
        py={1}
        rounded={"full"}
      >
        <Icon as={FiStar} boxSize={3.5} aria-label={label} />
      </Badge>
    </Tooltip>
  );
}
