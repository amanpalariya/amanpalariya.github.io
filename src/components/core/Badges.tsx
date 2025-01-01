import { Badge, HStack, Icon, Text } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";
import { useColorModeValue } from "@components/ui/color-mode";

export function StatusBadge({
  children,
  compact = false,
  color = "gray",
}: {
  children?: string;
  color?: "red" | "blue" | "yellow" | "green" | "gray";
  compact?: boolean;
}) {
  compact = compact || !children;

  return (
    <Badge
      colorPalette={color}
      background={useColorModeValue(`colorPalette.100`, `colorPalette.800`)}
      color={useColorModeValue(`colorPalette.600`, `colorPalette.500`)}
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
  color?: "red" | "blue" | "yellow" | "green" | "gray";
}) {
  return (
    <Badge
      colorPalette={color}
      background={useColorModeValue(`colorPalette.100`, `colorPalette.800`)}
      color={`colorPalette.500`}
      px={2}
      py={1}
      rounded={"full"}
    >
      <Text as={"pre"}>{children?.toUpperCase()}</Text>
    </Badge>
  );
}
