import { HStack, Icon, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";

type ShortcutHintProps = {
  label: string;
  icon?: IconType;
};

export function ShortcutHint({ label, icon }: ShortcutHintProps) {
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