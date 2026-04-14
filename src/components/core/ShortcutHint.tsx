import { AspectRatio, Box, HStack, Icon, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";

type ShortcutHintProps = {
  label: string;
  icon?: IconType;
  shape?: "default" | "square";
  pressed?: boolean;
};

export function ShortcutHint({
  label,
  icon,
  shape = "default",
  pressed = false,
}: ShortcutHintProps) {
  const isSquare = shape === "square";

  const content = (
    <>
      {icon ? <Icon as={icon} boxSize={3} /> : null}
      <Text as={"span"} color={"inherit"} textTransform={"uppercase"} lineHeight={1}>
        {label}
      </Text>
    </>
  );

  if (isSquare) {
    return (
      <AspectRatio ratio={1} w={"1.35rem"} flexShrink={0}>
        <Box
          as={"kbd"}
          w={"full"}
          h={"full"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"center"}
          rounded={"md"}
          borderWidth={"1px"}
          borderBottomWidth={pressed ? "1px" : "3px"}
          borderColor={"currentColor"}
          bg={"color-mix(in srgb, currentColor 10%, transparent)"}
          color={"inherit"}
          fontSize={"xs"}
          fontWeight={"semibold"}
          lineHeight={1}
          letterSpacing={"tight"}
          userSelect={"none"}
          transform={pressed ? "translateY(2px)" : undefined}
          transition={"transform 0.12s ease, border-bottom-width 0.12s ease"}
        >
          {content}
        </Box>
      </AspectRatio>
    );
  }

  return (
    <HStack
      as={"kbd"}
      minH={"1.6rem"}
      px={1.5}
      rounded={"md"}
      borderWidth={"1px"}
      borderBottomWidth={pressed ? "1px" : "3px"}
      borderColor={"currentColor"}
      bg={"color-mix(in srgb, currentColor 10%, transparent)"}
      opacity={0.85}
      fontSize={"2xs"}
      fontWeight={"semibold"}
      gap={1}
      lineHeight={1}
      flexShrink={0}
      letterSpacing={"tight"}
      userSelect={"none"}
      transform={pressed ? "translateY(2px)" : undefined}
      transition={"transform 0.12s ease, border-bottom-width 0.12s ease"}
    >
      {content}
    </HStack>
  );
}