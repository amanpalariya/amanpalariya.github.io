import { Badge, useColorModeValue, HStack, Icon, Text } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";

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
      background={useColorModeValue(`${color}.100`, `${color}.800`)}
      color={`${color}.500`}
      px={2}
      py={compact ? 2 : 1}
      rounded={"full"}
    >
      <HStack spacing={1.5}>
        <Icon as={FaCircle} boxSize={1.5} />
        {compact ? null : <Text as={"pre"}>{children?.toUpperCase()}</Text>}
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
      background={useColorModeValue(`${color}.100`, `${color}.800`)}
      color={`${color}.500`}
      px={2}
      py={1}
      rounded={"full"}
    >
      <Text as={"pre"}>{children?.toUpperCase()}</Text>
    </Badge>
  );
}
