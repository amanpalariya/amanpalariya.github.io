import { AspectRatio, Box, HStack, Icon, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";

type ShortcutHintProps = {
  label: string;
  icon?: IconType;
  shape?: "default" | "square";
};

export function ShortcutHint({ label, icon, shape = "default" }: ShortcutHintProps) {
  const isSquare = shape === "square";

  if (isSquare) {
    return (
      <AspectRatio ratio={1} w={"1.5rem"} flexShrink={0}>
        <Box
          w={"full"}
          h={"full"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"center"}
          rounded={"sm"}
          borderWidth={"1px"}
          borderColor={"currentColor"}
          opacity={0.75}
          fontSize={"2xs"}
          fontWeight={"semibold"}
          lineHeight={1}
        >
          <Text as={"span"}>{label}</Text>
        </Box>
      </AspectRatio>
    );
  }

  return (
    <HStack
      minH={"1.5rem"}
      px={1.5}
      rounded={"md"}
      borderWidth={"1px"}
      borderColor={"currentColor"}
      opacity={0.75}
      fontSize={"2xs"}
      fontWeight={"semibold"}
      gap={1}
      lineHeight={1}
      flexShrink={0}
    >
      {icon ? <Icon as={icon} boxSize={3} /> : null}
      <Text as={"span"}>{label}</Text>
    </HStack>
  );
}